import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/create",
        destination: "/workspace",
        permanent: true,
      },
      {
        source: "/update",
        destination: "/workspace",
        permanent: true,
      },
      {
        source: "/import",
        destination: "/workspace",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
