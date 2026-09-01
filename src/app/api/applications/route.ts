import { applicationSchema } from "@/lib/validation/schemas";
import {
  handleApiError,
  successResponse,
  rateLimit,
  getClientIp,
  parseJsonBody,
  sanitizeString,
} from "@/lib/api-utils";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`application:${ip}`, 3, 60_000)) {
      return successResponse({ error: "Too many requests" }, 429);
    }

    const body = await parseJsonBody(request);
    const data = applicationSchema.parse(body);

    const application = await prisma.application.create({
      data: {
        name: sanitizeString(data.name),
        email: data.email.toLowerCase(),
        year: sanitizeString(data.year),
        branch: sanitizeString(data.branch),
        interests: data.interests.map(sanitizeString),
        skills: data.skills.map(sanitizeString),
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        message: sanitizeString(data.message),
      },
    });

    return successResponse({ id: application.id, message: "Application submitted" }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  return successResponse({ error: "Method not allowed" }, 405);
}
