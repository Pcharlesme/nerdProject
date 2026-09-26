import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // In production this is one Render service: Next serves the public $PORT, the
  // Express API listens on 127.0.0.1:4000 only, and this rewrite is what lets the
  // browser call same-origin `/api/*` while everything actually reaches the API —
  // see server/README.md §9. Locally, run the API with `npm run dev --workspace=server`
  // (defaults to :4000) alongside `npm run dev --workspace=web`.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_ORIGIN ?? "http://127.0.0.1:4000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
