'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useReserves } from '../hooks'
import type { Reserves } from '../types'

interface PoolInfoSectionProps {
  reserves?: Reserves
}

/**
 * 池子信息展示组件
 * 可以传入 reserves 或自动获取
 */
export function PoolInfoSection({ reserves: externalReserves }: PoolInfoSectionProps) {
  const { reserves: internalReserves, fetchReserves, isRefreshing } = useReserves()
  const reserves = externalReserves || internalReserves

  // 自动获取 reserves（仅在没有外部传入时）
  useEffect(() => {
    if (!externalReserves) {
      fetchReserves()
      // 每30秒刷新一次
      const interval = setInterval(fetchReserves, 30000)
      return () => clearInterval(interval)
    }
  }, [externalReserves, fetchReserves])

  const reserveA = parseFloat(reserves.reserveA)
  const reserveB = parseFloat(reserves.reserveB)
  const priceAinB = reserveA > 0 ? reserveB / reserveA : 0
  const priceBinA = reserveB > 0 ? reserveA / reserveB : 0
  const kValue = reserveA * reserveB

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            池子信息
          </span>
          <button
            onClick={fetchReserves}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="刷新"
          >
            <svg 
              className={`w-4 h-4 text-muted-foreground hover:text-foreground ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 储备量 */}
        <div className="grid grid-cols-2 gap-2">
          <ReserveItem 
            label="TKA 储备" 
            value={reserveA.toFixed(2)} 
            gradient="from-blue-500 to-blue-600"
            icon="A"
          />
          <ReserveItem 
            label="TKB 储备" 
            value={reserveB.toFixed(2)} 
            gradient="from-purple-500 to-purple-600"
            icon="B"
          />
        </div>

        {/* 价格信息 */}
        <div className="p-3 rounded-xl bg-muted/30 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TKA/TKB</span>
            <span className="font-medium tabular-nums">1 TKA = {priceAinB.toFixed(4)} TKB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TKB/TKA</span>
            <span className="font-medium tabular-nums">1 TKB = {priceBinA.toFixed(4)} TKA</span>
          </div>
        </div>

        {/* LP 和 K 值 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-pink-500/20">
            <p className="text-muted-foreground text-xs">LP 总量</p>
            <p className="font-semibold tabular-nums">{parseFloat(reserves.totalSupply).toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <p className="text-muted-foreground text-xs">K 值</p>
            <p className="font-semibold tabular-nums text-emerald-500">{formatK(kValue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ReserveItemProps {
  label: string
  value: string
  gradient: string
  icon: string
}

function ReserveItem({ label, value, gradient, icon }: ReserveItemProps) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30">
      <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

function formatK(k: number): string {
  if (k === 0) return '0'
  // 完整显示 K 值，使用千位分隔符便于阅读
  return k.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}
