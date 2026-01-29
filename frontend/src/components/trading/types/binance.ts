/**
 * 币安 API 类型定义
 */

// K 线数据 (REST API 返回数组格式)
// GET /api/v3/klines 返回的数组元素格式
export type BinanceKlineRaw = [
  number,  // 0: Open time (ms)
  string,  // 1: Open price
  string,  // 2: High price
  string,  // 3: Low price
  string,  // 4: Close price
  string,  // 5: Volume
  number,  // 6: Close time (ms)
  string,  // 7: Quote asset volume
  number,  // 8: Number of trades
  string,  // 9: Taker buy base asset volume
  string,  // 10: Taker buy quote asset volume
  string   // 11: Ignore
]

// WebSocket K 线消息格式
export interface BinanceWsKlineMessage {
  e: 'kline'           // Event type
  E: number            // Event time (ms)
  s: string            // Symbol
  k: BinanceWsKlineData
}

export interface BinanceWsKlineData {
  t: number   // Kline start time (ms)
  T: number   // Kline close time (ms)
  s: string   // Symbol
  i: string   // Interval
  f: number   // First trade ID
  L: number   // Last trade ID
  o: string   // Open price
  c: string   // Close price
  h: string   // High price
  l: string   // Low price
  v: string   // Base asset volume
  n: number   // Number of trades
  x: boolean  // Is this kline closed?
  q: string   // Quote asset volume
  V: string   // Taker buy base asset volume
  Q: string   // Taker buy quote asset volume
  B: string   // Ignore
}

// 支持的 K 线周期
export type BinanceKlineInterval =
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'
  | '1d' | '3d' | '1w' | '1M'

// 交易对信息 (exchangeInfo 返回的 symbol 结构)
export interface BinanceSymbolInfo {
  symbol: string
  status: string
  baseAsset: string
  baseAssetPrecision: number
  quoteAsset: string
  quotePrecision: number
  quoteAssetPrecision: number
  orderTypes: string[]
  icebergAllowed: boolean
  ocoAllowed: boolean
  isSpotTradingAllowed: boolean
  isMarginTradingAllowed: boolean
  filters: BinanceSymbolFilter[]
  permissions: string[]
}

export interface BinanceSymbolFilter {
  filterType: string
  minPrice?: string
  maxPrice?: string
  tickSize?: string
  minQty?: string
  maxQty?: string
  stepSize?: string
  minNotional?: string
  [key: string]: unknown
}

// exchangeInfo 响应
export interface BinanceExchangeInfo {
  timezone: string
  serverTime: number
  rateLimits: unknown[]
  exchangeFilters: unknown[]
  symbols: BinanceSymbolInfo[]
}
