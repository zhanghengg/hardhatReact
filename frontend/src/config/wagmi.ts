import { http, createConfig } from 'wagmi'
import { hardhat } from 'wagmi/chains'

// 本地 Hardhat 节点配置
export const config = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545')
  },
  ssr: true
})

// Hardhat 默认测试账户 (节点启动时会显示)
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
