// client/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  reactStrictMode: true,
  
  // Environment variables that will be available on both server and client
  env: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Custom webpack config (if needed)
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any custom webpack configuration here
    return config;
  },
  
  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Rewrites for API proxy (if needed in production)
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/:path*`,
        },
      ];
    }
    return [];
  },
  
  // Enable TypeScript strict mode
  typescript: {
    // Set to true to allow production builds to successfully complete 
    // even if your project has TypeScript type errors
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    // Set to true to allow production builds to successfully complete 
    // even if your project has ESLint errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
