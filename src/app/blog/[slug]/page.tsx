import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/server/services/content";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="min-h-screen pt-24">
      <header className="container-traic max-w-4xl border-b border-card-border pb-12 pt-20">
        <p className="font-mono-label text-cyan">ENGINEERING LOG // {post.slug}</p>
        <h1 className="font-display mt-5 text-4xl font-bold leading-tight md:text-6xl">
          {post.title}
        </h1>
        <p className="font-mono-label mt-6 text-[10px] text-muted">
          {post.publishedAt ? formatDate(post.publishedAt) : ""}
          {post.author?.name ? ` · ${post.author.name}` : ""}
        </p>
      </header>
      <div className="container-traic section-padding max-w-3xl whitespace-pre-wrap text-base leading-8 text-muted">
        {post.content}
      </div>
    </article>
  );
}
