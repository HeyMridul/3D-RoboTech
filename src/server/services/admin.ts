import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import { ApiError } from "@/lib/api-utils";
import {
  projectSchema,
  memberSchema,
  eventSchema,
  workshopSchema,
  achievementSchema,
  blogPostSchema,
  galleryItemSchema,
  applicationStatusSchema,
  settingSchema,
} from "@/lib/validation/schemas";
import { z } from "zod";

export const ADMIN_RESOURCES = [
  "projects",
  "members",
  "events",
  "workshops",
  "achievements",
  "blog",
  "gallery",
  "media",
  "applications",
  "messages",
  "settings",
] as const;

export type AdminResource = (typeof ADMIN_RESOURCES)[number];

const schemas: Record<string, z.ZodType> = {
  projects: projectSchema,
  members: memberSchema,
  events: eventSchema,
  workshops: workshopSchema,
  achievements: achievementSchema,
  blog: blogPostSchema,
  gallery: galleryItemSchema,
  settings: settingSchema,
  applications: applicationStatusSchema,
  messages: z.object({ read: z.boolean().optional() }),
};

function toDate(value: unknown) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(String(value));
}

export function parseResource(value: string): AdminResource {
  if (!ADMIN_RESOURCES.includes(value as AdminResource)) {
    throw new ApiError(404, "Unknown resource");
  }
  return value as AdminResource;
}

export function parseBody(
  resource: AdminResource,
  body: unknown,
  partial = false,
) {
  const schema = schemas[resource];
  if (!schema) return body as Record<string, unknown>;
  const parsed =
    partial && schema instanceof z.ZodObject
      ? schema.partial().parse(body)
      : schema.parse(body);
  return parsed as Record<string, unknown>;
}

export async function listResource(resource: AdminResource) {
  switch (resource) {
    case "projects":
      return prisma.project.findMany({
        where: { deletedAt: null },
        include: { category: true },
        orderBy: { updatedAt: "desc" },
      });
    case "members":
      return prisma.member.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
    case "events":
      return prisma.event.findMany({
        where: { deletedAt: null },
        orderBy: { startDate: "desc" },
      });
    case "workshops":
      return prisma.workshop.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
    case "achievements":
      return prisma.achievement.findMany({
        where: { deletedAt: null },
        orderBy: [{ year: "desc" }, { order: "asc" }],
      });
    case "blog":
      return prisma.blogPost.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
    case "gallery":
      return prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
    case "media":
      return prisma.media.findMany({ orderBy: { createdAt: "desc" } });
    case "applications":
      return prisma.application.findMany({ orderBy: { createdAt: "desc" } });
    case "messages":
      return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    case "settings":
      return prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  }
}

export async function getResourceById(resource: AdminResource, id: string) {
  const item = await (async () => {
    switch (resource) {
      case "projects":
        return prisma.project.findFirst({
          where: { id, deletedAt: null },
          include: {
            technologies: true,
            contributors: true,
            category: true,
          },
        });
      case "members":
        return prisma.member.findFirst({ where: { id, deletedAt: null } });
      case "events":
        return prisma.event.findFirst({ where: { id, deletedAt: null } });
      case "workshops":
        return prisma.workshop.findFirst({ where: { id, deletedAt: null } });
      case "achievements":
        return prisma.achievement.findFirst({
          where: { id, deletedAt: null },
        });
      case "blog":
        return prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
      case "gallery":
        return prisma.galleryItem.findUnique({ where: { id } });
      case "media":
        return prisma.media.findUnique({ where: { id } });
      case "applications":
        return prisma.application.findUnique({ where: { id } });
      case "messages":
        return prisma.contactMessage.findUnique({ where: { id } });
      case "settings":
        return prisma.siteSetting.findUnique({ where: { id } });
    }
  })();

  if (!item) throw new ApiError(404, "Not found");
  return item;
}

function withSlug(data: Record<string, unknown>, titleKey = "title") {
  const title = data[titleKey] ?? data.name;
  if (!data.slug && typeof title === "string") {
    data.slug = slugify(title);
  }
  return data;
}

function emptyToNull(value: unknown) {
  return value === "" ? null : value;
}

export async function createResource(
  resource: AdminResource,
  raw: Record<string, unknown>,
  userId?: string,
) {
  switch (resource) {
    case "projects": {
      const { technologyIds, contributorIds, ...rest } = withSlug(raw);
      return prisma.project.create({
        data: {
          title: String(rest.title),
          slug: String(rest.slug),
          description: String(rest.description),
          excerpt: (rest.excerpt as string) ?? null,
          status: (rest.status as string) ?? "IN_PROGRESS",
          categoryId: (rest.categoryId as string) ?? null,
          imageUrl: (rest.imageUrl as string) ?? null,
          modelUrl: (rest.modelUrl as string) ?? null,
          githubUrl: emptyToNull(rest.githubUrl) as string | null,
          demoUrl: emptyToNull(rest.demoUrl) as string | null,
          videoUrl: emptyToNull(rest.videoUrl) as string | null,
          year: rest.year == null ? null : Number(rest.year),
          achievement: (rest.achievement as string) ?? null,
          problem: (rest.problem as string) ?? null,
          solution: (rest.solution as string) ?? null,
          architecture: (rest.architecture as string) ?? null,
          hardware: (rest.hardware as string) ?? null,
          software: (rest.software as string) ?? null,
          challenges: (rest.challenges as string) ?? null,
          results: (rest.results as string) ?? null,
          featured: Boolean(rest.featured ?? false),
          order: Number(rest.order ?? 0),
          publishStatus: (rest.publishStatus as never) ?? "DRAFT",
          createdById: userId ?? null,
          technologies: Array.isArray(technologyIds)
            ? {
                create: (technologyIds as string[]).map((technologyId) => ({
                  technologyId,
                })),
              }
            : undefined,
          contributors: Array.isArray(contributorIds)
            ? {
                create: (contributorIds as string[]).map((memberId) => ({
                  memberId,
                })),
              }
            : undefined,
        },
      });
    }
    case "members": {
      const data = withSlug(raw, "name");
      return prisma.member.create({
        data: {
          name: String(data.name),
          slug: String(data.slug),
          role: String(data.role),
          category: (data.category as never) ?? "MEMBER",
          bio: (data.bio as string) ?? null,
          photoUrl: (data.photoUrl as string) ?? null,
          skills: Array.isArray(data.skills) ? (data.skills as string[]) : [],
          githubUrl: emptyToNull(data.githubUrl) as string | null,
          linkedinUrl: emptyToNull(data.linkedinUrl) as string | null,
          portfolioUrl: emptyToNull(data.portfolioUrl) as string | null,
          email: emptyToNull(data.email) as string | null,
          active: Boolean(data.active ?? true),
          order: Number(data.order ?? 0),
          publishStatus: (data.publishStatus as never) ?? "PUBLISHED",
          createdById: userId,
        },
      });
    }
    case "events": {
      const data = withSlug(raw);
      return prisma.event.create({
        data: {
          title: String(data.title),
          slug: String(data.slug),
          description: String(data.description),
          type: (data.type as never) ?? "OTHER",
          location: (data.location as string) ?? null,
          startDate: toDate(data.startDate) ?? new Date(),
          endDate: toDate(data.endDate),
          imageUrl: (data.imageUrl as string) ?? null,
          registrationUrl: emptyToNull(data.registrationUrl) as string | null,
          featured: Boolean(data.featured ?? false),
          publishStatus: (data.publishStatus as never) ?? "DRAFT",
          createdById: userId,
        },
      });
    }
    case "workshops": {
      const data = withSlug(raw);
      return prisma.workshop.create({
        data: {
          title: String(data.title),
          slug: String(data.slug),
          description: String(data.description),
          instructor: String(data.instructor),
          track: String(data.track),
          level: (data.level as never) ?? "BEGINNER",
          duration: (data.duration as string) ?? null,
          startDate: toDate(data.startDate),
          resources: (data.resources as string) ?? null,
          registrationOpen: Boolean(data.registrationOpen ?? true),
          maxSeats: data.maxSeats == null ? null : Number(data.maxSeats),
          imageUrl: (data.imageUrl as string) ?? null,
          order: Number(data.order ?? 0),
          publishStatus: (data.publishStatus as never) ?? "DRAFT",
          createdById: userId,
        },
      });
    }
    case "achievements": {
      const data = withSlug(raw);
      return prisma.achievement.create({
        data: {
          title: String(data.title),
          slug: String(data.slug),
          description: String(data.description),
          year: Number(data.year),
          missionNumber:
            data.missionNumber == null ? null : Number(data.missionNumber),
          rank: (data.rank as string) ?? null,
          organization: (data.organization as string) ?? null,
          imageUrl: (data.imageUrl as string) ?? null,
          featured: Boolean(data.featured ?? false),
          order: Number(data.order ?? 0),
          publishStatus: (data.publishStatus as never) ?? "DRAFT",
          createdById: userId,
        },
      });
    }
    case "blog": {
      const data = withSlug(raw);
      return prisma.blogPost.create({
        data: {
          title: String(data.title),
          slug: String(data.slug),
          excerpt: (data.excerpt as string) ?? null,
          content: String(data.content),
          coverImage: (data.coverImage as string) ?? null,
          publishStatus: (data.publishStatus as never) ?? "DRAFT",
          publishedAt: toDate(data.publishedAt),
          authorId: userId,
        },
      });
    }
    case "gallery":
      return prisma.galleryItem.create({
        data: {
          title: (raw.title as string) ?? null,
          caption: (raw.caption as string) ?? null,
          imageUrl: String(raw.imageUrl),
          projectId: (raw.projectId as string) ?? null,
          order: Number(raw.order ?? 0),
        },
      });
    case "settings":
      return prisma.siteSetting.upsert({
        where: { key: String(raw.key) },
        update: { value: String(raw.value) },
        create: { key: String(raw.key), value: String(raw.value) },
      });
    default:
      throw new ApiError(400, "Create not supported for this resource");
  }
}

export async function updateResource(
  resource: AdminResource,
  id: string,
  raw: Record<string, unknown>,
) {
  await getResourceById(resource, id);

  switch (resource) {
    case "projects": {
      const { technologyIds, contributorIds, ...rest } = raw;
      if (Array.isArray(technologyIds)) {
        await prisma.projectTechnology.deleteMany({ where: { projectId: id } });
        await prisma.projectTechnology.createMany({
          data: (technologyIds as string[]).map((technologyId) => ({
            projectId: id,
            technologyId,
          })),
        });
      }
      if (Array.isArray(contributorIds)) {
        await prisma.projectContributor.deleteMany({ where: { projectId: id } });
        await prisma.projectContributor.createMany({
          data: (contributorIds as string[]).map((memberId) => ({
            projectId: id,
            memberId,
          })),
        });
      }
      return prisma.project.update({
        where: { id },
        data: {
          ...rest,
          githubUrl: emptyToNull(rest.githubUrl) as string | null,
          demoUrl: emptyToNull(rest.demoUrl) as string | null,
          videoUrl: emptyToNull(rest.videoUrl) as string | null,
        },
      });
    }
    case "members":
      return prisma.member.update({
        where: { id },
        data: {
          ...raw,
          githubUrl: emptyToNull(raw.githubUrl) as string | null,
          linkedinUrl: emptyToNull(raw.linkedinUrl) as string | null,
          portfolioUrl: emptyToNull(raw.portfolioUrl) as string | null,
          email: emptyToNull(raw.email) as string | null,
        },
      });
    case "events":
      return prisma.event.update({
        where: { id },
        data: {
          ...raw,
          startDate: raw.startDate ? toDate(raw.startDate) ?? undefined : undefined,
          endDate:
            raw.endDate === undefined
              ? undefined
              : toDate(raw.endDate) ?? undefined,
          registrationUrl: emptyToNull(raw.registrationUrl) as string | null,
        },
      });
    case "workshops":
      return prisma.workshop.update({
        where: { id },
        data: {
          ...raw,
          startDate:
            raw.startDate === undefined ? undefined : toDate(raw.startDate),
        },
      });
    case "achievements":
      return prisma.achievement.update({ where: { id }, data: raw });
    case "blog":
      return prisma.blogPost.update({
        where: { id },
        data: {
          ...raw,
          publishedAt:
            raw.publishedAt === undefined
              ? undefined
              : toDate(raw.publishedAt),
        },
      });
    case "gallery":
      return prisma.galleryItem.update({ where: { id }, data: raw });
    case "applications":
      return prisma.application.update({
        where: { id },
        data: { status: raw.status as never },
      });
    case "messages":
      return prisma.contactMessage.update({
        where: { id },
        data: { read: Boolean(raw.read ?? true) },
      });
    case "settings":
      return prisma.siteSetting.update({
        where: { id },
        data: { value: String(raw.value) },
      });
    default:
      throw new ApiError(400, "Update not supported for this resource");
  }
}

export async function deleteResource(resource: AdminResource, id: string) {
  await getResourceById(resource, id);

  switch (resource) {
    case "projects":
      return prisma.project.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    case "members":
      return prisma.member.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    case "events":
      return prisma.event.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    case "workshops":
      return prisma.workshop.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    case "achievements":
      return prisma.achievement.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    case "blog":
      return prisma.blogPost.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    case "gallery":
      return prisma.galleryItem.delete({ where: { id } });
    case "media":
      return prisma.media.delete({ where: { id } });
    case "applications":
      return prisma.application.delete({ where: { id } });
    case "messages":
      return prisma.contactMessage.delete({ where: { id } });
    case "settings":
      return prisma.siteSetting.delete({ where: { id } });
  }
}
