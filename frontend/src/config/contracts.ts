// Uniswap V2 合约地址 (自动生成，请勿手动修改)
// 生成时间: 2026/1/23 18:06:15

export const CONTRACTS = {
  WETH: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
  Factory: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as `0x${string}`,
  Router: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as `0x${string}`,
  TokenA: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as `0x${string}`,
  TokenB: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707' as `0x${string}`,
  Pair: '0x0A217f808eB1597314c25D5B4057B308A2f76e83' as `0x${string}`,
} as const

// 检查合约是否已部署
export const isContractsDeployed = () => {
  return Object.values(CONTRACTS).every(addr => addr && addr !== '')
}
