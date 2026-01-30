'use client'

import { useEffect, useRef, useCallback } from 'react'
import { BinanceDatafeed } from './datafeed'
import { OkxDatafeed } from './datafeed/okx'
import type { TVWidget, ChartingLibraryWidgetOptions, IDatafeedApi } from './types'
import type { DataSource } from './index'

// TradingView Charting Library 本地路径
const LIB_BASE = '/charting_library/'

/**
 * 动态加载脚本
 */
const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    // 避免重复加载
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load: ${src}`))
    document.body.appendChild(script)
  })

/**
 * 动态加载 CSS
 */
const loadCss = (href: string): void => {
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

/**
 * 根据数据源创建 Datafeed 实例
 */
const createDatafeed = (dataSource: DataSource): IDatafeedApi => {
  switch (dataSource) {
    case 'okx':
      return new OkxDatafeed()
    case 'binance':
    default:
      return new BinanceDatafeed()
  }
}

interface TradingViewChartProps {
  /** 交易对符号，如 BTCUSDT */
  symbol?: string
  /** K 线周期，如 '60' 表示 1 小时 */
  interval?: string
  /** 主题 */
  theme?: 'Light' | 'Dark'
  /** 数据源 */
  dataSource?: DataSource
  /** 容器类名 */
  className?: string
  /** 符号变化回调 */
  onSymbolChange?: (symbol: string) => void
  /** 周期变化回调 */
  onIntervalChange?: (interval: string) => void
}

/**
 * TradingView Charting Library 图表组件
 * 支持 OKX 和币安数据源展示 K 线图
 */
export function TradingViewChart({
  symbol = 'BTCUSDT',
  interval = '60',
  theme = 'Dark',
  dataSource = 'okx',
  className = '',
  onSymbolChange,
  onIntervalChange,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TVWidget | null>(null)
  const datafeedRef = useRef<IDatafeedApi | null>(null)
  
  // 保存回调函数的 ref，避免在 useCallback 中产生不必要的依赖
  const onSymbolChangeRef = useRef(onSymbolChange)
  const onIntervalChangeRef = useRef(onIntervalChange)
  
  useEffect(() => {
    onSymbolChangeRef.current = onSymbolChange
    onIntervalChangeRef.current = onIntervalChange
  }, [onSymbolChange, onIntervalChange])

  // 初始化图表 - 仅依赖必要的参数
  const initChart = useCallback(async () => {
    if (!containerRef.current) return
    
    // 如果 widget 已存在，不重复初始化
    if (widgetRef.current) return

    try {
      // 加载 Charting Library 资源
      loadCss(LIB_BASE + 'charting_library.css')
      await loadScript(LIB_BASE + 'charting_library.js')

      if (!containerRef.current || !window.TradingView) {
        console.error('[TradingViewChart] TradingView not loaded')
        return
      }

      // 根据数据源创建 Datafeed 实例
      datafeedRef.current = createDatafeed(dataSource)

      // Widget 配置
      const widgetOptions: ChartingLibraryWidgetOptions = {
        container: containerRef.current,
        datafeed: datafeedRef.current,
        symbol,
        interval,
        library_path: LIB_BASE,
        locale: 'zh',
        theme,
        timezone: 'Asia/Shanghai',
        autosize: true,
        fullscreen: false,
        toolbar_bg: theme === 'Dark' ? '#0b1221' : '#ffffff',
        
        // 禁用的功能
        disabled_features: [
          'use_localstorage_for_settings',
          'header_compare',
          'header_undo_redo',
          'header_screenshot',
          'header_saveload',
          'display_market_status',
          'control_bar',
          'timeframes_toolbar',
        ],
        
        // 启用的功能
        enabled_features: [
          'hide_left_toolbar_by_default',
        ],
        
        // 主题覆盖
        overrides: theme === 'Dark' ? {
          'paneProperties.background': '#0b1221',
          'paneProperties.backgroundType': 'solid',
          'scalesProperties.backgroundColor': '#0b1221',
          'scalesProperties.textColor': '#AAA',
        } : {},
      }

      // 创建 Widget 实例
      widgetRef.current = new window.TradingView.widget(widgetOptions)

      // 图表就绪后的回调
      widgetRef.current.onChartReady(() => {
        console.log('[TradingViewChart] Chart ready with', dataSource)
        
        const chart = widgetRef.current?.chart()
        if (!chart) return

        // 监听周期变化
        chart.onIntervalChanged().subscribe(null, (newInterval) => {
          console.log('[TradingViewChart] Interval changed:', newInterval)
          onIntervalChangeRef.current?.(newInterval)
        })

        // 监听符号变化
        chart.onSymbolChanged().subscribe(null, (symbolInfo) => {
          // @ts-expect-error symbolInfo 类型不完整
          const newSymbol = symbolInfo?.name || symbolInfo?.ticker
          if (newSymbol) {
            console.log('[TradingViewChart] Symbol changed:', newSymbol)
            onSymbolChangeRef.current?.(newSymbol)
          }
        })
      })
    } catch (error) {
      console.error('[TradingViewChart] Init error:', error)
    }
  }, [symbol, interval, theme, dataSource])

  // 初始化
  useEffect(() => {
    initChart()

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove()
        } catch (e) {
          console.error('[TradingViewChart] Remove error:', e)
        }
        widgetRef.current = null
      }
    }
  }, [initChart])

  // 符号/周期变化时更新图表
  useEffect(() => {
    if (widgetRef.current) {
      try {
        widgetRef.current.setSymbol(symbol, interval, () => {
          console.log('[TradingViewChart] Symbol/interval updated')
        })
      } catch (e) {
        // 图表可能还未就绪
      }
    }
  }, [symbol, interval])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[400px] ${className}`}
      style={{ minHeight: 400 }}
    />
  )
}

export default TradingViewChart
