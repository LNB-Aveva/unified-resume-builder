import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "../lib/blog-posts";

export const metadata: Metadata = {
  title: "ATS Resume Tips & Guides",
  description:
    "Practical guides on beating ATS filters, finding the right resume keywords, " +
    "and optimising your resume for Applicant Tracking Systems. Free advice from ResumeAI.",
  openGraph: {
    title: "ATS Resume Tips & Guides | ResumeAI",
    description:
      "Practical guides on beating ATS filters, finding resume keywords, and " +
      "optimising your resume for Applicant Tracking Systems.",
  },
};

export default function BlogIndex() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          ATS Resume Tips & Guides
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl">
          Practical, no-nonsense guides on beating ATS filters and getting your
          resume in front of real humans. Written by the team behind ResumeAI.
        </p>
      </div>

      <div className="space-y-6">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block group"
          >
            <article className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition">
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {post.description}
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                Read article
              </span>
            </article>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Ready to check your resume?
        </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
          Use our free ATS keyword extractor and compliance checker to see
          exactly why your resume is getting filtered out.
        </p>
        <Link
          href="/#demo"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
        >
          Try ResumeAI Free
        </Link>
      </div>
    </main>
  );
}
