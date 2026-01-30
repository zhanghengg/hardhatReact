/**
 * OKX Datafeed 辅助函数
 */

import type { OkxKlineRaw, OkxKlineInterval } from '../../types/okx'
import type { Bar } from '../../types/tradingview'

/**
 * TradingView 分辨率 -> OKX K 线周期
 * TradingView: '1', '5', '15', '30', '60', '240', 'D', '1D', 'W', '1W', 'M', '1M'
 * OKX: '1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'
 */
export function resolutionToOkxInterval(resolution: string): OkxKlineInterval {
  const map: Record<string, OkxKlineInterval> = {
    '1': '1m',
    '3': '3m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1H',
    '120': '2H',
    '240': '4H',
    '360': '6H',
    '720': '12H',
    'D': '1D',
    '1D': '1D',
    '2D': '2D',
    '3D': '3D',
    'W': '1W',
    '1W': '1W',
    'M': '1M',
    '1M': '1M',
    '3M': '3M',
  }
  return map[resolution] || '1H'
}

/**
 * OKX 周期 -> TradingView 分辨率
 */
export function okxIntervalToResolution(interval: OkxKlineInterval): string {
  const map: Record<OkxKlineInterval, string> = {
    '1m': '1',
    '3m': '3',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '1H': '60',
    '2H': '120',
    '4H': '240',
    '6H': '360',
    '12H': '720',
    '1D': '1D',
    '2D': '2D',
    '3D': '3D',
    '1W': '1W',
    '1M': '1M',
    '3M': '3M',
  }
  return map[interval] || '60'
}

/**
 * OKX K 线数组 -> TradingView Bar
 */
export function okxKlineToBar(kline: OkxKlineRaw): Bar {
  return {
    time: parseInt(kline[0]),       // 时间戳 (ms)
    open: parseFloat(kline[1]),     // 开盘价
    high: parseFloat(kline[2]),     // 最高价
    low: parseFloat(kline[3]),      // 最低价
    close: parseFloat(kline[4]),    // 收盘价
    volume: parseFloat(kline[5]),   // 成交量(币)
  }
}

/**
 * OKX 周期 -> WebSocket 频道名
 * OKX WebSocket 频道格式: candle1m, candle5m, candle1H, candle1D 等
 */
export function okxIntervalToChannel(interval: OkxKlineInterval): string {
  return `candle${interval}`
}

/**
 * 币安格式符号 -> OKX 格式符号
 * BTCUSDT -> BTC-USDT
 */
export function binanceSymbolToOkx(symbol: string): string {
  // 常见的 quote assets
  const quoteAssets = ['USDT', 'USDC', 'BTC', 'ETH']
  
  for (const quote of quoteAssets) {
    if (symbol.endsWith(quote)) {
      const base = symbol.slice(0, -quote.length)
      return `${base}-${quote}`
    }
  }
  
  return symbol
}

/**
 * OKX 格式符号 -> 币安格式符号 (用于统一显示)
 * BTC-USDT -> BTCUSDT
 */
export function okxSymbolToBinance(instId: string): string {
  return instId.replace('-', '')
}

/**
 * 根据符号获取价格精度
 */
export function getOkxPriceScale(instId: string): number {
  const symbol = instId.toUpperCase()
  if (symbol.includes('BTC')) return 100       // 2 位小数
  if (symbol.includes('ETH')) return 100       // 2 位小数
  if (symbol.includes('SOL')) return 100       // 2 位小数
  if (symbol.includes('DOGE')) return 100000   // 5 位小数
  if (symbol.includes('SHIB')) return 100000000 // 8 位小数
  return 10000  // 默认 4 位小数
}

/**
 * 支持的分辨率列表
 */
export const OKX_SUPPORTED_RESOLUTIONS = [
  '1', '3', '5', '15', '30',           // 分钟
  '60', '120', '240', '360', '720',    // 小时
  '1D', '2D', '3D',                    // 日
  '1W',                                // 周
  '1M',                                // 月
]

/**
 * OKX API 基础 URL
 */
export const OKX_API_BASE = 'https://www.okx.com/api/v5'

/**
 * OKX WebSocket 基础 URL (公共频道)
 */
export const OKX_WS_PUBLIC = 'wss://ws.okx.com:8443/ws/v5/public'

/**
 * OKX WebSocket 基础 URL (业务频道 - K 线数据使用此频道)
 */
export const OKX_WS_BUSINESS = 'wss://ws.okx.com:8443/ws/v5/business'
