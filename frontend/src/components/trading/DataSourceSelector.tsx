'use client'

import { Button } from '@/components/ui/button'
import type { DataSource } from './index'

interface DataSourceSelectorProps {
  /** 当前选中的数据源 */
  value: DataSource
  /** 数据源变化回调 */
  onChange: (source: DataSource) => void
  /** 是否禁用 */
  disabled?: boolean
}

const dataSources: { value: DataSource; label: string }[] = [
  { value: 'okx', label: 'OKX' },
  { value: 'binance', label: 'Binance' },
]

/**
 * 数据源选择器组件
 */
export function DataSourceSelector({
  value,
  onChange,
  disabled = false,
}: DataSourceSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
      {dataSources.map((source) => (
        <Button
          key={source.value}
          variant={value === source.value ? 'default' : 'ghost'}
          size="sm"
          className={`h-8 px-4 ${
            value === source.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onChange(source.value)}
          disabled={disabled}
        >
          {source.label}
        </Button>
      ))}
    </div>
  )
}

export default DataSourceSelector
