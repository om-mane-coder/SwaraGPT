import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === "true" || process.env.EXPORT_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGithubPages ? { output: "export", basePath: "/SwaraGPT" } : {}),
  images: { unoptimized: true },
};

export default nextConfig;
