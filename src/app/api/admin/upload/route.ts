import { prisma } from "@/lib/db/prisma";
import { requireAuth, CONTENT_EDITORS } from "@/lib/auth";
import { ApiError, enforceRateLimit, handleApiError, successResponse } from "@/lib/api-utils";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireAuth(CONTENT_EDITORS);
    enforceRateLimit(request, "upload", 20, 5 * 60_000);

    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > MAX_UPLOAD_BYTES * 1.1) {
      throw new ApiError(413, "Upload exceeds the maximum allowed size.");
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "Expected a 'file' field.");
    }

    const stored = await uploadFile(file);

    const projectId = form.get("projectId");
    const media = await prisma.media.create({
      data: {
        filename: stored.filename,
        url: stored.url,
        mimeType: stored.mimeType || "application/octet-stream",
        size: stored.size,
        projectId: typeof projectId === "string" && projectId ? projectId : null,
      },
    });

    return successResponse(media, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    await requireAuth(["ADMIN", "EDITOR", "VIEWER"]);
    const media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return successResponse({ items: media, total: media.length });
  } catch (error) {
    return handleApiError(error);
  }
}
