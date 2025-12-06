import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 개발 환경에서만 소스맵 활성화
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
