import { prisma } from "@/lib/db/prisma";
import { requireAuth, CONTENT_EDITORS, ADMINS_ONLY } from "@/lib/auth";
import {
  enforceRateLimit,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/lib/api-utils";
import { applicationStatusSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAuth(CONTENT_EDITORS);
    enforceRateLimit(request, "admin-write", 60);

    const { id } = await params;
    const { status } = applicationStatusSchema.parse(await parseJsonBody(request));

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    });
    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    // Applications hold personal data, so removal is permanent and admin-only.
    await requireAuth(ADMINS_ONLY);
    enforceRateLimit(request, "admin-write", 60);

    const { id } = await params;
    await prisma.application.delete({ where: { id } });
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
