import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.md": {
        as: "*.js",
        loaders: ["raw-loader"],
      },
    },
  },
  typedRoutes: true,
};

export default nextConfig;
