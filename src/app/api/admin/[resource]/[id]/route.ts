import { auth } from "@/lib/auth";
import {
  handleApiError,
  successResponse,
  errorResponse,
} from "@/lib/api-utils";
import {
  getResourceById,
  updateResource,
  deleteResource,
  parseResource,
  parseBody,
} from "@/server/services/admin";
import { logger } from "@/lib/logger";

export async function GET(
  _request: Request,
  context: { params: Promise<{ resource: string; id: string }> },
) {
  try {
    const session = await auth();
    if (!session) return errorResponse("Unauthorized", 401);

    const { resource, id } = await context.params;
    const item = await getResourceById(parseResource(resource), id);
    return successResponse(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ resource: string; id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { resource, id } = await context.params;
    const parsed = parseResource(resource);
    const body = parseBody(parsed, await request.json(), true);
    const updated = await updateResource(
      parsed,
      id,
      body as Record<string, unknown>,
    );
    logger.info("Resource updated", { resource: parsed, id });
    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ resource: string; id: string }> },
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const { resource, id } = await context.params;
    await deleteResource(parseResource(resource), id);
    logger.info("Resource deleted", { resource, id });
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
