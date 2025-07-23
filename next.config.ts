import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 개발 환경에서만 소스맵 활성화
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  async rewrites() {
    // 개발 환경에서는 localhost:8080으로, 프로덕션에서는 app:8080으로 연결
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8080/api' 
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://app:8080/api'}`;
      
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
