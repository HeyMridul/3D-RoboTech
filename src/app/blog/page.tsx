import Link from "next/link";
import { getBlogPosts } from "@/server/services/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Engineering Log" };

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <div className="min-h-screen pt-24">
      <div className="container-traic section-padding">
        <SectionHeader
          label="ENGINEERING LOG"
          title="Notes From The Lab"
          description="Technical articles, build logs, research notes, and community updates."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="technical-panel group p-6">
              <p className="font-mono-label text-[9px] text-muted">
                {post.publishedAt ? formatDate(post.publishedAt) : "DRAFT"}
              </p>
              <h2 className="font-display mt-3 text-xl font-semibold transition-colors group-hover:text-cyan">
                {post.title}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <div className="technical-panel p-12 text-center font-mono-label text-muted">
            NO PUBLISHED LOG ENTRIES
          </div>
        )}
      </div>
    </div>
  );
}
