import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPublishedSlugs } from "@/server/services/content";

/** Content changes through the CMS, so the sitemap is generated per request. */
export const dynamic = "force-dynamic";

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
  { path: "/members", priority: 0.7, changeFrequency: "monthly" },
  { path: "/workshops", priority: 0.8, changeFrequency: "weekly" },
  { path: "/events", priority: 0.8, changeFrequency: "weekly" },
  { path: "/achievements", priority: 0.7, changeFrequency: "monthly" },
  { path: "/gallery", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/lab", priority: 0.6, changeFrequency: "monthly" },
  { path: "/join", priority: 0.9, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, members, events, workshops, posts } =
    await getPublishedSlugs();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const detail = (
    prefix: string,
    rows: { slug: string; updatedAt: Date }[],
    priority: number,
  ) =>
    rows.map((row) => ({
      url: `${siteConfig.url}${prefix}/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "monthly" as const,
      priority,
    }));

  return [
    ...entries,
    ...detail("/projects", projects, 0.8),
    ...detail("/members", members, 0.6),
    ...detail("/events", events, 0.6),
    ...detail("/workshops", workshops, 0.6),
    ...detail("/blog", posts, 0.6),
  ];
}
