import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useReadContracts } from 'wagmi'
import { CONTRACTS } from '@/config/contracts'
import { currentChain } from './useNetworkConfig'
import type { Reserves } from '../types'

import UniswapV2PairABI from '@/abi/UniswapV2Pair.json'

const initialReserves: Reserves = {
  reserveA: '0',
  reserveB: '0',
  totalSupply: '0'
}

/**
 * 获取流动性池储备量的 Hook
 * 使用 wagmi 的缓存机制，避免频繁 RPC 请求
 */
export function useReserves() {
  // 使用 wagmi 的 useReadContracts 批量读取池子信息
  const { data, refetch, isLoading } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.Pair,
        abi: UniswapV2PairABI as typeof UniswapV2PairABI,
        functionName: 'getReserves',
        chainId: currentChain.id,
      },
      {
        address: CONTRACTS.Pair,
        abi: UniswapV2PairABI as typeof UniswapV2PairABI,
        functionName: 'totalSupply',
        chainId: currentChain.id,
      },
      {
        address: CONTRACTS.Pair,
        abi: UniswapV2PairABI as typeof UniswapV2PairABI,
        functionName: 'token0',
        chainId: currentChain.id,
      },
    ],
    query: {
      staleTime: 30_000, // 30 秒内不重新请求
    },
  })

  // 计算储备量
  const reserves = useMemo<Reserves>(() => {
    if (!data) return initialReserves

    const [reservesResult, totalSupplyResult, token0Result] = data

    if (
      reservesResult?.status !== 'success' ||
      totalSupplyResult?.status !== 'success' ||
      token0Result?.status !== 'success'
    ) {
      return initialReserves
    }

    const [r0, r1] = reservesResult.result as [bigint, bigint, number]
    const totalSupply = totalSupplyResult.result as bigint
    const token0 = token0Result.result as `0x${string}`
    const isToken0A = token0.toLowerCase() === CONTRACTS.TokenA.toLowerCase()

    return {
      reserveA: formatEther(isToken0A ? r0 : r1),
      reserveB: formatEther(isToken0A ? r1 : r0),
      totalSupply: formatEther(totalSupply),
    }
  }, [data])

  // 手动刷新
  const fetchReserves = async () => {
    await refetch()
  }

  return { reserves, loading: isLoading, fetchReserves }
}
