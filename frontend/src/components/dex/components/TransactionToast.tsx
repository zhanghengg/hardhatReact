'use client'

import { useEffect, useState } from 'react'
import { useSepoliaNetwork } from '../hooks/useNetworkConfig'
import type { ToastData, TransactionStep } from '../types'

// Sepolia 区块浏览器交易链接
const SEPOLIA_TX_EXPLORER = 'https://sepolia.etherscan.io/tx'

interface TransactionToastProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

/**
 * 交易结果 Toast 通知组件
 * 显示交易成功/失败状态和区块浏览器链接
 */
export function TransactionToast({ toasts, onRemove }: TransactionToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: ToastData
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  // 进度条动画
  useEffect(() => {
    const startTime = Date.now()
    const duration = 5000

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // 退出动画
  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 200)
  }

  const isSuccess = toast.type === 'success'
  const explorerUrl = toast.txHash && useSepoliaNetwork 
    ? `${SEPOLIA_TX_EXPLORER}/${toast.txHash}` 
    : null

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm
        transition-all duration-200 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${isSuccess 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-red-500/10 border-red-500/30'
        }
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${isSuccess ? 'bg-emerald-500/20' : 'bg-red-500/20'}
          `}>
            {isSuccess ? (
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm ${isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {toast.title}
            </h4>
            {toast.message && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {toast.message}
              </p>
            )}
            {/* 区块浏览器链接 */}
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
              >
                <span>在 Etherscan 查看</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 进度条 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20">
        <div
          className={`h-full transition-all duration-100 ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

interface TransactionLoadingProps {
  isLoading: boolean
  currentStep: string
  steps: TransactionStep[]
}

/**
 * 交易 Loading 状态组件
 * 显示当前交易步骤进度
 */
export function TransactionLoading({ isLoading, currentStep, steps }: TransactionLoadingProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
        {/* Loading 动画 */}
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-violet-500 animate-spin animation-delay-150"></div>
          </div>
        </div>

        {/* 当前步骤 */}
        <h3 className="text-center font-semibold text-lg mb-4">
          {currentStep || '处理中...'}
        </h3>

        {/* 步骤列表 */}
        {steps.length > 0 && (
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  step.status === 'executing' ? 'bg-pink-500/10' : ''
                }`}
              >
                {/* 步骤图标 */}
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                  ${step.status === 'completed' ? 'bg-emerald-500 text-white' : ''}
                  ${step.status === 'executing' ? 'bg-pink-500 text-white' : ''}
                  ${step.status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                  ${step.status === 'failed' ? 'bg-red-500 text-white' : ''}
                `}>
                  {step.status === 'completed' && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {step.status === 'executing' && (
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {step.status === 'pending' && (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                  {step.status === 'failed' && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                {/* 步骤文本 */}
                <span className={`text-sm ${
                  step.status === 'executing' ? 'font-medium text-foreground' : 
                  step.status === 'completed' ? 'text-muted-foreground' :
                  step.status === 'failed' ? 'text-red-500' :
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
