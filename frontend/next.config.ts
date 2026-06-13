import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow other devices on your local network to access the dev server
  // (e.g. testing on your phone at 10.0.0.x)
  // WHY: Next.js 16 blocks cross-origin dev access by default for security.
  // This only applies in development — production on Vercel doesn't need it.
  allowedDevOrigins: ["10.0.0.183"],
};

export default nextConfig;
