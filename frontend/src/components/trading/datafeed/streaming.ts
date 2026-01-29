/**
 * 币安 WebSocket 实时数据流管理
 */

import type { BinanceWsKlineMessage } from '../types/binance'
import type { Bar, LibrarySymbolInfo, SubscribeBarsCallback } from '../types/tradingview'
import { resolutionToBinanceInterval, BINANCE_WS_BASE } from './helpers'

interface SubscriptionInfo {
  ws: WebSocket
  symbolInfo: LibrarySymbolInfo
  resolution: string
  onTick: SubscribeBarsCallback
  onResetCacheNeeded: () => void
}

/**
 * 币安 WebSocket 实时数据流
 * 管理 K 线数据的订阅和推送
 */
export class BinanceStreaming {
  private subscriptions: Map<string, SubscriptionInfo> = new Map()

  /**
   * 订阅实时 K 线数据
   */
  subscribe(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeeded: () => void
  ): void {
    // 如果已存在订阅，先取消
    if (this.subscriptions.has(listenerGuid)) {
      this.unsubscribe(listenerGuid)
    }

    const symbol = symbolInfo.name.toLowerCase()
    const interval = resolutionToBinanceInterval(resolution)
    const streamName = `${symbol}@kline_${interval}`
    const wsUrl = `${BINANCE_WS_BASE}/${streamName}`

    console.log(`[BinanceStreaming] Subscribing to ${streamName}`)

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log(`[BinanceStreaming] Connected: ${streamName}`)
      }

      ws.onmessage = (event) => {
        try {
          const message: BinanceWsKlineMessage = JSON.parse(event.data)
          
          if (message.e === 'kline' && message.k) {
            const kline = message.k
            const bar: Bar = {
              time: kline.t,
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
              volume: parseFloat(kline.v),
            }
            onTick(bar)
          }
        } catch (e) {
          console.error('[BinanceStreaming] Parse error:', e)
        }
      }

      ws.onerror = (error) => {
        console.error(`[BinanceStreaming] WebSocket error:`, error)
      }

      ws.onclose = (event) => {
        console.warn(`[BinanceStreaming] Disconnected: ${streamName}`, event.code, event.reason)
        
        // 如果是异常关闭，尝试重连
        if (event.code !== 1000 && this.subscriptions.has(listenerGuid)) {
          console.log(`[BinanceStreaming] Reconnecting in 5s...`)
          setTimeout(() => {
            const sub = this.subscriptions.get(listenerGuid)
            if (sub) {
              this.subscribe(
                sub.symbolInfo,
                sub.resolution,
                sub.onTick,
                listenerGuid,
                sub.onResetCacheNeeded
              )
              // 重连后需要重置缓存
              onResetCacheNeeded()
            }
          }, 5000)
        }
      }

      this.subscriptions.set(listenerGuid, {
        ws,
        symbolInfo,
        resolution,
        onTick,
        onResetCacheNeeded,
      })
    } catch (error) {
      console.error('[BinanceStreaming] Failed to create WebSocket:', error)
    }
  }

  /**
   * 取消订阅
   */
  unsubscribe(listenerGuid: string): void {
    const subscription = this.subscriptions.get(listenerGuid)
    
    if (subscription) {
      console.log(`[BinanceStreaming] Unsubscribing: ${listenerGuid}`)
      
      try {
        if (subscription.ws.readyState === WebSocket.OPEN) {
          subscription.ws.close(1000, 'Unsubscribed')
        }
      } catch (e) {
        console.error('[BinanceStreaming] Error closing WebSocket:', e)
      }
      
      this.subscriptions.delete(listenerGuid)
    }
  }

  /**
   * 关闭所有订阅
   */
  dispose(): void {
    console.log('[BinanceStreaming] Disposing all subscriptions')
    
    for (const [guid] of this.subscriptions) {
      this.unsubscribe(guid)
    }
  }
}

// 导出单例
export const binanceStreaming = new BinanceStreaming()
