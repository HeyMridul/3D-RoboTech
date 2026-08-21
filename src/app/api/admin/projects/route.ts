import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { projectSchema } from "@/lib/validation/schemas";
import { handleApiError, successResponse } from "@/lib/api-utils";
import { slugify } from "@/lib/utils";
import { PublishStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return successResponse({ error: "Unauthorized" }, 401);
    }

    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        technologies: { include: { technology: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return successResponse(projects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
      return successResponse({ error: "Forbidden" }, 403);
    }

    const body = await request.json();
    const data = projectSchema.parse(body);

    const slug = data.slug || slugify(data.title);

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        excerpt: data.excerpt,
        status: data.status || "IN_PROGRESS",
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
        modelUrl: data.modelUrl,
        githubUrl: data.githubUrl || null,
        demoUrl: data.demoUrl || null,
        videoUrl: data.videoUrl || null,
        year: data.year,
        achievement: data.achievement,
        problem: data.problem,
        solution: data.solution,
        architecture: data.architecture,
        hardware: data.hardware,
        software: data.software,
        challenges: data.challenges,
        results: data.results,
        featured: data.featured ?? false,
        order: data.order ?? 0,
        publishStatus: (data.publishStatus as PublishStatus) || PublishStatus.DRAFT,
        createdById: session.user.id,
        ...(data.technologyIds?.length
          ? {
              technologies: {
                create: data.technologyIds.map((technologyId) => ({
                  technologyId,
                })),
              },
            }
          : {}),
      },
    });

    return successResponse(project, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
