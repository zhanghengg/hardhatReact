// Uniswap V2 合约地址 (自动生成，请勿手动修改)
// 生成时间: 2026/1/24 16:33:51

export const CONTRACTS = {
  WETH: '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE' as `0x${string}`,
  Factory: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed' as `0x${string}`,
  Router: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c' as `0x${string}`,
  TokenA: '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d' as `0x${string}`,
  TokenB: '0x59b670e9fA9D0A427751Af201D676719a970857b' as `0x${string}`,
  Pair: '0xDC1324D5AA5b06d31F8FC56335d93e02Cac68d00' as `0x${string}`,
} as const

// 检查合约是否已部署
export const isContractsDeployed = () => {
  return Object.values(CONTRACTS).every(addr => addr && addr.length > 2)
}
