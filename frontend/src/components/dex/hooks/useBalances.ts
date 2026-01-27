import { useMemo, useState, useCallback } from 'react'
import { formatEther } from 'viem'
import { useBalance, useReadContracts } from 'wagmi'
import { CONTRACTS } from '@/config/contracts'
import { currentChain } from './useNetworkConfig'
import type { AccountType, Balances } from '../types'

import ERC20TokenABI from '@/abi/ERC20Token.json'
import UniswapV2PairABI from '@/abi/UniswapV2Pair.json'

const initialBalances: Balances = {
  eth: '0',
  tokenA: '0',
  tokenB: '0',
  lp: '0'
}

/**
 * 获取用户代币余额的 Hook
 * 使用 wagmi 的缓存机制，避免频繁 RPC 请求
 */
export function useBalances(account: AccountType | null) {
  const address = account?.address

  // 使用 wagmi 的 useBalance 获取 ETH 余额
  const { data: ethBalance, refetch: refetchEth, isLoading: isLoadingEth } = useBalance({
    address,
    chainId: currentChain.id,
    query: {
      enabled: !!address,
      staleTime: 30_000, // 30 秒内不重新请求
    },
  })

  // 使用 wagmi 的 useReadContracts 批量读取代币余额
  // wagmi 会自动使用 multicall 合并请求
  const { data: tokenBalances, refetch: refetchTokens, isLoading: isLoadingTokens } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.TokenA,
        abi: ERC20TokenABI as typeof ERC20TokenABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: currentChain.id,
      },
      {
        address: CONTRACTS.TokenB,
        abi: ERC20TokenABI as typeof ERC20TokenABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: currentChain.id,
      },
      {
        address: CONTRACTS.Pair,
        abi: UniswapV2PairABI as typeof UniswapV2PairABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: currentChain.id,
      },
    ],
    query: {
      enabled: !!address,
      staleTime: 30_000, // 30 秒内不重新请求
    },
  })

  // 组合所有余额数据
  const balances = useMemo<Balances>(() => {
    if (!ethBalance && !tokenBalances) return initialBalances

    const [tokenAResult, tokenBResult, lpResult] = tokenBalances || []

    return {
      eth: ethBalance?.value ? formatEther(ethBalance.value) : '0',
      tokenA: tokenAResult?.status === 'success' ? formatEther(tokenAResult.result as bigint) : '0',
      tokenB: tokenBResult?.status === 'success' ? formatEther(tokenBResult.result as bigint) : '0',
      lp: lpResult?.status === 'success' ? formatEther(lpResult.result as bigint) : '0',
    }
  }, [ethBalance, tokenBalances])

  // 手动刷新状态
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 手动刷新所有余额
  const fetchBalances = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([refetchEth(), refetchTokens()])
    } finally {
      setIsRefreshing(false)
    }
  }, [refetchEth, refetchTokens])

  return { 
    balances, 
    loading: isLoadingEth || isLoadingTokens,
    isRefreshing,
    fetchBalances 
  }
}
