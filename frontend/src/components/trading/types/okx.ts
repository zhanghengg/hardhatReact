/**
 * OKX API 类型定义
 */

// K 线数据 (REST API 返回数组格式)
// GET /api/v5/market/candles 返回的数组元素格式
export type OkxKlineRaw = [
  string,  // 0: 时间戳 (ms)
  string,  // 1: 开盘价
  string,  // 2: 最高价
  string,  // 3: 最低价
  string,  // 4: 收盘价
  string,  // 5: 成交量(币)
  string,  // 6: 成交量(计价货币)
  string,  // 7: 成交量(美元)
  string   // 8: K线状态 0: 未完结, 1: 完结
]

// WebSocket K 线消息格式
export interface OkxWsKlineMessage {
  arg: {
    channel: string    // 频道名，如 candle1m
    instId: string     // 产品ID，如 BTC-USDT
  }
  // WebSocket K 线数据也是数组格式，与 REST API 相同
  data: OkxKlineRaw[]
}

// 支持的 K 线周期
export type OkxKlineInterval =
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1H' | '2H' | '4H' | '6H' | '12H'
  | '1D' | '2D' | '3D'
  | '1W'
  | '1M' | '3M'

// 交易产品信息
export interface OkxInstrument {
  instType: string      // 产品类型 SPOT
  instId: string        // 产品ID，如 BTC-USDT
  uly: string           // 标的指数
  category: string      // 币种类别
  baseCcy: string       // 交易货币，如 BTC
  quoteCcy: string      // 计价货币，如 USDT
  settleCcy: string     // 盈亏结算和保证金币种
  ctVal: string         // 合约面值
  ctMult: string        // 合约乘数
  ctValCcy: string      // 合约面值计价币种
  optType: string       // 期权类型
  stk: string           // 行权价格
  listTime: string      // 上线时间 (ms)
  expTime: string       // 到期时间 (ms)
  lever: string         // 杠杆倍数
  tickSz: string        // 下单价格精度
  lotSz: string         // 下单数量精度
  minSz: string         // 最小下单数量
  ctType: string        // 合约类型
  alias: string         // 合约别名
  state: string         // 产品状态 live: 交易中
}

// 获取产品信息响应
export interface OkxInstrumentsResponse {
  code: string
  msg: string
  data: OkxInstrument[]
}

// K 线数据响应
export interface OkxKlineResponse {
  code: string
  msg: string
  data: OkxKlineRaw[]
}
