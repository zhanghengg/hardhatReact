import { useCallback } from 'react'
import { createWalletClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { currentChain, rpcUrl } from './useNetworkConfig'
import type { AccountType, ConnectionMode } from '../types'

/**
 * 创建钱包客户端的 Hook
 * 根据连接模式返回对应的钱包客户端工厂函数
 */
export function useWalletClient(
  account: AccountType | null,
  connectionMode: ConnectionMode
) {
  const getWalletClient = useCallback(() => {
    if (!account) {
      throw new Error('No account connected')
    }

    const address = account.address

    // 钱包连接模式
    if (
      connectionMode === 'wallet' &&
      typeof window !== 'undefined' &&
      window.ethereum
    ) {
      return createWalletClient({
        account: address,
        chain: currentChain,
        transport: custom(window.ethereum)
      })
    }

    // 测试账户模式
    return createWalletClient({
      account: account as ReturnType<typeof privateKeyToAccount>,
      chain: currentChain,
      transport: http(rpcUrl)
    })
  }, [account, connectionMode])

  return { getWalletClient }
}
