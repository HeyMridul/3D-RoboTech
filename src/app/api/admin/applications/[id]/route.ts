import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  ApiError,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/lib/api-utils";
import { applicationStatusSchema } from "@/lib/validation/schemas";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/applications/[id]">,
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
      throw new ApiError(403, "Forbidden");
    }
    const { id } = await context.params;
    const data = applicationStatusSchema.parse(await parseJsonBody(request));
    return successResponse(
      await prisma.application.update({ where: { id }, data }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/applications/[id]">,
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new ApiError(403, "Forbidden");
    }
    const { id } = await context.params;
    await prisma.application.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
