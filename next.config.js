const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

/**
 * @type {import('next').NextConfig}
 */
module.exports = withBundleAnalyzer({
    typescript: {
        ignoreBuildErrors: true
    },
    env: {
        stackbitPreview: process.env.STACKBIT_PREVIEW
    },
    trailingSlash: true,
    reactStrictMode: true,
    allowedDevOrigins: ['192.168.1.84'],
    async headers() {
        // Only set long-lived cache headers in production. In development the
        // webpack hot-update files under `/_next/static/` must never be cached
        // by the browser otherwise HMR will request stale hashes and produce
        // repeated 404s / full reload loops.
        if (process.env.NODE_ENV !== 'production') {
            return [];
        }
        return [
            {
                source: '/_next/static/(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
            },
            {
                source: '/images/(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
            }
        ];
    },
    async rewrites() {
        return [
            {
                source: '/sitemap.xml',
                destination: '/api/sitemap.xml'
            }
        ];
    }
});
// ...existing code...
