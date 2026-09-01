import { requireAuth } from "@/lib/auth";
import { ApiError, parseJsonBody } from "@/lib/api-utils";
import {
  getResourceConfig,
  isResourceName,
  resolveSlug,
  type ResourceConfig,
} from "./resources";

type Data = Record<string, unknown>;

export function getResource(name: string): ResourceConfig {
  if (!isResourceName(name)) {
    throw new ApiError(404, `Unknown resource "${name}".`);
  }
  return getResourceConfig(name);
}

/** Soft-deleted rows are invisible to every admin read. */
function baseWhere(config: ResourceConfig): Data {
  return config.softDelete ? { deletedAt: null } : {};
}

export async function listResource(name: string, url: URL) {
  const config = getResource(name);
  await requireAuth(config.readRoles);

  const search = url.searchParams.get("search")?.trim();
  const status = url.searchParams.get("status")?.trim();
  const take = Math.min(Number(url.searchParams.get("limit") ?? 100) || 100, 200);
  const skip = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);

  const where: Data = { ...baseWhere(config) };

  if (search && config.searchFields?.length) {
    where.OR = config.searchFields.map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    }));
  }
  if (status) where.publishStatus = status;

  const delegate = config.delegate();
  const [items, total] = await Promise.all([
    delegate.findMany({
      where,
      ...(config.listInclude ? { include: config.listInclude } : {}),
      ...(config.listOrderBy ? { orderBy: config.listOrderBy } : {}),
      take,
      skip,
    }),
    delegate.count({ where }),
  ]);

  return { items, total, limit: take, offset: skip };
}

export async function getResourceItem(name: string, id: string) {
  const config = getResource(name);
  await requireAuth(config.readRoles);

  const item = await config.delegate().findFirst({
    where: { id, ...baseWhere(config) },
    ...(config.listInclude ? { include: config.listInclude } : {}),
  });

  if (!item) throw new ApiError(404, `${config.label} not found.`);
  return item;
}

export async function createResourceItem(name: string, request: Request) {
  const config = getResource(name);
  const session = await requireAuth(config.writeRoles);

  const body = await parseJsonBody(request);
  const parsed = config.schema.parse(body) as Data;

  const data: Data = {
    ...(config.toCreateData ? config.toCreateData(parsed) : parsed),
  };

  const slug = resolveSlug(config, parsed);
  if (slug) data.slug = slug;
  if (config.createdByField) data[config.createdByField] = session.user.id;

  return config.delegate().create({ data });
}

export async function updateResourceItem(
  name: string,
  id: string,
  request: Request,
) {
  const config = getResource(name);
  await requireAuth(config.writeRoles);

  const existing = await config.delegate().findFirst({
    where: { id, ...baseWhere(config) },
  });
  if (!existing) throw new ApiError(404, `${config.label} not found.`);

  const body = await parseJsonBody(request);
  // PATCH semantics: validate only the fields that were sent.
  const parsed = config.schema.partial().parse(body) as Data;

  const data: Data = {
    ...(config.toUpdateData ? config.toUpdateData(parsed) : parsed),
  };

  // Only recompute the slug if the caller sent one or renamed the record.
  if (config.slugFrom && (parsed.slug || parsed[config.slugFrom])) {
    const slug = resolveSlug(config, parsed);
    if (slug) data.slug = slug;
  }

  return config.delegate().update({ where: { id }, data });
}

export async function deleteResourceItem(name: string, id: string) {
  const config = getResource(name);
  await requireAuth(config.deleteRoles);

  const existing = await config.delegate().findFirst({
    where: { id, ...baseWhere(config) },
  });
  if (!existing) throw new ApiError(404, `${config.label} not found.`);

  // Content models keep history; join/lookup tables are removed outright.
  if (config.softDelete) {
    return config.delegate().update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  return config.delegate().delete({ where: { id } });
}
