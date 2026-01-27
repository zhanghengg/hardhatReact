'use client'

import { useState, useMemo, useDeferredValue, useRef, useEffect } from 'react'
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

// 预设滑点选项 (-1 表示无视滑点)
const SLIPPAGE_OPTIONS = [-1, 0.5, 1.0, 5.0]

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
  const [slippage, setSlippage] = useState(-1) // 默认无视滑点（教学模式）
  const [customSlippage, setCustomSlippage] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

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

  // 点击外部关闭设置面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  // 处理滑点选择
  const handleSlippageSelect = (value: number) => {
    setSlippage(value)
    setCustomSlippage('')
  }

  // 处理自定义滑点输入
  const handleCustomSlippage = (value: string) => {
    setCustomSlippage(value)
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0 && num <= 100) {
      setSlippage(num)
    }
  }

  // 计算最小输出量（考虑滑点，-1 表示无视滑点）
  const minAmountOut = useMemo(() => {
    if (!expectedOut || parseFloat(expectedOut) <= 0) return '0'
    // 无视滑点时返回 0
    if (slippage === -1) return '0'
    const slippageMultiplier = 1 - slippage / 100
    return (parseFloat(expectedOut) * slippageMultiplier).toFixed(6)
  }, [expectedOut, slippage])

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
      // 使用滑点计算最小输出量
      const minOut = parseEther(minAmountOut)
      const swapHash = await walletClient.writeContract({
        address: CONTRACTS.Router,
        abi: UniswapV2RouterABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          parseEther(amountIn),
          minOut,
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
          <div className="relative" ref={settingsRef}>
            <button 
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              title="设置"
              onClick={() => setShowSettings(!showSettings)}
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* 设置面板 */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-xl bg-card border border-border shadow-xl z-50">
                <h4 className="text-sm font-semibold mb-3">交易设置</h4>
                
                {/* 滑点容忍度 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">滑点容忍度</span>
                    <span className="text-sm font-medium">
                      {slippage === -1 ? '无视' : `${slippage}%`}
                    </span>
                  </div>
                  
                  {/* 预设选项 */}
                  <div className="grid grid-cols-4 gap-2">
                    {SLIPPAGE_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSlippageSelect(option)}
                        className={`py-1.5 px-2 text-sm rounded-lg transition-colors ${
                          slippage === option && !customSlippage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {option === -1 ? '无视' : `${option}%`}
                      </button>
                    ))}
                  </div>
                  
                  {/* 自定义输入 */}
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={customSlippage}
                      onChange={(e) => {
                        // 只允许数字和小数点
                        const val = e.target.value.replace(/[^0-9.]/g, '')
                        handleCustomSlippage(val)
                      }}
                      placeholder="自定义滑点"
                      className={`w-full py-2 px-3 text-sm rounded-lg bg-muted outline-none placeholder:text-muted-foreground/60 ${
                        customSlippage ? 'ring-1 ring-primary' : ''
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>

                  {/* 滑点警告 */}
                  {slippage === -1 && (
                    <p className="text-xs text-blue-400">教学模式：忽略滑点保护，接受任意成交价格</p>
                  )}
                  {slippage !== -1 && slippage < 0.1 && (
                    <p className="text-xs text-yellow-500">滑点过低可能导致交易失败</p>
                  )}
                  {slippage > 5 && (
                    <p className="text-xs text-orange-500">高滑点可能导致不利成交价格</p>
                  )}
                </div>
              </div>
            )}
          </div>
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
                <span className="text-muted-foreground">
                  最小获得 {slippage === -1 ? '(无视滑点)' : `(${slippage}% 滑点)`}
                </span>
                <span>
                  {slippage === -1 ? '不限制' : `${minAmountOut} ${tokenOutInfo.symbol}`}
                </span>
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
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => {
            // 只允许数字和小数点
            const val = e.target.value.replace(/[^0-9.]/g, '')
            onChange?.(val)
          }}
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
