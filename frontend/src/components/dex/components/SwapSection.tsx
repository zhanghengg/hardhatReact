'use client'

import { useState, useMemo, useDeferredValue } from 'react'
import { formatEther, parseEther } from 'viem'
import { useReadContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { CONTRACTS } from '@/config/contracts'
import { currentChain, publicClient } from '../hooks'
import { useWalletClient } from '../hooks/useWalletClient'
import { useReserves } from '../hooks/useReserves'
import { useTransactionToast } from '../hooks/useTransactionToast'
import { TransactionToast, TransactionLoading } from './TransactionToast'
import type { AccountType, ConnectionMode, SwapDirection } from '../types'

import ERC20TokenABI from '@/abi/ERC20Token.json'
import UniswapV2RouterABI from '@/abi/UniswapV2Router.json'

interface SwapSectionProps {
  account: AccountType
  connectionMode: ConnectionMode
  onSuccess: () => void
}

// 代币信息配置
const TOKEN_INFO = {
  TKA: { symbol: 'TKA', name: 'Token A', color: 'from-blue-500 to-blue-600' },
  TKB: { symbol: 'TKB', name: 'Token B', color: 'from-purple-500 to-purple-600' }
}

/**
 * 代币交换组件 - Uniswap 风格界面
 */
export function SwapSection({
  account,
  connectionMode,
  onSuccess
}: SwapSectionProps) {
  const [amountIn, setAmountIn] = useState('')
  const [direction, setDirection] = useState<SwapDirection>('AtoB')

  const { getWalletClient } = useWalletClient(account, connectionMode)
  // useReserves 使用 wagmi 的缓存，不需要手动调用 fetchReserves
  const { reserves } = useReserves()
  const {
    toasts,
    isLoading,
    currentStep,
    steps,
    startTransaction,
    updateStep,
    showSuccess,
    showError,
    removeToast
  } = useTransactionToast()

  const tokenIn = direction === 'AtoB' ? CONTRACTS.TokenA : CONTRACTS.TokenB
  const tokenOut = direction === 'AtoB' ? CONTRACTS.TokenB : CONTRACTS.TokenA
  const tokenInInfo = direction === 'AtoB' ? TOKEN_INFO.TKA : TOKEN_INFO.TKB
  const tokenOutInfo = direction === 'AtoB' ? TOKEN_INFO.TKB : TOKEN_INFO.TKA

  // 使用 useDeferredValue 实现输入防抖，避免频繁请求
  const deferredAmountIn = useDeferredValue(amountIn)
  
  // 使用 wagmi 的 useReadContract 获取报价，自带缓存和去重
  const { data: quotedAmounts } = useReadContract({
    address: CONTRACTS.Router,
    abi: UniswapV2RouterABI as typeof UniswapV2RouterABI,
    functionName: 'getAmountsOut',
    args: deferredAmountIn && parseFloat(deferredAmountIn) > 0 
      ? [parseEther(deferredAmountIn), [tokenIn, tokenOut]] 
      : undefined,
    chainId: currentChain.id,
    query: {
      // 只有当输入有效时才发起查询
      enabled: !!deferredAmountIn && parseFloat(deferredAmountIn) > 0,
      // 报价数据 10 秒内有效（比余额短，因为价格变化快）
      staleTime: 10_000,
    },
  })

  // 从查询结果中提取预期输出
  const expectedOut = useMemo(() => {
    if (!quotedAmounts || !Array.isArray(quotedAmounts) || quotedAmounts.length < 2) {
      return '0'
    }
    return formatEther(quotedAmounts[1] as bigint)
  }, [quotedAmounts])

  // 计算汇率
  const rate = amountIn && parseFloat(amountIn) > 0 && parseFloat(expectedOut) > 0
    ? (parseFloat(expectedOut) / parseFloat(amountIn)).toFixed(4)
    : '0'

  // Uniswap V2 手续费率 0.3%
  const FEE_RATE = 0.003
  const FEE_MULTIPLIER = 1 - FEE_RATE // 0.997

  // 计算价格影响（纯滑点，不包含手续费）
  const priceImpact = useMemo(() => {
    const inputAmount = parseFloat(amountIn || '0')
    const outputAmount = parseFloat(expectedOut || '0')
    
    if (inputAmount <= 0 || outputAmount <= 0) {
      return { value: 0, display: '0%', color: 'text-green-500' }
    }

    // 获取对应方向的储备量
    const reserveIn = parseFloat(direction === 'AtoB' ? reserves.reserveA : reserves.reserveB)
    const reserveOut = parseFloat(direction === 'AtoB' ? reserves.reserveB : reserves.reserveA)

    if (reserveIn <= 0 || reserveOut <= 0) {
      return { value: 0, display: '0%', color: 'text-green-500' }
    }

    // 考虑手续费后的理想输出（无滑点情况下）
    // idealOutput = amountIn * 0.997 * (reserveOut / reserveIn)
    const idealOutput = inputAmount * FEE_MULTIPLIER * (reserveOut / reserveIn)
    
    // 价格影响（纯滑点）= (理想输出 - 实际输出) / 理想输出 * 100
    // 实际输出来自 getAmountsOut，已经包含了手续费和滑点
    const impact = ((idealOutput - outputAmount) / idealOutput) * 100
    const impactValue = Math.max(0, impact) // 确保非负

    // 格式化显示
    let display: string
    let color: string

    if (impactValue < 0.01) {
      display = '< 0.01%'
      color = 'text-green-500'
    } else if (impactValue < 1) {
      display = `${impactValue.toFixed(2)}%`
      color = 'text-green-500'
    } else if (impactValue < 5) {
      display = `${impactValue.toFixed(2)}%`
      color = 'text-yellow-500'
    } else if (impactValue < 10) {
      display = `${impactValue.toFixed(2)}%`
      color = 'text-orange-500'
    } else {
      display = `${impactValue.toFixed(2)}%`
      color = 'text-red-500'
    }

    return { value: impactValue, display, color }
  }, [amountIn, expectedOut, reserves, direction])

  // 切换方向
  const handleFlipDirection = () => {
    setDirection(prev => (prev === 'AtoB' ? 'BtoA' : 'AtoB'))
    setAmountIn('')
    // expectedOut 现在是计算属性，会在 amountIn 清空后自动变为 '0'
  }

  const handleSwap = async () => {
    if (!amountIn) return

    // 开始交易，显示步骤
    startTransaction([
      `授权 ${tokenInInfo.symbol}`,
      '确认交换交易',
      '等待交易确认'
    ])

    try {
      const walletClient = getWalletClient()
      const address = account.address

      // 步骤 1: 授权
      const approveHash = await walletClient.writeContract({
        address: tokenIn,
        abi: ERC20TokenABI,
        functionName: 'approve',
        args: [CONTRACTS.Router, parseEther(amountIn)]
      })
      await publicClient.waitForTransactionReceipt({ hash: approveHash })

      // 步骤 2: 交换
      updateStep(1, '确认交换交易')
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const swapHash = await walletClient.writeContract({
        address: CONTRACTS.Router,
        abi: UniswapV2RouterABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          parseEther(amountIn),
          0n,
          [tokenIn, tokenOut],
          address,
          deadline
        ]
      })

      // 步骤 3: 等待确认
      updateStep(2, '等待交易确认')
      await publicClient.waitForTransactionReceipt({ hash: swapHash })

      // 显示成功通知
      showSuccess(
        '交换成功',
        swapHash,
        `成功将 ${amountIn} ${tokenInInfo.symbol} 交换为 ${parseFloat(expectedOut).toFixed(6)} ${tokenOutInfo.symbol}`
      )
      
      setAmountIn('')
      onSuccess()
    } catch (e: unknown) {
      const errorMessage = (e as Error).message?.slice(0, 100) || '交易失败'
      showError('交换失败', errorMessage)
    }
  }

  return (
    <div className="relative">
      {/* 交易 Loading 遮罩 */}
      <TransactionLoading
        isLoading={isLoading}
        currentStep={currentStep}
        steps={steps}
      />

      {/* Toast 通知 */}
      <TransactionToast toasts={toasts} onRemove={removeToast} />

      {/* 主卡片容器 */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 shadow-lg overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <h3 className="text-base font-semibold">Swap</h3>
          <button 
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            title="设置"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-1">
          {/* 输入代币 (From) */}
          <TokenInput
            label="卖出"
            tokenInfo={tokenInInfo}
            value={amountIn}
            onChange={setAmountIn}
            editable
            disabled={isLoading}
          />

          {/* 切换方向按钮 */}
          <div className="relative flex justify-center -my-2 z-10">
            <button
              onClick={handleFlipDirection}
              title="切换交易方向"
              aria-label="切换交易方向"
              disabled={isLoading}
              className="p-2 rounded-xl bg-card border-4 border-background hover:bg-muted transition-all hover:rotate-180 duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:rotate-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* 输出代币 (To) */}
          <TokenInput
            label="买入"
            tokenInfo={tokenOutInfo}
            value={expectedOut !== '0' ? parseFloat(expectedOut).toFixed(6) : ''}
            placeholder="0"
            editable={false}
          />

          {/* 汇率信息 */}
          {amountIn && parseFloat(amountIn) > 0 && parseFloat(expectedOut) > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-muted/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">汇率</span>
                <span className="font-medium">
                  1 {tokenInInfo.symbol} = {rate} {tokenOutInfo.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">价格影响</span>
                <span className={priceImpact.color}>{priceImpact.display}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">LP 手续费</span>
                <span className="text-muted-foreground">0.30%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">最小获得</span>
                <span>{(parseFloat(expectedOut) * 0.995).toFixed(6)} {tokenOutInfo.symbol}</span>
              </div>
            </div>
          )}

          {/* 交换按钮 */}
          <Button
            className="w-full h-14 mt-3 text-base font-semibold rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50"
            onClick={handleSwap}
            disabled={!amountIn || parseFloat(amountIn) <= 0 || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                处理中...
              </span>
            ) : !amountIn || parseFloat(amountIn) <= 0 ? (
              '输入金额'
            ) : (
              'Swap'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface TokenInputProps {
  label: string
  tokenInfo: { symbol: string; name: string; color: string }
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  editable?: boolean
  disabled?: boolean
}

/**
 * 代币输入组件
 */
function TokenInput({
  label,
  tokenInfo,
  value,
  onChange,
  placeholder = '0.0',
  editable = true,
  disabled = false
}: TokenInputProps) {
  return (
    <div className="p-4 rounded-xl bg-muted/40 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={!editable || disabled}
          className="flex-1 bg-transparent text-2xl font-medium outline-none placeholder:text-muted-foreground/50 disabled:cursor-default disabled:opacity-70"
        />
        {/* 代币选择器 */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r ${tokenInfo.color} text-white shadow-md`}>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
            {tokenInfo.symbol.charAt(0)}
          </div>
          <span className="font-semibold text-sm">{tokenInfo.symbol}</span>
        </div>
      </div>
    </div>
  )
}
