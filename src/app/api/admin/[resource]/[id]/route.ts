import { handleApiError, successResponse, enforceRateLimit } from "@/lib/api-utils";
import {
  deleteResourceItem,
  getResourceItem,
  updateResourceItem,
} from "@/server/admin/crud";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ resource: string; id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { resource, id } = await params;
    return successResponse(await getResourceItem(resource, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { resource, id } = await params;
    enforceRateLimit(request, "admin-write", 60);
    return successResponse(await updateResourceItem(resource, id, request));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { resource, id } = await params;
    enforceRateLimit(request, "admin-write", 60);
    await deleteResourceItem(resource, id);
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
