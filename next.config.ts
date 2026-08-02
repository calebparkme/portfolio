import type { NextConfig } from "next";

// Served from the custom domain root (calebpark.org), so no basePath needed.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
};

export default nextConfig;
