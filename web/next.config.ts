import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: "/simulator", destination: "/landingpage/simulator" },
      { source: "/mock-portal", destination: "/landingpage/mock-portal" },
    ];
  },
};

export default nextConfig;
