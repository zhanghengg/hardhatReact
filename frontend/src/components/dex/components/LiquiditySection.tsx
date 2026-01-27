'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { CONTRACTS } from '@/config/contracts'
import { publicClient } from '../hooks'
import { useWalletClient } from '../hooks/useWalletClient'
import { useReserves } from '../hooks/useReserves'
import { useTransactionToast } from '../hooks/useTransactionToast'
import { TransactionToast, TransactionLoading } from './TransactionToast'
import type { AccountType, ConnectionMode, LiquidityAction } from '../types'

import ERC20TokenABI from '@/abi/ERC20Token.json'
import UniswapV2RouterABI from '@/abi/UniswapV2Router.json'
import UniswapV2PairABI from '@/abi/UniswapV2Pair.json'

// 防抖 hook
function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])

  // 清理
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

interface LiquiditySectionProps {
  account: AccountType
  connectionMode: ConnectionMode
  onSuccess: () => void
}

/**
 * 流动性管理组件 - 现代风格
 */
export function LiquiditySection({
  account,
  connectionMode,
  onSuccess
}: LiquiditySectionProps) {
  const [activeTab, setActiveTab] = useState<LiquidityAction>('add')

  const { getWalletClient } = useWalletClient(account, connectionMode)
  const txToast = useTransactionToast()

  const handleTabChange = (tab: LiquidityAction) => {
    setActiveTab(tab)
  }

  return (
    <div className="relative">
      {/* 交易 Loading 遮罩 */}
      <TransactionLoading
        isLoading={txToast.isLoading}
        currentStep={txToast.currentStep}
        steps={txToast.steps}
      />

      {/* Toast 通知 */}
      <TransactionToast toasts={txToast.toasts} onRemove={txToast.removeToast} />

      <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 shadow-lg overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <h3 className="text-base font-semibold">流动性</h3>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            <button
              onClick={() => handleTabChange('add')}
              disabled={txToast.isLoading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              添加
            </button>
            <button
              onClick={() => handleTabChange('remove')}
              disabled={txToast.isLoading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 cursor-pointer ${
                activeTab === 'remove'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              移除
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'add' ? (
            <AddLiquidityForm
              account={account}
              getWalletClient={getWalletClient}
              txToast={txToast}
              onSuccess={onSuccess}
            />
          ) : (
            <RemoveLiquidityForm
              account={account}
              getWalletClient={getWalletClient}
              txToast={txToast}
              onSuccess={onSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface LiquidityFormProps {
  account: AccountType
  getWalletClient: () => ReturnType<typeof useWalletClient>['getWalletClient'] extends () => infer R ? R : never
  txToast: ReturnType<typeof useTransactionToast>
  onSuccess: () => void
}

/**
 * 添加流动性表单
 */
function AddLiquidityForm({
  account,
  getWalletClient,
  txToast,
  onSuccess
}: LiquidityFormProps) {
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  
  // 获取池子储备量
  const { reserves } = useReserves()
  const reserveA = parseFloat(reserves.reserveA) || 0
  const reserveB = parseFloat(reserves.reserveB) || 0
  const hasLiquidity = reserveA > 0 && reserveB > 0

  // 根据储备量比例计算另一个代币的数量
  const calculateAmountB = useCallback((inputA: string) => {
    if (!hasLiquidity || !inputA || parseFloat(inputA) <= 0) {
      return
    }
    const ratio = reserveB / reserveA
    const calculatedB = (parseFloat(inputA) * ratio).toFixed(6)
    setAmountB(calculatedB)
  }, [hasLiquidity, reserveA, reserveB])

  const calculateAmountA = useCallback((inputB: string) => {
    if (!hasLiquidity || !inputB || parseFloat(inputB) <= 0) {
      return
    }
    const ratio = reserveA / reserveB
    const calculatedA = (parseFloat(inputB) * ratio).toFixed(6)
    setAmountA(calculatedA)
  }, [hasLiquidity, reserveA, reserveB])

  // 防抖处理
  const debouncedCalculateB = useDebouncedCallback(calculateAmountB, 300)
  const debouncedCalculateA = useDebouncedCallback(calculateAmountA, 300)

  // 处理 Token A 输入
  const handleAmountAChange = (value: string) => {
    const val = value.replace(/[^0-9.]/g, '')
    setAmountA(val)
    if (hasLiquidity && val) {
      debouncedCalculateB(val)
    }
  }

  // 处理 Token B 输入
  const handleAmountBChange = (value: string) => {
    const val = value.replace(/[^0-9.]/g, '')
    setAmountB(val)
    if (hasLiquidity && val) {
      debouncedCalculateA(val)
    }
  }

  const handleAddLiquidity = async () => {
    if (!amountA || !amountB) return

    // 开始交易，显示步骤
    txToast.startTransaction([
      '授权 TKA',
      '授权 TKB',
      '添加流动性',
      '等待交易确认'
    ])

    try {
      const walletClient = getWalletClient()
      const address = account.address

      // 步骤 1: 授权 TokenA
      const approveAHash = await walletClient.writeContract({
        address: CONTRACTS.TokenA,
        abi: ERC20TokenABI,
        functionName: 'approve',
        args: [CONTRACTS.Router, parseEther(amountA)]
      })
      await publicClient.waitForTransactionReceipt({ hash: approveAHash })

      // 步骤 2: 授权 TokenB
      txToast.updateStep(1, '授权 TKB')
      const approveBHash = await walletClient.writeContract({
        address: CONTRACTS.TokenB,
        abi: ERC20TokenABI,
        functionName: 'approve',
        args: [CONTRACTS.Router, parseEther(amountB)]
      })
      await publicClient.waitForTransactionReceipt({ hash: approveBHash })

      // 步骤 3: 添加流动性
      txToast.updateStep(2, '添加流动性')
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const addHash = await walletClient.writeContract({
        address: CONTRACTS.Router,
        abi: UniswapV2RouterABI,
        functionName: 'addLiquidity',
        args: [
          CONTRACTS.TokenA,
          CONTRACTS.TokenB,
          parseEther(amountA),
          parseEther(amountB),
          0n,
          0n,
          address,
          deadline
        ]
      })

      // 步骤 4: 等待确认
      txToast.updateStep(3, '等待交易确认')
      await publicClient.waitForTransactionReceipt({ hash: addHash })

      // 显示成功通知
      txToast.showSuccess(
        '添加流动性成功',
        addHash,
        `成功添加 ${amountA} TKA 和 ${amountB} TKB 到流动池`
      )

      setAmountA('')
      setAmountB('')
      onSuccess()
    } catch (e: unknown) {
      const errorMessage = (e as Error).message?.slice(0, 100) || '交易失败'
      txToast.showError('添加流动性失败', errorMessage)
    }
  }

  return (
    <div className="space-y-3">
      {/* Token A 输入 */}
      <div className="p-4 rounded-xl bg-muted/40">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Token A 数量</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            value={amountA}
            onChange={e => handleAmountAChange(e.target.value)}
            placeholder="0.0"
            disabled={txToast.isLoading}
            className="flex-1 bg-transparent text-xl font-medium outline-none placeholder:text-muted-foreground/50 disabled:opacity-70"
          />
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">A</div>
            <span className="font-semibold text-sm">TKA</span>
          </div>
        </div>
      </div>

      {/* 加号图标 */}
      <div className="flex justify-center">
        <div className="p-2 rounded-lg bg-muted/30">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      {/* Token B 输入 */}
      <div className="p-4 rounded-xl bg-muted/40">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Token B 数量</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            value={amountB}
            onChange={e => handleAmountBChange(e.target.value)}
            placeholder="0.0"
            disabled={txToast.isLoading}
            className="flex-1 bg-transparent text-xl font-medium outline-none placeholder:text-muted-foreground/50 disabled:opacity-70"
          />
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">B</div>
            <span className="font-semibold text-sm">TKB</span>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <Button
        className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        onClick={handleAddLiquidity}
        disabled={!amountA || !amountB || txToast.isLoading}
      >
        {txToast.isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            处理中...
          </span>
        ) : !amountA || !amountB ? (
          '输入数量'
        ) : (
          '添加流动性'
        )}
      </Button>
    </div>
  )
}

/**
 * 移除流动性表单
 */
function RemoveLiquidityForm({
  account,
  getWalletClient,
  txToast,
  onSuccess
}: LiquidityFormProps) {
  const [lpToRemove, setLpToRemove] = useState('')

  const handleRemoveLiquidity = async () => {
    if (!lpToRemove) return

    // 开始交易，显示步骤
    txToast.startTransaction([
      '授权 LP Token',
      '移除流动性',
      '等待交易确认'
    ])

    try {
      const walletClient = getWalletClient()
      const address = account.address

      // 步骤 1: 授权 LP Token
      const approveLPHash = await walletClient.writeContract({
        address: CONTRACTS.Pair,
        abi: UniswapV2PairABI,
        functionName: 'approve',
        args: [CONTRACTS.Router, parseEther(lpToRemove)]
      })
      await publicClient.waitForTransactionReceipt({ hash: approveLPHash })

      // 步骤 2: 移除流动性
      txToast.updateStep(1, '移除流动性')
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
      const removeHash = await walletClient.writeContract({
        address: CONTRACTS.Router,
        abi: UniswapV2RouterABI,
        functionName: 'removeLiquidity',
        args: [
          CONTRACTS.TokenA,
          CONTRACTS.TokenB,
          parseEther(lpToRemove),
          0n,
          0n,
          address,
          deadline
        ]
      })

      // 步骤 3: 等待确认
      txToast.updateStep(2, '等待交易确认')
      await publicClient.waitForTransactionReceipt({ hash: removeHash })

      // 显示成功通知
      txToast.showSuccess(
        '移除流动性成功',
        removeHash,
        `成功移除 ${lpToRemove} LP Token`
      )

      setLpToRemove('')
      onSuccess()
    } catch (e: unknown) {
      const errorMessage = (e as Error).message?.slice(0, 100) || '交易失败'
      txToast.showError('移除流动性失败', errorMessage)
    }
  }

  return (
    <div className="space-y-3">
      {/* LP Token 输入 */}
      <div className="p-4 rounded-xl bg-muted/40">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">LP Token 数量</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            value={lpToRemove}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9.]/g, '')
              setLpToRemove(val)
            }}
            placeholder="0.0"
            disabled={txToast.isLoading}
            className="flex-1 bg-transparent text-xl font-medium outline-none placeholder:text-muted-foreground/50 disabled:opacity-70"
          />
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-md">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">L</div>
            <span className="font-semibold text-sm">LP</span>
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-orange-600 dark:text-orange-400">
            移除流动性将按当前池子比例返还 TKA 和 TKB 代币
          </p>
        </div>
      </div>

      {/* 提交按钮 */}
      <Button
        className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
        onClick={handleRemoveLiquidity}
        disabled={!lpToRemove || txToast.isLoading}
      >
        {txToast.isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            处理中...
          </span>
        ) : !lpToRemove ? (
          '输入数量'
        ) : (
          '移除流动性'
        )}
      </Button>
    </div>
  )
}
