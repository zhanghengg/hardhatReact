/**
 * TradingView Charting Library 类型定义
 * 基于官方 API 文档简化版本
 */

// K 线数据格式
export interface Bar {
  time: number      // 毫秒时间戳
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

// Datafeed 配置
export interface DatafeedConfiguration {
  supported_resolutions: string[]
  supports_search?: boolean
  supports_group_request?: boolean
  supports_marks?: boolean
  supports_timescale_marks?: boolean
  supports_time?: boolean
  exchanges?: Exchange[]
  symbols_types?: SymbolType[]
}

export interface Exchange {
  value: string
  name: string
  desc: string
}

export interface SymbolType {
  name: string
  value: string
}

// 符号信息
export interface LibrarySymbolInfo {
  name: string
  ticker?: string
  description: string
  type: string
  session: string
  exchange: string
  listed_exchange: string
  timezone: string
  minmov: number
  pricescale: number
  has_intraday: boolean
  has_no_volume?: boolean
  has_weekly_and_monthly?: boolean
  has_empty_bars?: boolean
  volume_precision?: number
  data_status?: 'streaming' | 'endofday' | 'pulsed' | 'delayed_streaming'
  supported_resolutions: string[]
  intraday_multipliers?: string[]
  format?: 'price' | 'volume'
}

// getBars 的周期参数
export interface PeriodParams {
  from: number      // Unix 时间戳（秒）
  to: number        // Unix 时间戳（秒）
  countBack?: number
  firstDataRequest?: boolean
}

// getBars 的返回元数据
export interface HistoryMetadata {
  noData?: boolean
  nextTime?: number
}

// 搜索结果项
export interface SearchSymbolResultItem {
  symbol: string
  full_name: string
  description: string
  ticker?: string
  type: string
  exchange: string
}

// 回调函数类型
export type OnReadyCallback = (configuration: DatafeedConfiguration) => void
export type ResolveCallback = (symbolInfo: LibrarySymbolInfo) => void
export type ErrorCallback = (reason: string) => void
export type HistoryCallback = (bars: Bar[], meta: HistoryMetadata) => void
export type SubscribeBarsCallback = (bar: Bar) => void
export type SearchSymbolsCallback = (items: SearchSymbolResultItem[]) => void

// Datafeed API 接口
export interface IDatafeedApi {
  onReady(callback: OnReadyCallback): void
  
  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: SearchSymbolsCallback
  ): void
  
  resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback
  ): void
  
  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback
  ): void
  
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ): void
  
  unsubscribeBars(listenerGuid: string): void
}

// TradingView Widget 类型
export interface TVWidget {
  chart(): TVChart
  setSymbol(symbol: string, interval: string, callback?: () => void): void
  remove(): void
  onChartReady(callback: () => void): void
}

export interface TVChart {
  createStudy(
    name: string,
    forceOverlay?: boolean,
    lock?: boolean,
    inputs?: unknown[]
  ): void
  onIntervalChanged(): {
    subscribe(context: unknown, cb: (interval: string, obj: unknown) => void): void
  }
  onSymbolChanged(): {
    subscribe(context: unknown, cb: (symbolInfo: unknown) => void): void
  }
}

// Widget 构造函数选项
export interface ChartingLibraryWidgetOptions {
  container: HTMLElement
  datafeed: IDatafeedApi
  symbol: string
  interval: string
  library_path: string
  locale?: string
  theme?: 'Light' | 'Dark'
  timezone?: string
  autosize?: boolean
  fullscreen?: boolean
  toolbar_bg?: string
  disabled_features?: string[]
  enabled_features?: string[]
  overrides?: Record<string, unknown>
  studies_overrides?: Record<string, unknown>
  charts_storage_url?: string
  charts_storage_api_version?: string
  client_id?: string
  user_id?: string
  debug?: boolean
}

// 全局 TradingView 命名空间
declare global {
  interface Window {
    TradingView?: {
      widget: new (options: ChartingLibraryWidgetOptions) => TVWidget
    }
  }
}
