import { NextResponse } from "next/server";
import { ZodError } from "zod";

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

export function handleApiError(error: unknown) {
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function parseJsonBody(
  request: Request,
  maxBytes = 64 * 1024,
): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) {
    throw new ApiError(413, "Request body too large");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new ApiError(413, "Request body too large");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 10_000) {
    for (const [entryKey, value] of rateLimitMap) {
      if (value.resetAt < now) rateLimitMap.delete(entryKey);
    }
  }
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 10000);
}
