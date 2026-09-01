import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getResourceConfig, isResourceName, type ResourceName } from "@/server/admin/resources";
import { RESOURCE_UI, type ResourceUi } from "../_config/resource-ui";
import type { OptionSets } from "../_components/ResourceForm";

export function resolveResource(name: string): {
  resource: ResourceName;
  ui: ResourceUi;
} {
  if (!isResourceName(name)) notFound();
  return { resource: name, ui: RESOURCE_UI[name] };
}

/** Rows for the list view. Reads directly rather than round-tripping the API. */
export async function loadRows(resource: ResourceName) {
  const config = getResourceConfig(resource);
  try {
    return (await config.delegate().findMany({
      where: config.softDelete ? { deletedAt: null } : {},
      ...(config.listInclude ? { include: config.listInclude } : {}),
      ...(config.listOrderBy ? { orderBy: config.listOrderBy } : {}),
      take: 500,
    })) as Record<string, unknown>[];
  } catch (error) {
    console.error(`[admin] failed to load ${resource}`, error);
    return [];
  }
}

export async function loadRecord(resource: ResourceName, id: string) {
  const config = getResourceConfig(resource);
  const record = (await config.delegate().findFirst({
    where: { id, ...(config.softDelete ? { deletedAt: null } : {}) },
    ...(config.listInclude ? { include: config.listInclude } : {}),
  })) as Record<string, unknown> | null;

  if (!record) notFound();
  return record;
}

/**
 * Only fetches the lookup lists a resource's form actually references, so
 * simple resources do not pay for four extra queries.
 */
export async function loadOptionSets(ui: ResourceUi): Promise<OptionSets> {
  const needed = new Set(
    ui.fields.map((f) => f.optionsFrom).filter(Boolean) as string[],
  );
  const sets: OptionSets = {};
  if (needed.size === 0) return sets;

  try {
    await Promise.all([
      needed.has("categories") &&
        prisma.category
          .findMany({ orderBy: { order: "asc" } })
          .then((rows) => {
            sets.categories = rows.map((r) => ({ value: r.id, label: r.name }));
          }),
      needed.has("technologies") &&
        prisma.technology
          .findMany({ orderBy: { name: "asc" } })
          .then((rows) => {
            sets.technologies = rows.map((r) => ({ value: r.id, label: r.name }));
          }),
      needed.has("members") &&
        prisma.member
          .findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } })
          .then((rows) => {
            sets.members = rows.map((r) => ({ value: r.id, label: r.name }));
          }),
      needed.has("projects") &&
        prisma.project
          .findMany({ where: { deletedAt: null }, orderBy: { title: "asc" } })
          .then((rows) => {
            sets.projects = rows.map((r) => ({ value: r.id, label: r.title }));
          }),
    ]);
  } catch (error) {
    console.error("[admin] failed to load option sets", error);
  }

  return sets;
}

/**
 * Flattens join-table rows back into the id arrays the form edits, so
 * reopening a project shows its existing technologies and contributors.
 */
export function toFormValues(
  record: Record<string, unknown>,
): Record<string, unknown> {
  const values = { ...record };

  const technologies = record.technologies as
    | { technologyId: string }[]
    | undefined;
  if (Array.isArray(technologies)) {
    values.technologyIds = technologies.map((t) => t.technologyId);
  }

  const contributors = record.contributors as { memberId: string }[] | undefined;
  if (Array.isArray(contributors)) {
    values.contributorIds = contributors.map((c) => c.memberId);
  }

  return values;
}
