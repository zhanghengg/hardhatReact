import { privateKeyToAccount } from 'viem/accounts'

// 账户类型
export type AccountType =
  | ReturnType<typeof privateKeyToAccount>
  | { address: `0x${string}`; type: 'injected' }

// 余额状态
export interface Balances {
  eth: string
  tokenA: string
  tokenB: string
  lp: string
}

// 储备量状态
export interface Reserves {
  reserveA: string
  reserveB: string
  totalSupply: string
}

// 连接模式
export type ConnectionMode = 'test' | 'wallet'

// 交换方向
export type SwapDirection = 'AtoB' | 'BtoA'

// 流动性操作类型
export type LiquidityAction = 'add' | 'remove'

// 交易状态类型
export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error'

// 交易步骤类型
export interface TransactionStep {
  label: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
}

// Toast 数据类型
export interface ToastData {
  id: string
  type: 'success' | 'error'
  title: string
  message?: string
  txHash?: `0x${string}`
  timestamp: number
}
