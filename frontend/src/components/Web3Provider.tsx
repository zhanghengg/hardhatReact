'use client'

// Web3Provider - 目前使用 viem 直接操作，不需要 wagmi provider
// 保留此文件以便将来扩展

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
