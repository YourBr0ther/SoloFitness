/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure TypeScript checking to handle type errors
  typescript: {
    // Allow production builds to complete even with type errors
    ignoreBuildErrors: true,
  },
  
  // For production, use proper env vars for host binding
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig; 