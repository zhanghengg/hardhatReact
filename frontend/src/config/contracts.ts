// Uniswap V2 合约地址 (自动生成，请勿手动修改)
// 生成时间: 2025/12/10 16:06:16

export const CONTRACTS = {
  WETH: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
  Factory: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
  Router: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as `0x${string}`,
  TokenA: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as `0x${string}`,
  TokenB: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as `0x${string}`,
  Pair: '0xc0CA4B3D69d765019D8793AA527dB7584eA22011' as `0x${string}`,
} as const

// 检查合约是否已部署
export const isContractsDeployed = () => {
  return Object.values(CONTRACTS).every(addr => addr.length > 2)
}
