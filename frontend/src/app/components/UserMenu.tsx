"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { signOut } from "@/app/actions/auth";

interface Props {
  email: string;
}

export default function UserMenu({ email }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      ref.current?.querySelector("button")?.focus();
    }
  }, []);

  useEffect(() => {
    if (open && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>("a, button");
      first?.focus();
    }
  }, [open]);

  return (
    <div className="relative" ref={ref} onKeyDown={handleKeyDown}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition"
      >
        <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400" aria-hidden="true">
            {email[0]?.toUpperCase()}
          </span>
        </div>
        <span className="max-w-[120px] truncate hidden sm:inline">{email}</span>
        <svg className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div ref={menuRef} role="menu" aria-label="Account options" className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
          <a
            href="/tools"
            role="menuitem"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Tools
          </a>
          <a
            href="/account"
            role="menuitem"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Account Settings
          </a>
          <hr className="my-1 border-gray-100 dark:border-gray-700" />
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
            >
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
