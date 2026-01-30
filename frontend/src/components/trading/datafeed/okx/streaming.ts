/**
 * OKX WebSocket 实时数据流管理
 */

import type { OkxWsKlineMessage } from '../../types/okx'
import type { Bar, LibrarySymbolInfo, SubscribeBarsCallback } from '../../types/tradingview'
import { resolutionToOkxInterval, okxIntervalToChannel, binanceSymbolToOkx, OKX_WS_BUSINESS } from './helpers'

interface SubscriptionInfo {
  symbolInfo: LibrarySymbolInfo
  resolution: string
  onTick: SubscribeBarsCallback
  onResetCacheNeeded: () => void
  channelKey: string
}

/**
 * OKX WebSocket 实时数据流
 * 管理 K 线数据的订阅和推送
 */
export class OkxStreaming {
  private ws: WebSocket | null = null
  private subscriptions: Map<string, SubscriptionInfo> = new Map()
  private isConnected = false
  private reconnectTimer: NodeJS.Timeout | null = null
  private pingTimer: NodeJS.Timeout | null = null

  /**
   * 获取或创建 WebSocket 连接
   */
  private ensureConnection(): void {
    if (this.ws && this.isConnected) return

    console.log('[OkxStreaming] Creating WebSocket connection to business channel')

    try {
      // OKX K 线数据需要使用 business WebSocket endpoint
      this.ws = new WebSocket(OKX_WS_BUSINESS)

      this.ws.onopen = () => {
        console.log('[OkxStreaming] WebSocket connected')
        this.isConnected = true

        // 重新订阅所有频道
        this.resubscribeAll()

        // 启动心跳
        this.startPing()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onerror = (error) => {
        console.error('[OkxStreaming] WebSocket error:', error)
      }

      this.ws.onclose = (event) => {
        console.warn('[OkxStreaming] WebSocket closed:', event.code, event.reason)
        this.isConnected = false
        this.stopPing()

        // 如果还有订阅，尝试重连
        if (this.subscriptions.size > 0 && event.code !== 1000) {
          this.scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('[OkxStreaming] Failed to create WebSocket:', error)
    }
  }

  /**
   * 处理 WebSocket 消息
   */
  private handleMessage(data: string): void {
    try {
      // 处理 pong 响应
      if (data === 'pong') {
        return
      }

      const message = JSON.parse(data) as OkxWsKlineMessage

      // 检查是否是 K 线数据
      if (message.arg?.channel?.startsWith('candle') && message.data?.length > 0) {
        const channelKey = `${message.arg.instId}:${message.arg.channel}`

        // 找到对应的订阅
        for (const [, sub] of this.subscriptions) {
          if (sub.channelKey === channelKey) {
            // OKX WebSocket K 线数据是数组格式:
            // [ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]
            const kline = message.data[0]
            const bar: Bar = {
              time: parseInt(kline[0]),      // ts - 开盘时间 (ms)
              open: parseFloat(kline[1]),    // o - 开盘价
              high: parseFloat(kline[2]),    // h - 最高价
              low: parseFloat(kline[3]),     // l - 最低价
              close: parseFloat(kline[4]),   // c - 收盘价
              volume: parseFloat(kline[5]),  // vol - 成交量
            }
            console.log('[OkxStreaming] Tick:', bar.time, bar.close)
            sub.onTick(bar)
          }
        }
      }
    } catch (e) {
      // 忽略非 JSON 消息
      if (data !== 'pong') {
        console.error('[OkxStreaming] Parse error:', e)
      }
    }
  }

  /**
   * 发送订阅请求
   */
  private sendSubscribe(instId: string, channel: string): void {
    if (!this.ws || !this.isConnected) return

    const subscribeMsg = {
      op: 'subscribe',
      args: [
        {
          channel,
          instId,
        },
      ],
    }

    console.log('[OkxStreaming] Subscribing:', instId, channel)
    this.ws.send(JSON.stringify(subscribeMsg))
  }

  /**
   * 发送取消订阅请求
   */
  private sendUnsubscribe(instId: string, channel: string): void {
    if (!this.ws || !this.isConnected) return

    const unsubscribeMsg = {
      op: 'unsubscribe',
      args: [
        {
          channel,
          instId,
        },
      ],
    }

    console.log('[OkxStreaming] Unsubscribing:', instId, channel)
    this.ws.send(JSON.stringify(unsubscribeMsg))
  }

  /**
   * 重新订阅所有频道
   */
  private resubscribeAll(): void {
    for (const [, sub] of this.subscriptions) {
      const instId = binanceSymbolToOkx(sub.symbolInfo.name)
      const interval = resolutionToOkxInterval(sub.resolution)
      const channel = okxIntervalToChannel(interval)
      this.sendSubscribe(instId, channel)
    }
  }

  /**
   * 启动心跳
   */
  private startPing(): void {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      if (this.ws && this.isConnected) {
        this.ws.send('ping')
      }
    }, 25000)
  }

  /**
   * 停止心跳
   */
  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    console.log('[OkxStreaming] Scheduling reconnect in 5s')
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.ensureConnection()
    }, 5000)
  }

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

    const instId = binanceSymbolToOkx(symbolInfo.name)
    const interval = resolutionToOkxInterval(resolution)
    const channel = okxIntervalToChannel(interval)
    const channelKey = `${instId}:${channel}`

    console.log(`[OkxStreaming] Subscribe request: ${instId} ${channel}`)

    this.subscriptions.set(listenerGuid, {
      symbolInfo,
      resolution,
      onTick,
      onResetCacheNeeded,
      channelKey,
    })

    // 确保连接已建立
    this.ensureConnection()

    // 如果已连接，立即发送订阅
    if (this.isConnected) {
      this.sendSubscribe(instId, channel)
    }
  }

  /**
   * 取消订阅
   */
  unsubscribe(listenerGuid: string): void {
    const subscription = this.subscriptions.get(listenerGuid)

    if (subscription) {
      console.log(`[OkxStreaming] Unsubscribing: ${listenerGuid}`)

      const instId = binanceSymbolToOkx(subscription.symbolInfo.name)
      const interval = resolutionToOkxInterval(subscription.resolution)
      const channel = okxIntervalToChannel(interval)

      this.sendUnsubscribe(instId, channel)
      this.subscriptions.delete(listenerGuid)

      // 如果没有订阅了，关闭连接
      if (this.subscriptions.size === 0) {
        this.closeConnection()
      }
    }
  }

  /**
   * 关闭连接
   */
  private closeConnection(): void {
    this.stopPing()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      try {
        this.ws.close(1000, 'No subscriptions')
      } catch (e) {
        console.error('[OkxStreaming] Error closing WebSocket:', e)
      }
      this.ws = null
    }

    this.isConnected = false
  }

  /**
   * 关闭所有订阅
   */
  dispose(): void {
    console.log('[OkxStreaming] Disposing all subscriptions')

    for (const [guid] of this.subscriptions) {
      this.unsubscribe(guid)
    }

    this.closeConnection()
  }
}

// 导出单例
export const okxStreaming = new OkxStreaming()
