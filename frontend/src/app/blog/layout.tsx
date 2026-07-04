export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span className="font-semibold text-gray-900">ResumeAI</span>
          </a>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="/blog" className="hover:text-gray-900 transition">
              Blog
            </a>
            <a
              href="/#demo"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-white font-medium hover:bg-indigo-700 transition"
            >
              Try Free
            </a>
          </div>
        </div>
      </nav>
      {children}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto max-w-3xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">R</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">ResumeAI</span>
          </a>
          <p className="text-xs text-gray-400 text-center">
            Free ATS resume checker &mdash; 9 AI tools, no sign-up required.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-700 transition">
              Home
            </a>
            <span aria-hidden>&middot;</span>
            <a href="/blog" className="hover:text-gray-700 transition">
              Blog
            </a>
            <span aria-hidden>&middot;</span>
            <a href="/#demo" className="hover:text-gray-700 transition">
              Get started free
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
