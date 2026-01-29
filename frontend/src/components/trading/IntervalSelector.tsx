'use client'

import { Button } from '@/components/ui/button'

// 可选的 K 线周期
const INTERVALS = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '60', label: '1H' },
  { value: '240', label: '4H' },
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
]

interface IntervalSelectorProps {
  /** 当前选中的周期 */
  value: string
  /** 周期变化回调 */
  onChange: (interval: string) => void
  /** 类名 */
  className?: string
}

/**
 * K 线周期选择组件
 */
export function IntervalSelector({ value, onChange, className = '' }: IntervalSelectorProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {INTERVALS.map(({ value: intervalValue, label }) => (
        <Button
          key={intervalValue}
          variant={value === intervalValue ? 'default' : 'ghost'}
          size="sm"
          className="h-8 px-3 text-xs font-medium"
          onClick={() => onChange(intervalValue)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

export default IntervalSelector
