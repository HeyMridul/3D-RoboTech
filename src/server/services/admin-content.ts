import { prisma } from "@/lib/db/prisma";
import {
  achievementSchema,
  blogPostSchema,
  eventSchema,
  galleryItemSchema,
  memberSchema,
  siteSettingSchema,
  workshopSchema,
} from "@/lib/validation/schemas";
import { ApiError, sanitizeString } from "@/lib/api-utils";
import { slugify } from "@/lib/utils";

export const managedResources = [
  "members",
  "events",
  "workshops",
  "achievements",
  "blog",
  "gallery",
  "settings",
] as const;

export type ManagedResource = (typeof managedResources)[number];

export function isManagedResource(value: string): value is ManagedResource {
  return managedResources.includes(value as ManagedResource);
}

export async function listManagedResource(resource: ManagedResource) {
  switch (resource) {
    case "members":
      return prisma.member.findMany({
        where: { deletedAt: null },
        orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
      });
    case "events":
      return prisma.event.findMany({
        where: { deletedAt: null },
        orderBy: { startDate: "desc" },
      });
    case "workshops":
      return prisma.workshop.findMany({
        where: { deletedAt: null },
        orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
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
      return prisma.galleryItem.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });
    case "settings":
      return prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  }
}

export async function createManagedResource(
  resource: ManagedResource,
  input: unknown,
  userId: string,
) {
  switch (resource) {
    case "members": {
      const data = memberSchema.parse(input);
      return prisma.member.create({
        data: {
          ...data,
          slug: data.slug || slugify(data.name),
          name: sanitizeString(data.name),
          role: sanitizeString(data.role),
          bio: data.bio ? sanitizeString(data.bio) : null,
          photoUrl: data.photoUrl || null,
          githubUrl: data.githubUrl || null,
          linkedinUrl: data.linkedinUrl || null,
          portfolioUrl: data.portfolioUrl || null,
          email: data.email || null,
          skills: data.skills.map(sanitizeString),
          createdById: userId,
        },
      });
    }
    case "events": {
      const data = eventSchema.parse(input);
      return prisma.event.create({
        data: {
          ...data,
          slug: data.slug || slugify(data.title),
          title: sanitizeString(data.title),
          description: sanitizeString(data.description),
          location: data.location ? sanitizeString(data.location) : null,
          imageUrl: data.imageUrl || null,
          registrationUrl: data.registrationUrl || null,
          createdById: userId,
        },
      });
    }
    case "workshops": {
      const data = workshopSchema.parse(input);
      return prisma.workshop.create({
        data: {
          ...data,
          slug: data.slug || slugify(data.title),
          title: sanitizeString(data.title),
          description: sanitizeString(data.description),
          instructor: sanitizeString(data.instructor),
          track: sanitizeString(data.track),
          duration: data.duration ? sanitizeString(data.duration) : null,
          resources: data.resources ? sanitizeString(data.resources) : null,
          imageUrl: data.imageUrl || null,
          createdById: userId,
        },
      });
    }
    case "achievements": {
      const data = achievementSchema.parse(input);
      return prisma.achievement.create({
        data: {
          ...data,
          slug: data.slug || slugify(data.title),
          title: sanitizeString(data.title),
          description: sanitizeString(data.description),
          rank: data.rank ? sanitizeString(data.rank) : null,
          organization: data.organization
            ? sanitizeString(data.organization)
            : null,
          imageUrl: data.imageUrl || null,
          createdById: userId,
        },
      });
    }
    case "blog": {
      const data = blogPostSchema.parse(input);
      return prisma.blogPost.create({
        data: {
          ...data,
          slug: data.slug || slugify(data.title),
          title: sanitizeString(data.title),
          excerpt: data.excerpt ? sanitizeString(data.excerpt) : null,
          coverImage: data.coverImage || null,
          authorId: userId,
          publishedAt:
            data.publishStatus === "PUBLISHED" ? new Date() : null,
        },
      });
    }
    case "gallery": {
      const data = galleryItemSchema.parse(input);
      return prisma.galleryItem.create({ data });
    }
    case "settings": {
      const data = siteSettingSchema.parse(input);
      return prisma.siteSetting.create({ data });
    }
  }
}

export async function updateManagedResource(
  resource: ManagedResource,
  id: string,
  input: unknown,
) {
  switch (resource) {
    case "members": {
      const data = memberSchema.partial().parse(input);
      return prisma.member.update({ where: { id }, data });
    }
    case "events": {
      const data = eventSchema.partial().parse(input);
      return prisma.event.update({ where: { id }, data });
    }
    case "workshops": {
      const data = workshopSchema.partial().parse(input);
      return prisma.workshop.update({ where: { id }, data });
    }
    case "achievements": {
      const data = achievementSchema.partial().parse(input);
      return prisma.achievement.update({ where: { id }, data });
    }
    case "blog": {
      const data = blogPostSchema.partial().parse(input);
      return prisma.blogPost.update({
        where: { id },
        data: {
          ...data,
          publishedAt:
            data.publishStatus === "PUBLISHED" ? new Date() : undefined,
        },
      });
    }
    case "gallery": {
      const data = galleryItemSchema.partial().parse(input);
      return prisma.galleryItem.update({ where: { id }, data });
    }
    case "settings": {
      const data = siteSettingSchema.partial().parse(input);
      return prisma.siteSetting.update({ where: { id }, data });
    }
  }
}

export async function deleteManagedResource(
  resource: ManagedResource,
  id: string,
) {
  const deletedAt = new Date();
  switch (resource) {
    case "members":
      return prisma.member.update({ where: { id }, data: { deletedAt } });
    case "events":
      return prisma.event.update({ where: { id }, data: { deletedAt } });
    case "workshops":
      return prisma.workshop.update({ where: { id }, data: { deletedAt } });
    case "achievements":
      return prisma.achievement.update({ where: { id }, data: { deletedAt } });
    case "blog":
      return prisma.blogPost.update({ where: { id }, data: { deletedAt } });
    case "gallery":
      return prisma.galleryItem.delete({ where: { id } });
    case "settings":
      return prisma.siteSetting.delete({ where: { id } });
    default:
      throw new ApiError(404, "Unknown CMS resource");
  }
}
