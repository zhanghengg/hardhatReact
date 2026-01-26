// Uniswap V2 合约地址 (自动生成，请勿手动修改)
// 生成时间: 2026/1/26 18:55:38

export const CONTRACTS = {
  WETH: '0xd24BA332382EB24AD9Ba8cDA750ba33d22C02B42' as `0x${string}`,
  Factory: '0xAa08AD9BA4A408672996b71E100eDB189549c0A5' as `0x${string}`,
  Router: '0x55d26f05efd8754c226e4DF66D8C71A68ADA8c74' as `0x${string}`,
  TokenA: '0xCAfeF19c94e441D064D9f104443F50C3685C37db' as `0x${string}`,
  TokenB: '0x68d0014F4f1Aa9F10D0cc5c46B14FE511Da7847D' as `0x${string}`,
  Pair: '0xFb30B09B5A04050B5B133D9c803245C03DFD99Df' as `0x${string}`,
} as const

// 零地址
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// 检查合约是否已部署（地址有效且非零地址）
export const isContractsDeployed = () => {
  return Object.values(CONTRACTS).every(
    addr => addr && addr.length === 42 && addr !== ZERO_ADDRESS
  )
}
