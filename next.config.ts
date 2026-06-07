import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 2678400,
  },
  reactCompiler: true,
  typedRoutes: true,
};

export default nextConfig;
