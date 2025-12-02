import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // React Compiler 需要 React 19，已禁用
  // reactCompiler: true,

  // Cloudflare Pages SSR 部署
  images: {
    unoptimized: true
  }
}

export default nextConfig
