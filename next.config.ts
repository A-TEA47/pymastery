import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config (Next.js 16 uses Turbopack by default)
  turbopack: {},

  // Required for Pyodide WASM headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
