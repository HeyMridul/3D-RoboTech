import { handleApiError, successResponse, enforceRateLimit } from "@/lib/api-utils";
import { createResourceItem, listResource } from "@/server/admin/crud";

/** Admin data is per-request and never cached. */
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    const { resource } = await params;
    const result = await listResource(resource, new URL(request.url));
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    const { resource } = await params;
    enforceRateLimit(request, "admin-write", 60);
    const created = await createResourceItem(resource, request);
    return successResponse(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
