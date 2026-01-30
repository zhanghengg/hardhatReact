/**
 * OKX Datafeed 适配器
 * 实现 TradingView Charting Library 的 Datafeed API
 */

import type { OkxKlineRaw, OkxInstrument, OkxInstrumentsResponse, OkxKlineResponse } from '../../types/okx'
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
} from '../../types/tradingview'
import {
  resolutionToOkxInterval,
  okxKlineToBar,
  getOkxPriceScale,
  binanceSymbolToOkx,
  okxSymbolToBinance,
  OKX_SUPPORTED_RESOLUTIONS,
  OKX_API_BASE,
} from './helpers'
import { okxStreaming } from './streaming'

/**
 * OKX Datafeed
 * 调用 OKX API 获取 K 线数据
 */
export class OkxDatafeed implements IDatafeedApi {
  private instruments: OkxInstrument[] = []
  private instrumentsCache: Map<string, OkxInstrument> = new Map()

  /**
   * 初始化配置
   * TradingView 在初始化时调用，必须异步返回配置
   */
  onReady(callback: OnReadyCallback): void {
    console.log('[OkxDatafeed] onReady')

    // 必须使用 setTimeout 异步调用回调
    setTimeout(() => {
      const config: DatafeedConfiguration = {
        supported_resolutions: OKX_SUPPORTED_RESOLUTIONS,
        supports_search: true,
        supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        exchanges: [
          { value: 'OKX', name: 'OKX', desc: 'OKX Exchange' }
        ],
        symbols_types: [
          { name: 'Crypto', value: 'crypto' }
        ],
      }
      callback(config)
    }, 0)

    // 预加载交易对信息
    this.loadInstruments()
  }

  /**
   * 加载 OKX 交易对信息
   */
  private async loadInstruments(): Promise<void> {
    try {
      const response = await fetch(`${OKX_API_BASE}/public/instruments?instType=SPOT`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data: OkxInstrumentsResponse = await response.json()

      if (data.code !== '0') {
        throw new Error(`OKX API error: ${data.msg}`)
      }

      this.instruments = data.data

      // 缓存 USDT 交易对 (使用不带横杠的格式作为 key)
      this.instruments
        .filter(s => s.state === 'live' && s.quoteCcy === 'USDT')
        .forEach(s => {
          const symbol = okxSymbolToBinance(s.instId)
          this.instrumentsCache.set(symbol, s)
        })

      console.log(`[OkxDatafeed] Loaded ${this.instrumentsCache.size} USDT pairs`)
    } catch (error) {
      console.error('[OkxDatafeed] Failed to load instruments:', error)
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
    console.log('[OkxDatafeed] searchSymbols:', userInput)

    const query = userInput.toUpperCase().replace('-', '')
    const results: SearchSymbolResultItem[] = []

    for (const [symbol, info] of this.instrumentsCache) {
      if (symbol.includes(query) || info.baseCcy.includes(query)) {
        results.push({
          symbol: symbol,  // 使用不带横杠的格式
          full_name: `OKX:${symbol}`,
          description: `${info.baseCcy}/${info.quoteCcy}`,
          ticker: symbol,
          type: 'crypto',
          exchange: 'OKX',
        })

        if (results.length >= 30) break
      }
    }

    // 异步返回结果
    setTimeout(() => onResult(results), 0)
  }

  /**
   * 从符号名中提取基础符号
   * 处理 TradingView 可能添加的各种后缀
   */
  private normalizeSymbol(symbolName: string): string {
    // 标准化符号名称
    let symbol = symbolName.toUpperCase()
    
    // 移除交易所前缀 (如 OKX:, BINANCE:)
    symbol = symbol.replace(/^[A-Z]+:/, '')
    
    // 移除可能的特殊字符后缀 (如 #0, :1, .P 等)
    symbol = symbol.replace(/[#:.]\w*$/, '')
    
    // 移除横杠
    symbol = symbol.replace(/-/g, '')
    
    // 移除末尾的数字后缀（如 SOLUSDT1 -> SOLUSDT, BTCUSDT60 -> BTCUSDT）
    // TradingView 在创建指标时可能会附加分辨率数字
    const quoteAssets = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH']
    
    for (const quote of quoteAssets) {
      const idx = symbol.indexOf(quote)
      if (idx > 0) {
        // 找到了 quote asset，截取到 quote asset 结束的位置
        return symbol.substring(0, idx + quote.length)
      }
    }
    
    // 如果没有匹配到已知的 quote asset，尝试移除末尾的纯数字
    return symbol.replace(/\d+$/, '')
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
    console.log('[OkxDatafeed] resolveSymbol:', symbolName)

    // 异步解析
    setTimeout(async () => {
      try {
        const symbol = this.normalizeSymbol(symbolName)
        console.log('[OkxDatafeed] Normalized symbol:', symbolName, '->', symbol)

        // 尝试从缓存获取
        let instrument = this.instrumentsCache.get(symbol)

        // 如果缓存没有，等待加载完成后重试
        if (!instrument) {
          await this.loadInstruments()
          instrument = this.instrumentsCache.get(symbol)
        }

        if (!instrument) {
          console.warn(`[OkxDatafeed] Symbol not found: ${symbol} (original: ${symbolName})`)
          onError(`Symbol not found: ${symbol}`)
          return
        }

        const symbolInfo: LibrarySymbolInfo = {
          name: symbol,  // 使用不带横杠的格式，保持与页面一致
          ticker: symbol,
          description: `${instrument.baseCcy}/${instrument.quoteCcy}`,
          type: 'crypto',
          session: '24x7',
          exchange: 'OKX',
          listed_exchange: 'OKX',
          timezone: 'Etc/UTC',
          minmov: 1,
          pricescale: getOkxPriceScale(instrument.instId),
          has_intraday: true,
          has_no_volume: false,
          has_weekly_and_monthly: true,
          has_empty_bars: false,
          volume_precision: 8,
          data_status: 'streaming',
          supported_resolutions: OKX_SUPPORTED_RESOLUTIONS,
          intraday_multipliers: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '720'],
          format: 'price',
        }

        onResolve(symbolInfo)
      } catch (error) {
        console.error('[OkxDatafeed] resolveSymbol error:', error)
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
    console.log('[OkxDatafeed] getBars:', symbolInfo.name, resolution, { from, to, firstDataRequest })

    // 异步获取数据
    setTimeout(async () => {
      try {
        // 转换为 OKX 格式的符号
        const instId = binanceSymbolToOkx(symbolInfo.name)
        const bar = resolutionToOkxInterval(resolution)

        // OKX API 使用毫秒时间戳，且参数名为 after/before
        // after: 请求此时间戳之前的数据 (用于分页)
        // before: 请求此时间戳之后的数据
        const params = new URLSearchParams({
          instId,
          bar,
          before: String(from * 1000),
          after: String(to * 1000),
          limit: '300',  // OKX 限制最多 300 条
        })

        const url = `${OKX_API_BASE}/market/history-candles?${params}`
        console.log('[OkxDatafeed] Fetching:', url)
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data: OkxKlineResponse = await response.json()

        if (data.code !== '0') {
          throw new Error(`OKX API error: ${data.msg}`)
        }

        const klines: OkxKlineRaw[] = data.data

        if (!klines || klines.length === 0) {
          const meta: HistoryMetadata = { noData: true }
          onResult([], meta)
          return
        }

        // 转换为 TradingView Bar 格式
        const bars: Bar[] = klines.map(okxKlineToBar)

        // OKX 返回的数据是倒序的（最新的在前），需要反转为升序
        bars.reverse()

        console.log(`[OkxDatafeed] Loaded ${bars.length} bars`)

        const meta: HistoryMetadata = { noData: false }
        onResult(bars, meta)
      } catch (error) {
        console.error('[OkxDatafeed] getBars error:', error)
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
    console.log('[OkxDatafeed] subscribeBars:', symbolInfo.name, resolution, listenerGuid)

    okxStreaming.subscribe(
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
    console.log('[OkxDatafeed] unsubscribeBars:', listenerGuid)
    okxStreaming.unsubscribe(listenerGuid)
  }
}

// 导出单例
export const okxDatafeed = new OkxDatafeed()
