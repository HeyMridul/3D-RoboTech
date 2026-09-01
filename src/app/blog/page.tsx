import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getBlogPosts } from "@/server/services/content";
import { formatDate, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build Logs",
  description:
    "Technical write-ups, build logs and research notes from the TRAIC community.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="pt-24 section-padding min-h-screen">
      <div className="container-traic">
        <SectionHeader
          label="ENGINEERING NOTES"
          title="Build Logs"
          description="Write-ups, teardowns and research notes from the workbench."
        />

        {posts.length === 0 ? (
          <div className="border border-dashed border-card-border p-16 text-center">
            <p className="font-mono-label text-[11px] text-muted mb-2">
              NO ENTRIES PUBLISHED
            </p>
            <p className="text-sm text-muted">
              Articles written in the CMS will appear here.
            </p>
          </div>
        ) : (
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block h-full border border-card-border bg-card hover:border-cyan/40 transition-colors"
                >
                  {post.coverImage && (
                    <div className="relative aspect-video bg-graphite">
                      <Image
                        src={post.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="font-mono-label text-[9px] text-muted mb-2">
                      {post.publishedAt
                        ? formatDate(post.publishedAt)
                        : formatDate(post.createdAt)}
                      {post.author?.name ? ` // ${post.author.name}` : ""}
                    </p>
                    <h2 className="font-display text-lg font-semibold mb-2 group-hover:text-cyan transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted">
                      {post.excerpt ?? truncate(post.content, 140)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
