// client/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  outputFileTracingRoot: process.cwd(),
  
  // Experimental features
  experimental: {
    // Required for standalone build
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001',
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: true, // For Docker builds
  },

  // WebSocket proxy for development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/socket.io/:path*`,
      },
    ];
  },

  // Headers for CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
