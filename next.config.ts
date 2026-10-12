import type { NextConfig } from "next";

// GitHub Pages 프로젝트 사이트는 /<저장소명> 하위 경로에서 서비스된다.
const basePath = process.env.NODE_ENV === "production" ? "/saju-service" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
