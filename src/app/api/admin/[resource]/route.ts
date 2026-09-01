import { auth } from "@/lib/auth";
import {
  handleApiError,
  successResponse,
  errorResponse,
} from "@/lib/api-utils";
import {
  listResource,
  createResource,
  parseResource,
  parseBody,
} from "@/server/services/admin";
import { logger } from "@/lib/logger";

export async function GET(
  _request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  try {
    const session = await auth();
    if (!session) return errorResponse("Unauthorized", 401);

    const { resource } = await context.params;
    const items = await listResource(parseResource(resource));
    return successResponse(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { resource } = await context.params;
    const parsed = parseResource(resource);
    const body = parseBody(parsed, await request.json());
    const created = await createResource(
      parsed,
      body as Record<string, unknown>,
      session.user.id,
    );
    logger.info("Resource created", { resource: parsed, user: session.user.id });
    return successResponse(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
