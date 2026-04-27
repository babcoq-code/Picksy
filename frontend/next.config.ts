import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  generateBuildId: () => `troviio-${Date.now()}`,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_BASE_URL ?? "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images-eu.ssl-images-amazon.com" },
      { protocol: "https", hostname: "fr.roborock.com" },
      { protocol: "https", hostname: "www.irobot.fr" },
      { protocol: "https", hostname: "www.ecovacs.com" },
      { protocol: "https", hostname: "www.dyson.fr" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.amazon.com" },
      { protocol: "https", hostname: "*.amazon.fr" },
      { protocol: "https", hostname: "**.fnac.com" },
      { protocol: "https", hostname: "**.boulanger.com" },
      { protocol: "https", hostname: "**.cdiscount.com" },
      { protocol: "https", hostname: "**.darty.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
