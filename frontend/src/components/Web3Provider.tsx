'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { config } from '@/config/wagmi'

/**
 * Web3Provider - 提供 wagmi 和 react-query 上下文
 * wagmi 自带缓存和请求去重，避免频繁的 RPC 调用
 */
export function Web3Provider({ children }: { children: React.ReactNode }) {
  // 使用 useState 确保每个请求都有独立的 QueryClient（SSR 安全）
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 数据 30 秒内不会重新请求
            staleTime: 30 * 1000,
            // 缓存 5 分钟
            gcTime: 5 * 60 * 1000,
            // 窗口聚焦时不自动重新请求
            refetchOnWindowFocus: false,
            // 重连时不自动重新请求
            refetchOnReconnect: false,
            // 失败时最多重试 1 次
            retry: 1,
          },
        },
      })
  )

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
