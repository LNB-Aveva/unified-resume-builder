import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getPostBySlug, getAllSlugs } from "../../lib/blog-posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogArticle({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "ResumeAI",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "ResumeAI",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${slug}`,
    },
  };

  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600 transition">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-gray-600 transition">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{post.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span aria-hidden>&middot;</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            {post.description}
          </p>
        </header>

        {/* Table of contents */}
        <aside className="rounded-xl bg-gray-50 border border-gray-100 p-5 mb-10">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            In this article
          </h2>
          <ul className="space-y-1.5">
            {post.sections.map((section, i) => (
              <li key={i}>
                <a
                  href={`#section-${i}`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Article body */}
        <article className="prose-custom">
          {post.sections.map((section, i) => (
            <section key={i} id={`section-${i}`} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {section.heading}
              </h2>
              {section.content.map((paragraph, j) => (
                <p
                  key={j}
                  className="text-gray-600 leading-relaxed mb-4 text-[0.95rem]"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>

        {/* CTA */}
        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-8 text-center my-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Check your resume now — free
          </h2>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Use our free ATS keyword extractor, gap analysis, and 15-rule
            compliance checker. No sign-up required.
          </p>
          <Link
            href="/#demo"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
          >
            Try ResumeAI Free
          </Link>
        </div>

        {/* Related articles */}
        {otherPosts.length > 0 && (
          <div className="border-t border-gray-100 pt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              More ATS guides
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {otherPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="block group"
                >
                  <article className="rounded-xl border border-gray-100 p-5 hover:border-indigo-200 transition h-full">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition mb-2">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {related.description}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
