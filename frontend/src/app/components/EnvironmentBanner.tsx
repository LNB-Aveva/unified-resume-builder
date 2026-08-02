"use client";

const env = process.env.NEXT_PUBLIC_SENTRY_ENV || "production";

export default function EnvironmentBanner() {
  if (env === "production") return null;

  return (
    <div className="bg-amber-500 text-black text-center text-xs font-semibold py-1 px-2 z-[200] relative">
      {env.toUpperCase()} ENVIRONMENT
    </div>
  );
}
