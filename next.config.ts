import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 개발 환경에서만 소스맵 활성화
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  async rewrites() {
    // 서버 사이드에서만 사용하는 환경변수 (Docker 내부 네트워크)
    const backendUrl = process.env.BACKEND_URL || 'http://app:8080';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
