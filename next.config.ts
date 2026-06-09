import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 2678400,
  },
  typedRoutes: true,
};

export default nextConfig;
