import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getGalleryItems } from "@/server/services/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs from TRAIC builds, competitions, workshops and the lab.",
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="pt-24 section-padding min-h-screen">
      <div className="container-traic">
        <SectionHeader
          label="VISUAL LOG"
          title="Gallery"
          description="Builds in progress, competition days, and the lab at work."
        />

        {items.length === 0 ? (
          <div className="border border-dashed border-card-border p-16 text-center">
            <p className="font-mono-label text-[11px] text-muted mb-2">
              NO IMAGES ARCHIVED
            </p>
            <p className="text-sm text-muted">
              Photographs added through the CMS will appear here.
            </p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <li
                key={item.id}
                className="group relative border border-card-border bg-card overflow-hidden"
              >
                <div className="relative aspect-4/3 bg-graphite">
                  <Image
                    src={item.imageUrl}
                    alt={item.title ?? item.caption ?? ""}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {(item.title || item.caption || item.project) && (
                  <div className="p-4">
                    {item.title && (
                      <p className="text-sm font-medium">{item.title}</p>
                    )}
                    {item.caption && (
                      <p className="text-xs text-muted mt-1">{item.caption}</p>
                    )}
                    {item.project && (
                      <Link
                        href={`/projects/${item.project.slug}`}
                        className="inline-block mt-2 font-mono-label text-[9px] text-cyan hover:underline"
                      >
                        {item.project.title} →
                      </Link>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
