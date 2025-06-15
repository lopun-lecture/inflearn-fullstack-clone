import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "300mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.CLOUDFRONT_DOMAIN as string,
      },
      {
        protocol: "https",
        hostname: "cdn.inflearn.com",
      },
    ],
  },
};

export default nextConfig;
