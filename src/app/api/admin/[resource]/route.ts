import { auth } from "@/lib/auth";
import {
  ApiError,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/lib/api-utils";
import {
  createManagedResource,
  isManagedResource,
  listManagedResource,
} from "@/server/services/admin-content";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/[resource]">,
) {
  try {
    const session = await auth();
    if (!session) throw new ApiError(401, "Unauthorized");

    const { resource } = await context.params;
    if (!isManagedResource(resource)) {
      throw new ApiError(404, "Unknown CMS resource");
    }

    return successResponse(await listManagedResource(resource));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/[resource]">,
) {
  try {
    const session = await auth();
    if (
      !session ||
      !["ADMIN", "EDITOR"].includes(session.user.role)
    ) {
      throw new ApiError(403, "Forbidden");
    }

    const { resource } = await context.params;
    if (!isManagedResource(resource)) {
      throw new ApiError(404, "Unknown CMS resource");
    }

    const data = await parseJsonBody(request);
    const result = await createManagedResource(
      resource,
      data,
      session.user.id,
    );
    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
