import { contactSchema } from "@/lib/validation/schemas";
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
    if (!rateLimit(`contact:${ip}`, 5, 60_000)) {
      return successResponse({ error: "Too many requests" }, 429);
    }

    const body = await parseJsonBody(request);
    const data = contactSchema.parse(body);

    const message = await prisma.contactMessage.create({
      data: {
        name: sanitizeString(data.name),
        email: data.email.toLowerCase(),
        subject: data.subject ? sanitizeString(data.subject) : null,
        message: sanitizeString(data.message),
      },
    });

    return successResponse({ id: message.id, message: "Message sent" }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
