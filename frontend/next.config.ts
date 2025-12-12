import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // React Compiler 需要 React 19，已禁用
  // reactCompiler: true,

  // Cloudflare Pages SSR 部署
  images: {
    unoptimized: true
  },

  // 解决 wagmi 的 @base-org/account 模块问题
  webpack: config => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@base-org/account': false
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  }
}

export default nextConfig
