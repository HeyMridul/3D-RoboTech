import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/server/services/content";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const description = post.excerpt ?? post.content.slice(0, 160);
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const published = post.publishedAt ?? post.createdAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: published.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": post.author?.name ? "Person" : "Organization",
      name: post.author?.name ?? siteConfig.name,
    },
    publisher: { "@type": "Organization", name: siteConfig.name },
    ...(post.excerpt ? { description: post.excerpt } : {}),
  };

  return (
    <div className="pt-24 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="container-traic section-padding">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ButtonLink href="/blog" variant="ghost" size="sm" withArrow={false}>
            ← BUILD LOGS
          </ButtonLink>
        </nav>

        <div className="max-w-3xl">
          <p className="font-mono-label text-[10px] text-cyan mb-4">
            {formatDate(published)}
            {post.author?.name ? ` // ${post.author.name}` : ""}
          </p>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-metallic border-l-2 border-cyan/50 pl-4 mb-10">
              {post.excerpt}
            </p>
          )}

          {post.coverImage && (
            <div className="relative aspect-video mb-10 border border-card-border bg-graphite">
              <Image
                src={post.coverImage}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="text-metallic leading-relaxed whitespace-pre-line">
            {post.content}
          </div>
        </div>
      </article>
    </div>
  );
}
