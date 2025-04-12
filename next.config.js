/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure TypeScript checking
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  // Server configuration
  // Use this for listening on all network interfaces in development
  experimental: {
    serverExternalPackages: [],
  },
  
  // For production, use proper env vars for host binding
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig; 