"use client";

import { useState } from "react";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#tools", label: "Tools" },
  { href: "/blog", label: "Blog" },
  { href: "#compare", label: "Compare" },
  { href: "#faq", label: "FAQ" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 shadow-lg z-50">
          <div className="px-4 py-3 space-y-1">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2 flex flex-col gap-2">
              <a
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Sign In
              </a>
              <a
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="mx-3 mb-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white text-center shadow-md"
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
