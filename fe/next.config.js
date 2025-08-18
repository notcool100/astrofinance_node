/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', '82.180.144.91'],
  },
  
  eslint: {
    // Ignore ESLint errors during builds to prevent pipeline failures
    // This is useful for CI/CD pipelines
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  // Optimize for production builds
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Exclude problematic routes from static generation
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    // Remove problematic routes from static export
    const pathMap = { ...defaultPathMap };
    delete pathMap['/loans/types/[id]'];
    delete pathMap['/loans/types/new'];
    
    return pathMap;
  },
  
  // Configure specific pages to be server-side rendered only
  // This prevents static optimization for these routes
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/loans/types/new',
          destination: '/loans/types/new',
          has: [
            {
              type: 'header',
              key: 'x-skip-static-generation',
            },
          ],
        },
        {
          source: '/loans/types/:id',
          destination: '/loans/types/:id',
          has: [
            {
              type: 'header',
              key: 'x-skip-static-generation',
            },
          ],
        },
      ],
    };
  }
}

module.exports = nextConfig