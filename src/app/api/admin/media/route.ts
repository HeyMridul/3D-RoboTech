import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ApiError, handleApiError, successResponse } from "@/lib/api-utils";
import { uploadFile } from "@/lib/storage";

export async function GET() {
  try {
    const session = await auth();
    if (!session) throw new ApiError(401, "Unauthorized");
    return successResponse(
      await prisma.media.findMany({ orderBy: { createdAt: "desc" } }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
      throw new ApiError(403, "Forbidden");
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "File is required");

    const uploaded = await uploadFile(file);
    const media = await prisma.media.create({
      data: {
        filename: uploaded.filename,
        url: uploaded.url,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
      },
    });
    return successResponse(media, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
