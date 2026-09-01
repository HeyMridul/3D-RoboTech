import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ApiError, handleApiError, successResponse } from "@/lib/api-utils";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/media/[id]">,
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new ApiError(403, "Forbidden");
    }

    const { id } = await context.params;
    const media = await prisma.media.delete({ where: { id } });
    await deleteFile(media.url);
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
