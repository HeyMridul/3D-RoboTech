import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  ApiError,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/lib/api-utils";
import { adminUserSchema } from "@/lib/validation/schemas";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/users/[id]">,
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new ApiError(403, "Forbidden");
    }
    const { id } = await context.params;
    const data = adminUserSchema.partial().parse(await parseJsonBody(request));
    const { password, ...fields } = data;
    return successResponse(
      await prisma.user.update({
        where: { id },
        data: {
          ...fields,
          ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
        },
        select: { id: true, email: true, name: true, role: true },
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/users/[id]">,
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new ApiError(403, "Forbidden");
    }
    const { id } = await context.params;
    if (id === session.user.id) {
      throw new ApiError(400, "You cannot deactivate your own account");
    }
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
