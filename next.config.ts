import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
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
  async redirects() {
    return [
      { source: '/charts', destination: '/songs', permanent: false },
      { source: '/charts/:id', destination: '/songs/:id?view=chart', permanent: false },
      { source: '/charts/:id/edit', destination: '/songs/:id/chart/edit', permanent: false },
      { source: '/charts/:id/advanced', destination: '/songs/:id?view=advanced', permanent: false },
      { source: '/charts/:id/advanced/edit', destination: '/songs/:id/advanced/edit', permanent: false },
      { source: '/songs/:id/chart', destination: '/songs/:id?view=chart', permanent: false },
      { source: '/songs/:id/advanced', destination: '/songs/:id?view=advanced', permanent: false },
    ];
  },
};

export default nextConfig;
