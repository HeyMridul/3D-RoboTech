import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";
import { CONTENT_EDITORS, ADMINS_ONLY } from "@/lib/auth";
import {
  achievementSchema,
  blogPostSchema,
  categorySchema,
  eventSchema,
  galleryItemSchema,
  memberSchema,
  projectSchema,
  technologySchema,
  workshopSchema,
} from "@/lib/validation/schemas";
import type { UserRole } from "@prisma/client";
import type { ZodObject } from "zod";

/**
 * Structural view of a Prisma model delegate. Every generated delegate
 * satisfies this, which lets one set of handlers serve every resource
 * instead of nine near-identical route files.
 */
export interface ModelDelegate {
  findMany(args?: Record<string, unknown>): Promise<unknown[]>;
  findFirst(args?: Record<string, unknown>): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
  delete(args: Record<string, unknown>): Promise<unknown>;
  count(args?: Record<string, unknown>): Promise<number>;
}

type Data = Record<string, unknown>;

export interface ResourceConfig {
  /** Human label used in error messages. */
  label: string;
  delegate: () => ModelDelegate;
  schema: ZodObject;
  /** Model has a deletedAt column, so removal is reversible. */
  softDelete: boolean;
  /** Field the slug is derived from when the caller does not supply one. */
  slugFrom?: string;
  /** Column receiving the creating user's id. */
  createdByField?: string;
  listInclude?: Data;
  listOrderBy?: Data | Data[];
  /** Columns scanned by the ?search= query param. */
  searchFields?: string[];
  readRoles: UserRole[];
  writeRoles: UserRole[];
  deleteRoles: UserRole[];
  /** Maps validated input onto Prisma create/update payloads. */
  toCreateData?: (data: Data) => Data;
  toUpdateData?: (data: Data) => Data;
}

/**
 * Projects own two join tables. Relations are replaced wholesale rather than
 * diffed: the admin form always submits the complete set.
 */
function projectRelations(data: Data, isUpdate: boolean): Data {
  const out: Data = {};
  const techIds = data.technologyIds as string[] | undefined;
  const contributorIds = data.contributorIds as string[] | undefined;

  if (techIds) {
    out.technologies = {
      ...(isUpdate ? { deleteMany: {} } : {}),
      create: techIds.map((technologyId) => ({ technologyId })),
    };
  }
  if (contributorIds) {
    out.contributors = {
      ...(isUpdate ? { deleteMany: {} } : {}),
      create: contributorIds.map((memberId) => ({ memberId })),
    };
  }
  return out;
}

function stripRelationKeys(data: Data): Data {
  const { technologyIds: _t, contributorIds: _c, ...rest } = data;
  void _t;
  void _c;
  return rest;
}

/** Empty strings from cleared form inputs should persist as NULL, not "". */
export function emptyStringsToNull(data: Data): Data {
  const out: Data = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = value === "" ? null : value;
  }
  return out;
}

export const RESOURCES = {
  projects: {
    label: "Project",
    delegate: () => prisma.project as unknown as ModelDelegate,
    schema: projectSchema,
    softDelete: true,
    slugFrom: "title",
    createdByField: "createdById",
    listInclude: {
      category: true,
      technologies: { include: { technology: true } },
      contributors: { include: { member: true } },
    },
    listOrderBy: { updatedAt: "desc" },
    searchFields: ["title", "description"],
    readRoles: ["ADMIN", "EDITOR", "VIEWER"],
    writeRoles: CONTENT_EDITORS,
    deleteRoles: CONTENT_EDITORS,
    toCreateData: (data) => ({
      ...stripRelationKeys(emptyStringsToNull(data)),
      ...projectRelations(data, false),
    }),
    toUpdateData: (data) => ({
      ...stripRelationKeys(emptyStringsToNull(data)),
      ...projectRelations(data, true),
    }),
  },

  members: {
    label: "Member",
    delegate: () => prisma.member as unknown as ModelDelegate,
    schema: memberSchema,
    softDelete: true,
    slugFrom: "name",
    createdByField: "createdById",
    listOrderBy: [{ order: "asc" }, { name: "asc" }],
    searchFields: ["name", "role"],
    readRoles: ["ADMIN", "EDITOR", "VIEWER"],
    writeRoles: CONTENT_EDITORS,
    deleteRoles: CONTENT_EDITORS,
    toCreateData: emptyStringsToNull,
    toUpdateData: emptyStringsToNull,
  },

  events: {
    label: "Event",
    delegate: () => prisma.event as unknown as ModelDelegate,
    schema: eventSchema,
    softDelete: true,
    slugFrom: "title",
    createdByField: "createdById",
    listOrderBy: { startDate: "desc" },
    searchFields: ["title", "description"],
    readRoles: ["ADMIN", "EDITOR", "VIEWER"],
    writeRoles: CONTENT_EDITORS,
    deleteRoles: CONTENT_EDITORS,
    toCreateData: emptyStringsToNull,
    toUpdateData: emptyStringsToNull,
  },

  workshops: {
    label: "Workshop",
    delegate: () => prisma.workshop as unknown as ModelDelegate,
    schema: workshopSchema,
    softDelete: true,
    slugFrom: "title",
    createdByField: "createdById",
    listOrderBy: [{ order: "asc" }, { title: "asc" }],
    searchFields: ["title", "instructor", "track"],
    readRoles: ["ADMIN", "EDITOR", "VIEWER"],
    writeRoles: CONTENT_EDITORS,
    deleteRoles: CONTENT_EDITORS,
    toCreateData: emptyStringsToNull,
    toUpdateData: emptyStringsToNull,
  },

  achievements: {
    label: "Achievement",
    delegate: () => prisma.achievement as unknown as ModelDelegate,
    schema: achievementSchema,
    softDelete: true,
    slugFrom: "title",
    createdByField: "createdById",
    listOrderBy: [{ year: "desc" }, { order: "asc" }],
    searchFields: ["title", "organization"],
    readRoles: ["ADMIN", "EDITOR", "VIEWER"],
    writeRoles: CONTENT_EDITORS,
    deleteRoles: CONTENT_EDITORS,
    toCreateData: emptyStringsToNull,
    toUpdateData: emptyStringsToNull,
  },

  blog: {
    label: "Blog post",
    delegate: () => prisma.blogPost as unknown as ModelDelegate,
    schema: blogPostSchema,
    softDelete: true,
    slugFrom: "title",
    createdByField: "authorId",
    listOrderBy: { updatedAt: "desc" },
    searchFields: ["title", "content"],
    readRoles: ["ADMIN", "EDITOR", "VIEWER"],
    writeRoles: CONTENT_EDITORS,
    deleteRoles: CONTENT_EDITORS,
    toCreateData: emptyStringsToNull,
    toUpdateData: emptyStringsToNull,
  },

  gallery: {
    label: "Gallery item",
    delegate: () => prisma.galleryItem as unknown as ModelDelegate,
    schema: galleryItemSchema,
    softDelete: false,
    listInclude: { project: true },
    listOrderBy: [{ order: "asc" }, { createdAt: "desc" }],
    searchFields: ["title", "caption"],
    readRoles: ["ADMIN", "EDITOR", "VIEWER"],
    writeRoles: CONTENT_EDITORS,
    deleteRoles: CONTENT_EDITORS,
    toCreateData: emptyStringsToNull,
    toUpdateData: emptyStringsToNull,
  },

  technologies: {
    label: "Technology",
    delegate: () => prisma.technology as unknown as ModelDelegate,
    schema: technologySchema,
    softDelete: false,
    slugFrom: "name",
    listOrderBy: { name: "asc" },
    searchFields: ["name"],
    readRoles: ["ADMIN", "EDITOR", "VIEWER"],
    writeRoles: CONTENT_EDITORS,
    deleteRoles: ADMINS_ONLY,
    toCreateData: emptyStringsToNull,
    toUpdateData: emptyStringsToNull,
  },

  categories: {
    label: "Category",
    delegate: () => prisma.category as unknown as ModelDelegate,
    schema: categorySchema,
    softDelete: false,
    slugFrom: "name",
    listOrderBy: { order: "asc" },
    searchFields: ["name"],
    readRoles: ["ADMIN", "EDITOR", "VIEWER"],
    writeRoles: CONTENT_EDITORS,
    deleteRoles: ADMINS_ONLY,
    toCreateData: emptyStringsToNull,
    toUpdateData: emptyStringsToNull,
  },
} satisfies Record<string, ResourceConfig>;

export type ResourceName = keyof typeof RESOURCES;

export function isResourceName(value: string): value is ResourceName {
  return Object.hasOwn(RESOURCES, value);
}

/** Derives a slug from the configured source field, when one was not given. */
export function resolveSlug(config: ResourceConfig, data: Data): string | undefined {
  if (!config.slugFrom) return undefined;
  if (typeof data.slug === "string" && data.slug.length > 0) return data.slug;
  const source = data[config.slugFrom];
  return typeof source === "string" ? slugify(source) : undefined;
}
