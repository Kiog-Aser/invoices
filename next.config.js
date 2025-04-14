/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Intentionally returning an empty array to remove the problematic redirect
    return [];
  },
  // Define which routes are static and which are dynamic
  // By default all routes are static in Next.js 13+
  staticPageGenerationTimeout: 300,
  experimental: {
    // This setting controls which routes use static or dynamic features
    serverComponentsExternalPackages: ['mongoose'],
  },
  // CORS headers applied only to API routes (dynamic)
  async headers() {
    return [
      {
        // Allow CORS for our API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  // Configure static and dynamic rendering
  output: 'standalone',
  // Skip static generation for problematic paths to avoid build errors
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // This disables image optimization for static exports
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
