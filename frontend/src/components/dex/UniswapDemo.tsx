'use client'

import { useState, useEffect } from 'react'
import { privateKeyToAccount } from 'viem/accounts'
import { isContractsDeployed } from '@/config/contracts'
import { TEST_ACCOUNTS, DEMO_TEST_ACCOUNT } from '@/config/wagmi'

// Hooks
import { useSepoliaNetwork, useBalances } from './hooks'

// Components
import {
  NotDeployed,
  NetworkIndicator,
  AccountInfo,
  BalanceSection,
  SwapSection,
  LiquiditySection
} from './components'

// Types
import type { AccountType, ConnectionMode } from './types'

/**
 * Uniswap DEX 演示组件
 * 
 * 功能：
 * - 代币交换 (Swap)
 * - 添加/移除流动性 (Liquidity)
 * - 查看池子信息和余额
 * 
 * 注意：使用 wagmi 的缓存机制，数据会在 staleTime 内缓存
 * 不会频繁发起 RPC 请求
 */
export function UniswapDemo() {
  const [mounted, setMounted] = useState(false)
  const [account, setAccount] = useState<AccountType | null>(null)
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('test')

  // 使用 wagmi hooks - 数据会自动缓存，不需要手动触发查询
  const { balances, fetchBalances, isRefreshing } = useBalances(account)

  // 自动连接 Demo 账户（仅在客户端执行）
  useEffect(() => {
    setMounted(true)
    const testKey = useSepoliaNetwork
      ? DEMO_TEST_ACCOUNT.privateKey
      : TEST_ACCOUNTS[0].privateKey
    const acc = privateKeyToAccount(testKey)
    setAccount(acc)
    setConnectionMode('test')
  }, [])

  // 注意：不再需要 useEffect 来手动触发 fetchBalances
  // wagmi 的 useBalance 和 useReadContracts 会在 account 改变时自动重新查询
  // 并且会在 staleTime 内使用缓存数据

  // 操作成功后的回调 - 手动刷新余额
  const handleSuccess = () => {
    fetchBalances()
  }

  // 服务端渲染保护
  if (!mounted) return null

  // 合约未部署时显示提示
  if (!isContractsDeployed()) {
    return <NotDeployed />
  }

  return (
    <div className="space-y-6">
      <NetworkIndicator />

      {account && <AccountInfo account={account} />}

      {account && (
        <>
          <BalanceSection balances={balances} onRefresh={fetchBalances} isRefreshing={isRefreshing} />

          <SwapSection
            account={account}
            connectionMode={connectionMode}
            onSuccess={handleSuccess}
          />

          <LiquiditySection
            account={account}
            connectionMode={connectionMode}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  )
}

// Window ethereum 类型声明
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}
