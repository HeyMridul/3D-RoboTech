import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { prisma } from "@/lib/db/prisma";
import {
  handleApiError,
  successResponse,
  errorResponse,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const ip = getClientIp(request);
    if (!rateLimit(`upload:${ip}`, 20, 60_000)) {
      return errorResponse("Too many requests", 429);
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return errorResponse("No file provided", 400);
    }

    const stored = await uploadFile(file);
    const media = await prisma.media.create({
      data: {
        filename: stored.filename,
        url: stored.url,
        mimeType: stored.mimeType,
        size: stored.size,
      },
    });

    return successResponse(media, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
