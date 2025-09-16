module.exports = {
  ci: {
    collect: {
      startServerCommand: 'yarn dev',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:4000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // PWA specific
        'installable-manifest': 'error',
        'service-worker': 'error',
        'viewport': 'error',
        'themed-omnibox': 'warn',
        'content-width': 'warn',
        'apple-touch-icon': 'warn',
        'maskable-icon': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
