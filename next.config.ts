import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure TypeScript checking to handle type errors
  typescript: {
    // Allow production builds to complete even with type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
