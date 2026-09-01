import { prisma } from "@/lib/db/prisma";
import { PublishStatus } from "@prisma/client";

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[DB Query Error]", error);
    return fallback;
  }
}

export async function getSiteStats() {
  return safeQuery(
    async () => {
      const [projects, members, workshops] = await Promise.all([
        prisma.project.count({
          where: { publishStatus: PublishStatus.PUBLISHED, deletedAt: null },
        }),
        prisma.member.count({
          where: { publishStatus: PublishStatus.PUBLISHED, deletedAt: null },
        }),
        prisma.workshop.count({
          where: { publishStatus: PublishStatus.PUBLISHED, deletedAt: null },
        }),
      ]);
      return { projects, members, workshops };
    },
    { projects: 0, members: 0, workshops: 0 },
  );
}

export async function getFeaturedProjects(limit = 6) {
  return safeQuery(
    () =>
      prisma.project.findMany({
        where: {
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
          featured: true,
        },
        include: {
          category: true,
          technologies: { include: { technology: true } },
          contributors: { include: { member: true } },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: limit,
      }),
    [],
  );
}

export async function getProjects(filters?: {
  category?: string;
  search?: string;
}) {
  return safeQuery(
    () =>
      prisma.project.findMany({
        where: {
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
          ...(filters?.category && filters.category !== "ALL"
            ? { category: { slug: filters.category.toLowerCase() } }
            : {}),
          ...(filters?.search
            ? {
                OR: [
                  { title: { contains: filters.search, mode: "insensitive" } },
                  {
                    description: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        include: {
          category: true,
          technologies: { include: { technology: true } },
          contributors: { include: { member: true } },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    [],
  );
}

export async function getProjectBySlug(slug: string) {
  return safeQuery(
    () =>
      prisma.project.findFirst({
        where: {
          slug,
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
        include: {
          category: true,
          technologies: { include: { technology: true } },
          contributors: { include: { member: true } },
          gallery: { orderBy: { order: "asc" } },
          media: true,
        },
      }),
    null,
  );
}

export async function getMembers(category?: string) {
  return safeQuery(
    () =>
      prisma.member.findMany({
        where: {
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
          active: true,
          ...(category ? { category: category as never } : {}),
        },
        include: {
          projects: { include: { project: true } },
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
    [],
  );
}

export async function getMemberBySlug(slug: string) {
  return safeQuery(
    () =>
      prisma.member.findFirst({
        where: {
          slug,
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
        include: {
          projects: {
            include: {
              project: {
                include: { category: true },
              },
            },
          },
          achievements: { include: { achievement: true } },
        },
      }),
    null,
  );
}

export async function getEvents(upcoming = true) {
  return safeQuery(
    () =>
      prisma.event.findMany({
        where: {
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
          ...(upcoming ? { startDate: { gte: new Date() } } : {}),
        },
        orderBy: { startDate: "asc" },
      }),
    [],
  );
}

export async function getAllEvents() {
  return safeQuery(
    () =>
      prisma.event.findMany({
        where: {
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
        orderBy: { startDate: "desc" },
      }),
    [],
  );
}

export async function getWorkshops() {
  return safeQuery(
    () =>
      prisma.workshop.findMany({
        where: {
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
        orderBy: [{ order: "asc" }, { startDate: "asc" }],
      }),
    [],
  );
}

export async function getAchievements() {
  return safeQuery(
    () =>
      prisma.achievement.findMany({
        where: {
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
        orderBy: [{ year: "desc" }, { order: "asc" }],
      }),
    [],
  );
}

export async function getTechnologies() {
  return safeQuery(
    () => prisma.technology.findMany({ orderBy: { name: "asc" } }),
    [],
  );
}

export async function getCategories() {
  return safeQuery(
    () => prisma.category.findMany({ orderBy: { order: "asc" } }),
    [],
  );
}

export async function getBlogPosts() {
  return safeQuery(
    () =>
      prisma.blogPost.findMany({
        where: {
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
      }),
    [],
  );
}

export async function getBlogPostBySlug(slug: string) {
  return safeQuery(
    () =>
      prisma.blogPost.findFirst({
        where: {
          slug,
          publishStatus: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
        include: { author: { select: { name: true } } },
      }),
    null,
  );
}

export async function getSiteSettings() {
  return safeQuery(
    async () => {
      const settings = await prisma.siteSetting.findMany();
      return Object.fromEntries(settings.map((s) => [s.key, s.value]));
    },
    {} as Record<string, string>,
  );
}
