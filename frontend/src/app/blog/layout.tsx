import Link from "next/link";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white transition">
              Blog
            </Link>
            <Link
              href="/#demo"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-white font-medium hover:bg-indigo-700 transition"
            >
              Try Free
            </Link>
          </div>
        </div>
      </nav>
      {children}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-10">
        <div className="mx-auto max-w-3xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">R</span>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ResumeAI</span>
          </Link>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Free ATS resume checker &mdash; 9 AI tools, free account.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition">
              Home
            </Link>
            <span aria-hidden>&middot;</span>
            <Link href="/blog" className="hover:text-gray-700 dark:hover:text-gray-300 transition">
              Blog
            </Link>
            <span aria-hidden>&middot;</span>
            <Link href="/#demo" className="hover:text-gray-700 dark:hover:text-gray-300 transition">
              Get started free
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
