import { prisma } from "@/lib/db/prisma";
import { requireAuth, CONTENT_EDITORS, ADMINS_ONLY } from "@/lib/auth";
import {
  enforceRateLimit,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/lib/api-utils";
import { messageReadSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAuth(CONTENT_EDITORS);
    enforceRateLimit(request, "admin-write", 60);

    const { id } = await params;
    const { read } = messageReadSchema.parse(await parseJsonBody(request));

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { read },
    });
    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    await requireAuth(ADMINS_ONLY);
    enforceRateLimit(request, "admin-write", 60);

    const { id } = await params;
    await prisma.contactMessage.delete({ where: { id } });
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
