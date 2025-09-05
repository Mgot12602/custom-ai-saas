import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import { config } from 'dotenv';

// Only load custom env files when running locally
if (process.env.APP_ENV === 'local') {
  // Load .env.dev first
  config({ path: '.env.dev' });
  
  // Then overwrite with .env.local if it exists
  config({ path: '.env.local', override: true });
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = withNextIntl({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
});

export default nextConfig;
