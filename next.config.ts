import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        hostname: "lastfm.freetls.fastly.net",
        protocol: "https",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
