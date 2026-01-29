/**
 * 币安 Datafeed 适配器
 * 实现 TradingView Charting Library 的 Datafeed API
 */

import type { BinanceKlineRaw, BinanceExchangeInfo, BinanceSymbolInfo } from '../types/binance'
import type {
  IDatafeedApi,
  DatafeedConfiguration,
  LibrarySymbolInfo,
  Bar,
  PeriodParams,
  HistoryMetadata,
  OnReadyCallback,
  ResolveCallback,
  ErrorCallback,
  HistoryCallback,
  SubscribeBarsCallback,
  SearchSymbolsCallback,
  SearchSymbolResultItem,
} from '../types/tradingview'
import {
  resolutionToBinanceInterval,
  klineToBar,
  getPriceScale,
  SUPPORTED_RESOLUTIONS,
  BINANCE_API_BASE,
} from './helpers'
import { binanceStreaming } from './streaming'

/**
 * 币安 Datafeed
 * 直接调用币安 API 获取 K 线数据
 */
export class BinanceDatafeed implements IDatafeedApi {
  private exchangeInfo: BinanceExchangeInfo | null = null
  private symbolsCache: Map<string, BinanceSymbolInfo> = new Map()

  /**
   * 初始化配置
   * TradingView 在初始化时调用，必须异步返回配置
   */
  onReady(callback: OnReadyCallback): void {
    console.log('[BinanceDatafeed] onReady')
    
    // 必须使用 setTimeout 异步调用回调
    setTimeout(() => {
      const config: DatafeedConfiguration = {
        supported_resolutions: SUPPORTED_RESOLUTIONS,
        supports_search: true,
        supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        exchanges: [
          { value: 'Binance', name: 'Binance', desc: 'Binance Exchange' }
        ],
        symbols_types: [
          { name: 'Crypto', value: 'crypto' }
        ],
      }
      callback(config)
    }, 0)
    
    // 预加载交易对信息
    this.loadExchangeInfo()
  }

  /**
   * 加载币安交易对信息
   */
  private async loadExchangeInfo(): Promise<void> {
    try {
      const response = await fetch(`${BINANCE_API_BASE}/exchangeInfo`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      this.exchangeInfo = await response.json()
      
      // 缓存 USDT 交易对
      this.exchangeInfo?.symbols
        .filter(s => s.status === 'TRADING' && s.quoteAsset === 'USDT')
        .forEach(s => this.symbolsCache.set(s.symbol, s))
      
      console.log(`[BinanceDatafeed] Loaded ${this.symbolsCache.size} USDT pairs`)
    } catch (error) {
      console.error('[BinanceDatafeed] Failed to load exchangeInfo:', error)
    }
  }

  /**
   * 搜索交易对
   */
  searchSymbols(
    userInput: string,
    _exchange: string,
    _symbolType: string,
    onResult: SearchSymbolsCallback
  ): void {
    console.log('[BinanceDatafeed] searchSymbols:', userInput)
    
    const query = userInput.toUpperCase()
    const results: SearchSymbolResultItem[] = []
    
    for (const [symbol, info] of this.symbolsCache) {
      if (symbol.includes(query) || info.baseAsset.includes(query)) {
        results.push({
          symbol: info.symbol,
          full_name: `Binance:${info.symbol}`,
          description: `${info.baseAsset}/${info.quoteAsset}`,
          ticker: info.symbol,
          type: 'crypto',
          exchange: 'Binance',
        })
        
        if (results.length >= 30) break
      }
    }
    
    // 异步返回结果
    setTimeout(() => onResult(results), 0)
  }

  /**
   * 解析交易对符号
   * 返回符号的详细信息
   */
  resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback
  ): void {
    console.log('[BinanceDatafeed] resolveSymbol:', symbolName)
    
    // 异步解析
    setTimeout(async () => {
      try {
        // 标准化符号名称
        const symbol = symbolName.toUpperCase().replace('BINANCE:', '')
        
        // 尝试从缓存获取
        let binanceSymbol = this.symbolsCache.get(symbol)
        
        // 如果缓存没有，尝试从 API 获取
        if (!binanceSymbol && this.exchangeInfo) {
          binanceSymbol = this.exchangeInfo.symbols.find(s => s.symbol === symbol)
        }
        
        // 如果还是没有，等待加载完成后重试
        if (!binanceSymbol) {
          await this.loadExchangeInfo()
          binanceSymbol = this.symbolsCache.get(symbol)
        }
        
        if (!binanceSymbol) {
          onError(`Symbol not found: ${symbol}`)
          return
        }
        
        const symbolInfo: LibrarySymbolInfo = {
          name: binanceSymbol.symbol,
          ticker: binanceSymbol.symbol,
          description: `${binanceSymbol.baseAsset}/${binanceSymbol.quoteAsset}`,
          type: 'crypto',
          session: '24x7',
          exchange: 'Binance',
          listed_exchange: 'Binance',
          timezone: 'Etc/UTC',
          minmov: 1,
          pricescale: getPriceScale(binanceSymbol.symbol),
          has_intraday: true,
          has_no_volume: false,
          has_weekly_and_monthly: true,
          has_empty_bars: false,
          volume_precision: binanceSymbol.baseAssetPrecision,
          data_status: 'streaming',
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          intraday_multipliers: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '720'],
          format: 'price',
        }
        
        onResolve(symbolInfo)
      } catch (error) {
        console.error('[BinanceDatafeed] resolveSymbol error:', error)
        onError(String(error))
      }
    }, 0)
  }

  /**
   * 获取历史 K 线数据
   */
  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback
  ): void {
    const { from, to, firstDataRequest } = periodParams
    console.log('[BinanceDatafeed] getBars:', symbolInfo.name, resolution, { from, to, firstDataRequest })
    
    // 异步获取数据
    setTimeout(async () => {
      try {
        const symbol = symbolInfo.name
        const interval = resolutionToBinanceInterval(resolution)
        
        // 构建请求参数
        // 币安 API 使用毫秒时间戳
        const params = new URLSearchParams({
          symbol,
          interval,
          startTime: String(from * 1000),
          endTime: String(to * 1000),
          limit: '1000',
        })
        
        const url = `${BINANCE_API_BASE}/klines?${params}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const klines: BinanceKlineRaw[] = await response.json()
        
        if (!klines || klines.length === 0) {
          const meta: HistoryMetadata = { noData: true }
          onResult([], meta)
          return
        }
        
        // 转换为 TradingView Bar 格式
        const bars: Bar[] = klines.map(klineToBar)
        
        // 按时间排序（升序）
        bars.sort((a, b) => a.time - b.time)
        
        console.log(`[BinanceDatafeed] Loaded ${bars.length} bars`)
        
        const meta: HistoryMetadata = { noData: false }
        onResult(bars, meta)
      } catch (error) {
        console.error('[BinanceDatafeed] getBars error:', error)
        onError(String(error))
      }
    }, 0)
  }

  /**
   * 订阅实时 K 线更新
   */
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeeded: () => void
  ): void {
    console.log('[BinanceDatafeed] subscribeBars:', symbolInfo.name, resolution, listenerGuid)
    
    binanceStreaming.subscribe(
      symbolInfo,
      resolution,
      onTick,
      listenerGuid,
      onResetCacheNeeded
    )
  }

  /**
   * 取消订阅
   */
  unsubscribeBars(listenerGuid: string): void {
    console.log('[BinanceDatafeed] unsubscribeBars:', listenerGuid)
    binanceStreaming.unsubscribe(listenerGuid)
  }
}

// 导出单例
export const binanceDatafeed = new BinanceDatafeed()
