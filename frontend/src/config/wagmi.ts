import { http, createConfig } from 'wagmi'
import { hardhat, sepolia } from 'wagmi/chains'

// 网络配置
// NEXT_PUBLIC_NETWORK 可选值: 'local' | 'sepolia' | 'auto'
// - 'local': 强制使用本地 Hardhat 网络
// - 'sepolia': 强制使用 Sepolia 测试网
// - 'auto' (默认): 开发环境用本地，生产环境用 Sepolia
const networkEnv = process.env.NEXT_PUBLIC_NETWORK || 'auto'
const isProduction = process.env.NODE_ENV === 'production'

const useLocalNetwork =
  networkEnv === 'local' || (networkEnv === 'auto' && !isProduction)
const useSepoliaOnly = networkEnv === 'sepolia' || (networkEnv === 'auto' && isProduction)

// 根据配置选择可用链
const availableChains = useSepoliaOnly
  ? [sepolia] as const
  : useLocalNetwork
    ? [hardhat, sepolia] as const
    : [sepolia] as const

// RPC URL 配置
const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'

export const config = createConfig({
  chains: availableChains,
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(SEPOLIA_RPC_URL)
  },
  ssr: true
})

// 导出当前网络配置信息（用于调试）
export const networkConfig = {
  env: networkEnv,
  isLocal: useLocalNetwork,
  isSepolia: useSepoliaOnly,
  defaultChain: availableChains[0]
}

// Hardhat 默认测试账户 (本地开发用)
// 这些私钥仅用于本地测试，不要在生产环境使用！
export const TEST_ACCOUNTS = [
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as `0x${string}`,
    privateKey:
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as `0x${string}`
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as `0x${string}`,
    privateKey:
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as `0x${string}`
  }
] as const

// Sepolia 测试账户 (仅用于 Demo 演示)
// ⚠️ 警告：这是一个公开的测试私钥，任何人都可以访问！
// 请勿往此地址转入任何有价值的资产！
export const DEMO_TEST_ACCOUNT = {
  address: '0xa2eEbbc8F48192EC1CdDe45127ef2bD4253CbCDa' as `0x${string}`,
  privateKey:
    '0xd9a022572ef305d7ddae450935e9642131e8dcfac3adc80ae7162e7232bfeece' as `0x${string}`
} as const
