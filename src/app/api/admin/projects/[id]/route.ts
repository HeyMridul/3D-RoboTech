import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ApiError, handleApiError, successResponse } from "@/lib/api-utils";
import { projectSchema } from "@/lib/validation/schemas";
import { PublishStatus } from "@prisma/client";

async function authorizeEditor() {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    throw new ApiError(403, "Forbidden");
  }
  return session;
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/projects/[id]">,
) {
  try {
    await authorizeEditor();
    const { id } = await context.params;
    const data = projectSchema.partial().parse(await request.json());
    const { technologyIds, contributorIds, publishStatus, ...fields } = data;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...fields,
        githubUrl: fields.githubUrl || null,
        demoUrl: fields.demoUrl || null,
        videoUrl: fields.videoUrl || null,
        publishStatus: publishStatus as PublishStatus | undefined,
        ...(technologyIds
          ? {
              technologies: {
                deleteMany: {},
                create: technologyIds.map((technologyId) => ({
                  technologyId,
                })),
              },
            }
          : {}),
        ...(contributorIds
          ? {
              contributors: {
                deleteMany: {},
                create: contributorIds.map((memberId) => ({ memberId })),
              },
            }
          : {}),
      },
    });
    return successResponse(project);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/projects/[id]">,
) {
  try {
    await authorizeEditor();
    const { id } = await context.params;
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date(), publishStatus: PublishStatus.ARCHIVED },
    });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
