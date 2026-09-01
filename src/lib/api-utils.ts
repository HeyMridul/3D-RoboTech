import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Single exit point for failed requests. Client-safe messages only: Zod field
 * errors and explicit ApiErrors pass through, everything else collapses to a
 * generic 500 so internal details and stack traces never reach the client.
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    // Expected control flow (401/403/404/409) — not worth a server error log
    if (error.statusCode >= 500) console.error("[API Error]", error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: flattenFieldErrors(error) },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      return NextResponse.json(
        {
          error: target
            ? `A record with that ${target} already exists.`
            : "That record already exists.",
          code: "DUPLICATE",
        },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Referenced record does not exist.", code: "BAD_REFERENCE" },
        { status: 400 },
      );
    }
  }

  console.error("[API Error]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/** Maps Zod issues to `{ field: [messages] }`, which the admin forms render inline. */
function flattenFieldErrors(error: ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                               */
/* -------------------------------------------------------------------------- */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Without this the map grows unbounded for the life of the process.
function sweepExpired(now: number) {
  if (rateLimitMap.size < 5000) return;
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Fixed-window limiter held in process memory.
 *
 * This is per-instance: it throttles a single abusive client against a single
 * server, which is what the public forms here need. A multi-instance
 * deployment should back this with Redis or an edge limiter.
 */
export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetAt });
    return { ok: true, limit, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { ok: false, limit, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    ok: true,
    limit,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/** Boolean form kept for existing call sites. */
export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  return checkRateLimit(key, limit, windowMs).ok;
}

/**
 * Throws a 429 carrying standard rate-limit headers when the caller is over
 * budget.
 */
export function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs = 60_000,
) {
  const result = checkRateLimit(`${scope}:${getClientIp(request)}`, limit, windowMs);
  if (!result.ok) {
    const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
    throw new ApiError(
      429,
      `Too many requests. Try again in ${retryAfter}s.`,
      "RATE_LIMITED",
    );
  }
  return result;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/* -------------------------------------------------------------------------- */
/* Input hygiene                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Strips angle brackets and control characters from free text before it is
 * stored. React escapes on render, so this is defence in depth for the
 * places stored text is read back outside React (exports, emails).
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 10_000);
}

/** Rejects bodies that are too large to be legitimate before parsing them. */
export async function parseJsonBody(request: Request, maxBytes = 512 * 1024) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) {
    throw new ApiError(413, "Request body too large.");
  }

  const text = await request.text();
  if (text.length > maxBytes) {
    throw new ApiError(413, "Request body too large.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
}
