import { auth } from "@/lib/auth";
import { ApiError, handleApiError, successResponse } from "@/lib/api-utils";
import {
  deleteManagedResource,
  isManagedResource,
  updateManagedResource,
} from "@/server/services/admin-content";

async function authorizeEditor() {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    throw new ApiError(403, "Forbidden");
  }
  return session;
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/[resource]/[id]">,
) {
  try {
    await authorizeEditor();
    const { resource, id } = await context.params;
    if (!isManagedResource(resource)) {
      throw new ApiError(404, "Unknown CMS resource");
    }

    const result = await updateManagedResource(
      resource,
      id,
      await request.json(),
    );
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/[resource]/[id]">,
) {
  try {
    await authorizeEditor();
    const { resource, id } = await context.params;
    if (!isManagedResource(resource)) {
      throw new ApiError(404, "Unknown CMS resource");
    }

    await deleteManagedResource(resource, id);
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
