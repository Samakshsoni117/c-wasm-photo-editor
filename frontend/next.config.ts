import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // This enables the static export feature to fix Vercel deployment
  output: 'export',
};

export default nextConfig;