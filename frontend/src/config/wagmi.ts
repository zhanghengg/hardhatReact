import { http, createConfig } from 'wagmi'
import { hardhat, sepolia } from 'wagmi/chains'

// 判断是否为生产环境
const isProduction = process.env.NODE_ENV === 'production'

// 本地开发使用 Hardhat，生产环境使用 Sepolia
export const config = createConfig({
  chains: isProduction ? [sepolia] : [hardhat, sepolia],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http('https://rpc.sepolia.org')
  },
  ssr: true
})

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
// 地址: 0x06d7dc89efd6e9ec0bcd5cfe4000b55c3779bc47
export const DEMO_TEST_ACCOUNT = {
  address: '0x06d7dc89efd6e9ec0bcd5cfe4000b55c3779bc47' as `0x${string}`,
  privateKey:
    '0xd9a022572ef305d7ddae450935e9642131e8dcfac3adc80ae7162e7232bfeece' as `0x${string}`
} as const
