/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  images: {
    domains: [
      // Add your image domains here
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
      "avatars.githubusercontent.com",
      // Add any other domains you need
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: true,
    serverMinification: true,
    optimizeCss: true,
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'bcrypt'];  // Add any native modules here
    return config;
  },
  serverRuntimeConfig: {
    // Increase timeout for API routes
    apiTimeout: 60000, // 60 seconds
  },
};

module.exports = nextConfig;
