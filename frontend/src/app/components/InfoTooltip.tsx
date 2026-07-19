"use client";

import { useState } from "react";

export default function InfoTooltip({ tip }: { tip: string }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        aria-label="More info"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[11px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 cursor-help"
      >
        i
      </button>
      {show && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-xl bg-gray-900 dark:bg-gray-700 text-white text-xs leading-relaxed px-4 py-3 shadow-lg z-50 pointer-events-none">
          {tip}
          <span className="absolute left-1/2 -translate-x-1/2 top-full h-0 w-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-gray-900 dark:border-t-gray-700" />
        </span>
      )}
    </span>
  );
}
