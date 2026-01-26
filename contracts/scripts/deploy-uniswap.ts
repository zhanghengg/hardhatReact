import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

// 铸造目标账户配置 (与 frontend/src/config/wagmi.ts 保持一致)
// Hardhat 默认测试账户 (本地开发用)
const TEST_ACCOUNTS = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
] as const

// Sepolia 测试账户 (仅用于 Demo 演示)
const DEMO_TEST_ACCOUNT = '0x06d7dc89efd6e9ec0bcd5cfe4000b55c3779bc47'

// 每个账户铸造的代币数量
const MINT_AMOUNT_PER_ACCOUNT = ethers.parseEther('100000')

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('部署账户:', deployer.address)
  console.log(
    '账户余额:',
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    'ETH'
  )

  // 检测当前网络
  const network = await ethers.provider.getNetwork()
  const chainId = Number(network.chainId)
  const isLocalNetwork = chainId === 31337 // Hardhat 本地网络
  console.log(`当前网络: ${network.name} (chainId: ${chainId})`)

  // 根据网络选择铸造目标账户
  const mintTargets = isLocalNetwork ? TEST_ACCOUNTS : [DEMO_TEST_ACCOUNT]
  console.log('铸造目标账户:', mintTargets)

  console.log('\n========== 开始部署 Uniswap V2 ==========\n')

  // 1. 部署 WETH
  console.log('1. 部署 WETH...')
  const WETH = await ethers.getContractFactory('WETH')
  const weth = await WETH.deploy()
  await weth.waitForDeployment()
  console.log('   WETH 地址:', await weth.getAddress())

  // 2. 部署 Factory
  console.log('\n2. 部署 UniswapV2Factory...')
  const Factory = await ethers.getContractFactory('UniswapV2Factory')
  const factory = await Factory.deploy(deployer.address)
  await factory.waitForDeployment()
  console.log('   Factory 地址:', await factory.getAddress())

  // 3. 部署 Router
  console.log('\n3. 部署 UniswapV2Router...')
  const Router = await ethers.getContractFactory('UniswapV2Router')
  const router = await Router.deploy(
    await factory.getAddress(),
    await weth.getAddress()
  )
  await router.waitForDeployment()
  console.log('   Router 地址:', await router.getAddress())

  // 4. 部署测试代币
  console.log('\n4. 部署测试代币...')
  const Token = await ethers.getContractFactory('ERC20Token')

  const tokenA = await Token.deploy('Token A', 'TKA', 18)
  await tokenA.waitForDeployment()
  console.log('   Token A (TKA) 地址:', await tokenA.getAddress())

  const tokenB = await Token.deploy('Token B', 'TKB', 18)
  await tokenB.waitForDeployment()
  console.log('   Token B (TKB) 地址:', await tokenB.getAddress())

  // 5. 铸造代币到目标账户
  console.log('\n5. 铸造代币到目标账户...')
  for (const account of mintTargets) {
    console.log(`   铸造到 ${account}:`)

    const mintTxA = await tokenA.mint(account, MINT_AMOUNT_PER_ACCOUNT)
    await mintTxA.wait()
    console.log(
      `      - Token A: ${ethers.formatEther(MINT_AMOUNT_PER_ACCOUNT)} TKA`
    )

    const mintTxB = await tokenB.mint(account, MINT_AMOUNT_PER_ACCOUNT)
    await mintTxB.wait()
    console.log(
      `      - Token B: ${ethers.formatEther(MINT_AMOUNT_PER_ACCOUNT)} TKB`
    )
  }
  console.log('   ✅ 代币铸造完成')

  // 6. 创建交易对
  console.log('\n6. 创建交易对 TKA/TKB...')
  const tx = await factory.createPair(
    await tokenA.getAddress(),
    await tokenB.getAddress()
  )
  await tx.wait()
  const pairAddress = await factory.getPair(
    await tokenA.getAddress(),
    await tokenB.getAddress()
  )
  console.log('   交易对地址:', pairAddress)

  // 7. 更新前端合约地址配置
  console.log('\n7. 更新前端合约地址...')
  const contracts = {
    WETH: await weth.getAddress(),
    Factory: await factory.getAddress(),
    Router: await router.getAddress(),
    TokenA: await tokenA.getAddress(),
    TokenB: await tokenB.getAddress(),
    Pair: pairAddress
  }

  const configContent = `// Uniswap V2 合约地址 (自动生成，请勿手动修改)
// 生成时间: ${new Date().toLocaleString()}

export const CONTRACTS = {
  WETH: '${contracts.WETH}' as \`0x\${string}\`,
  Factory: '${contracts.Factory}' as \`0x\${string}\`,
  Router: '${contracts.Router}' as \`0x\${string}\`,
  TokenA: '${contracts.TokenA}' as \`0x\${string}\`,
  TokenB: '${contracts.TokenB}' as \`0x\${string}\`,
  Pair: '${contracts.Pair}' as \`0x\${string}\`,
} as const

// 零地址
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// 检查合约是否已部署（地址有效且非零地址）
export const isContractsDeployed = () => {
  return Object.values(CONTRACTS).every(
    addr => addr && addr.length === 42 && addr !== ZERO_ADDRESS
  )
}
`

  const configPath = path.join(
    __dirname,
    '../../frontend/src/config/contracts.ts'
  )
  fs.writeFileSync(configPath, configContent)
  console.log('   ✅ 已更新 frontend/src/config/contracts.ts')

  console.log('\n========== 部署完成 ==========\n')

  // 输出合约地址汇总
  console.log('合约地址汇总:')
  console.log('------------------------------------')
  console.log('WETH:     ', contracts.WETH)
  console.log('Factory:  ', contracts.Factory)
  console.log('Router:   ', contracts.Router)
  console.log('Token A:  ', contracts.TokenA)
  console.log('Token B:  ', contracts.TokenB)
  console.log('Pair:     ', contracts.Pair)
  console.log('------------------------------------')
  console.log('\n🚀 现在可以访问 http://localhost:3000/uniswap 测试了！')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
