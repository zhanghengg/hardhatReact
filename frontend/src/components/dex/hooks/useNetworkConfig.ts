import { createPublicClient, http, type Chain, type PublicClient } from 'viem'
import { hardhat, sepolia } from 'viem/chains'

// 网络配置
// NEXT_PUBLIC_NETWORK 可选值: 'local' | 'sepolia' | 'auto'
// - 'local': 强制使用本地 Hardhat 网络
// - 'sepolia': 强制使用 Sepolia 测试网
// - 'auto' (默认): 开发环境用本地，生产环境用 Sepolia
const networkEnv = process.env.NEXT_PUBLIC_NETWORK || 'auto'
const isProduction = process.env.NODE_ENV === 'production'

export const useSepoliaNetwork =
  networkEnv === 'sepolia' || (networkEnv === 'auto' && isProduction)

// RPC URL 配置
const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'

// 根据环境选择网络配置
export const getChainConfig = (): { chain: Chain; rpcUrl: string } => {
  if (useSepoliaNetwork) {
    return {
      chain: sepolia,
      rpcUrl: SEPOLIA_RPC_URL
    }
  }
  return {
    chain: hardhat,
    rpcUrl: 'http://127.0.0.1:8545'
  }
}

// 导出当前网络配置
export const { chain: currentChain, rpcUrl } = getChainConfig()

// 轮询间隔配置（毫秒）
// 本地网络可以快一点，公共网络应该慢一点以减少 RPC 请求
const POLLING_INTERVAL = useSepoliaNetwork ? 4_000 : 1_000

// 创建并导出公共客户端（单例）
// 配置 pollingInterval 来减少轮询频率
export const publicClient: PublicClient = createPublicClient({
  chain: currentChain,
  transport: http(rpcUrl),
  // 轮询间隔：影响 waitForTransactionReceipt 等方法的轮询频率
  pollingInterval: POLLING_INTERVAL,
})

// Sepolia 区块浏览器地址
export const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io/address'

// 导出轮询间隔供其他地方使用
export { POLLING_INTERVAL }
