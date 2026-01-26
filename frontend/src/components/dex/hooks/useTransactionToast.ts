import { useState, useCallback, useEffect } from 'react'
import { useSepoliaNetwork } from './useNetworkConfig'
import type { ToastData, TransactionStep } from '../types'

// Sepolia 区块浏览器交易链接
const SEPOLIA_TX_EXPLORER = 'https://sepolia.etherscan.io/tx'
const LOCAL_TX_EXPLORER = '' // 本地没有区块浏览器

// Toast 自动消失时间 (毫秒)
const TOAST_DURATION = 5000

/**
 * 交易 Toast 通知 Hook
 * 管理交易状态、loading 步骤和结果通知
 */
export function useTransactionToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [currentStep, setCurrentStep] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [steps, setSteps] = useState<TransactionStep[]>([])

  // 自动移除 toast
  useEffect(() => {
    if (toasts.length === 0) return

    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1))
    }, TOAST_DURATION)

    return () => clearTimeout(timer)
  }, [toasts])

  // 获取区块浏览器链接
  const getExplorerUrl = useCallback((txHash: `0x${string}`) => {
    if (useSepoliaNetwork) {
      return `${SEPOLIA_TX_EXPLORER}/${txHash}`
    }
    return null // 本地网络没有区块浏览器
  }, [])

  // 开始交易流程
  const startTransaction = useCallback((stepLabels: string[]) => {
    setIsLoading(true)
    setSteps(stepLabels.map((label, index) => ({
      label,
      status: index === 0 ? 'executing' : 'pending'
    })))
    setCurrentStep(stepLabels[0] || '')
  }, [])

  // 更新当前步骤
  const updateStep = useCallback((stepIndex: number, label?: string) => {
    setSteps(prev => prev.map((step, index) => {
      if (index < stepIndex) {
        return { ...step, status: 'completed' }
      }
      if (index === stepIndex) {
        return { ...step, status: 'executing', label: label || step.label }
      }
      return step
    }))
    setCurrentStep(label || '')
  }, [])

  // 显示成功 toast
  const showSuccess = useCallback((title: string, txHash?: `0x${string}`, message?: string) => {
    const toast: ToastData = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'success',
      title,
      message,
      txHash,
      timestamp: Date.now()
    }
    setToasts(prev => [...prev, toast])
    setIsLoading(false)
    setCurrentStep('')
    setSteps([])
  }, [])

  // 显示错误 toast
  const showError = useCallback((title: string, message?: string) => {
    const toast: ToastData = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'error',
      title,
      message,
      timestamp: Date.now()
    }
    setToasts(prev => [...prev, toast])
    setIsLoading(false)
    setCurrentStep('')
    // 将当前执行步骤标记为失败
    setSteps(prev => prev.map(step => 
      step.status === 'executing' ? { ...step, status: 'failed' } : step
    ))
  }, [])

  // 手动移除 toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // 重置状态
  const reset = useCallback(() => {
    setIsLoading(false)
    setCurrentStep('')
    setSteps([])
  }, [])

  return {
    // 状态
    toasts,
    isLoading,
    currentStep,
    steps,
    // 方法
    startTransaction,
    updateStep,
    showSuccess,
    showError,
    removeToast,
    reset,
    getExplorerUrl
  }
}
