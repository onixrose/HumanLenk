/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  transpilePackages: [
    "@humanlenk/types",
    "@humanlenk/api-client", 
    "@humanlenk/utils",
    "@humanlenk/ui"
  ],
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Image optimization
  images: {
    domains: [],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },
  
  // Compression and caching
  compress: true,
  poweredByHeader: false,
  
  // Stability improvements
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Disable problematic experimental features
    webpackBuildWorker: false,
  },
  
  // Better error handling
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Bundle analysis and path aliases
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add path alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    // PERMANENT FIX: Prevent cache corruption in development
    if (dev) {
      // Disable problematic webpack features
      config.cache = false;
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
      
      // Add fallbacks for problematic modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Prevent module resolution issues
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          default: false,
          vendors: false,
        },
      };
    }
    
    return config;
  },
  
  // Headers for performance and security
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  
  // Redirects and rewrites
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
