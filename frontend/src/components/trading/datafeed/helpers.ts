/**
 * Datafeed 辅助函数
 */

import type { BinanceKlineRaw, BinanceKlineInterval } from '../types/binance'
import type { Bar } from '../types/tradingview'

/**
 * TradingView 分辨率 -> 币安 K 线周期
 * TradingView: '1', '5', '15', '30', '60', '240', 'D', '1D', 'W', '1W', 'M', '1M'
 * Binance: '1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'
 */
export function resolutionToBinanceInterval(resolution: string): BinanceKlineInterval {
  const map: Record<string, BinanceKlineInterval> = {
    '1': '1m',
    '3': '3m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '120': '2h',
    '240': '4h',
    '360': '6h',
    '480': '8h',
    '720': '12h',
    'D': '1d',
    '1D': '1d',
    '3D': '3d',
    'W': '1w',
    '1W': '1w',
    'M': '1M',
    '1M': '1M',
  }
  return map[resolution] || '1h'
}

/**
 * 币安周期 -> TradingView 分辨率
 */
export function binanceIntervalToResolution(interval: BinanceKlineInterval): string {
  const map: Record<BinanceKlineInterval, string> = {
    '1m': '1',
    '3m': '3',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '1h': '60',
    '2h': '120',
    '4h': '240',
    '6h': '360',
    '8h': '480',
    '12h': '720',
    '1d': '1D',
    '3d': '3D',
    '1w': '1W',
    '1M': '1M',
  }
  return map[interval] || '60'
}

/**
 * 币安 K 线数组 -> TradingView Bar
 */
export function klineToBar(kline: BinanceKlineRaw): Bar {
  return {
    time: kline[0],                    // Open time (ms)
    open: parseFloat(kline[1]),        // Open price
    high: parseFloat(kline[2]),        // High price
    low: parseFloat(kline[3]),         // Low price
    close: parseFloat(kline[4]),       // Close price
    volume: parseFloat(kline[5]),      // Volume
  }
}

/**
 * 根据符号获取价格精度
 * USDT 交易对通常是 2-4 位小数
 */
export function getPriceScale(symbol: string): number {
  // 常见的价格精度配置
  if (symbol.includes('BTC')) return 100       // 2 位小数
  if (symbol.includes('ETH')) return 100       // 2 位小数
  if (symbol.includes('BNB')) return 100       // 2 位小数
  if (symbol.includes('SOL')) return 100       // 2 位小数
  if (symbol.includes('DOGE')) return 100000   // 5 位小数
  if (symbol.includes('SHIB')) return 100000000 // 8 位小数
  return 10000  // 默认 4 位小数
}

/**
 * 格式化符号显示
 * BTCUSDT -> BTC/USDT
 */
export function formatSymbolDisplay(symbol: string): string {
  // 常见的 quote assets
  const quoteAssets = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB']
  
  for (const quote of quoteAssets) {
    if (symbol.endsWith(quote)) {
      const base = symbol.slice(0, -quote.length)
      return `${base}/${quote}`
    }
  }
  
  return symbol
}

/**
 * 支持的分辨率列表
 */
export const SUPPORTED_RESOLUTIONS = [
  '1', '3', '5', '15', '30',           // 分钟
  '60', '120', '240', '360', '720',    // 小时
  '1D', '3D',                          // 日
  '1W',                                // 周
  '1M',                                // 月
]

/**
 * 币安 API 基础 URL
 */
export const BINANCE_API_BASE = 'https://api.binance.com/api/v3'

/**
 * 币安 WebSocket 基础 URL
 */
export const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws'
