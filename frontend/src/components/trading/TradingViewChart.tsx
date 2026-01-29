'use client'

import { useEffect, useRef, useCallback } from 'react'
import { BinanceDatafeed } from './datafeed'
import type { TVWidget, ChartingLibraryWidgetOptions } from './types'

// TradingView Charting Library CDN 地址
const LIB_BASE = 'https://hidex.ai/res/charting_library/charting_library/'

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

interface TradingViewChartProps {
  /** 交易对符号，如 BTCUSDT */
  symbol?: string
  /** K 线周期，如 '60' 表示 1 小时 */
  interval?: string
  /** 主题 */
  theme?: 'Light' | 'Dark'
  /** 容器类名 */
  className?: string
  /** 符号变化回调 */
  onSymbolChange?: (symbol: string) => void
  /** 周期变化回调 */
  onIntervalChange?: (interval: string) => void
}

/**
 * TradingView Charting Library 图表组件
 * 使用币安数据源展示 K 线图
 */
export function TradingViewChart({
  symbol = 'BTCUSDT',
  interval = '60',
  theme = 'Dark',
  className = '',
  onSymbolChange,
  onIntervalChange,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TVWidget | null>(null)
  const datafeedRef = useRef<BinanceDatafeed | null>(null)

  // 初始化图表
  const initChart = useCallback(async () => {
    if (!containerRef.current) return

    try {
      // 加载 Charting Library 资源
      loadCss(LIB_BASE + 'charting_library.css')
      await loadScript(LIB_BASE + 'charting_library.js')

      if (!containerRef.current || !window.TradingView) {
        console.error('[TradingViewChart] TradingView not loaded')
        return
      }

      // 创建 Datafeed 实例
      datafeedRef.current = new BinanceDatafeed()

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
        console.log('[TradingViewChart] Chart ready')
        
        const chart = widgetRef.current?.chart()
        if (!chart) return

        // 添加默认指标
        chart.createStudy('Moving Average', false, false, [20])
        chart.createStudy('Volume', true, false)

        // 监听周期变化
        chart.onIntervalChanged().subscribe(null, (newInterval) => {
          console.log('[TradingViewChart] Interval changed:', newInterval)
          onIntervalChange?.(newInterval)
        })

        // 监听符号变化
        chart.onSymbolChanged().subscribe(null, (symbolInfo) => {
          // @ts-expect-error symbolInfo 类型不完整
          const newSymbol = symbolInfo?.name || symbolInfo?.ticker
          if (newSymbol) {
            console.log('[TradingViewChart] Symbol changed:', newSymbol)
            onSymbolChange?.(newSymbol)
          }
        })
      })
    } catch (error) {
      console.error('[TradingViewChart] Init error:', error)
    }
  }, [symbol, interval, theme, onSymbolChange, onIntervalChange])

  // 初始化
  useEffect(() => {
    let destroyed = false

    const init = async () => {
      if (destroyed) return
      await initChart()
    }

    init()

    return () => {
      destroyed = true
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
