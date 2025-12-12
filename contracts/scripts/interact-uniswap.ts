import { ethers } from 'hardhat'

/**
 * Uniswap V2 交互学习脚本
 * 演示：添加流动性、交换代币、移除流动性
 */
async function main() {
  const [deployer, user] = await ethers.getSigners()
  console.log('========== Uniswap V2 交互演示 ==========\n')

  // 部署合约
  const WETH = await ethers.getContractFactory('WETH')
  const weth = await WETH.deploy()

  const Factory = await ethers.getContractFactory('UniswapV2Factory')
  const factory = await Factory.deploy(deployer.address)

  const Router = await ethers.getContractFactory('UniswapV2Router')
  const router = await Router.deploy(
    await factory.getAddress(),
    await weth.getAddress()
  )

  const Token = await ethers.getContractFactory('ERC20Token')
  const tokenA = await Token.deploy(
    'Token A',
    'TKA',
    18,
    ethers.parseEther('1000000')
  )
  const tokenB = await Token.deploy(
    'Token B',
    'TKB',
    18,
    ethers.parseEther('1000000')
  )

  console.log('✅ 合约部署完成\n')

  // ========== 1. 添加流动性 ==========
  console.log('【1. 添加流动性】')

  const amountA = ethers.parseEther('10000') // 10000 TKA
  const amountB = ethers.parseEther('20000') // 20000 TKB (初始价格 1 TKA = 2 TKB)

  // 授权 Router 使用代币
  await tokenA.approve(await router.getAddress(), amountA)
  await tokenB.approve(await router.getAddress(), amountB)
  console.log('   已授权 Router 使用代币')

  // 添加流动性
  const deadline = Math.floor(Date.now() / 1000) + 3600
  const addLiqTx = await router.addLiquidity(
    await tokenA.getAddress(),
    await tokenB.getAddress(),
    amountA,
    amountB,
    0, // amountAMin
    0, // amountBMin
    deployer.address,
    deadline
  )
  await addLiqTx.wait()

  // 获取交易对信息
  const pairAddress = await factory.getPair(
    await tokenA.getAddress(),
    await tokenB.getAddress()
  )
  const pair = await ethers.getContractAt('UniswapV2Pair', pairAddress)
  const [reserve0, reserve1] = await pair.getReserves()
  const lpBalance = await pair.balanceOf(deployer.address)

  console.log('   交易对地址:', pairAddress)
  console.log('   储备量 Reserve0:', ethers.formatEther(reserve0))
  console.log('   储备量 Reserve1:', ethers.formatEther(reserve1))
  console.log('   获得 LP 代币:', ethers.formatEther(lpBalance))

  // ========== 2. 交换代币 (Swap) ==========
  console.log('\n【2. 交换代币】')

  const swapAmountIn = ethers.parseEther('100') // 用 100 TKA 换 TKB

  // 查询预期输出
  const amountsOut = await router.getAmountsOut(swapAmountIn, [
    await tokenA.getAddress(),
    await tokenB.getAddress()
  ])
  console.log('   输入:', ethers.formatEther(swapAmountIn), 'TKA')
  console.log('   预期输出:', ethers.formatEther(amountsOut[1]), 'TKB')

  // 执行交换前的余额
  const balanceABefore = await tokenA.balanceOf(deployer.address)
  const balanceBBefore = await tokenB.balanceOf(deployer.address)

  // 授权并交换
  await tokenA.approve(await router.getAddress(), swapAmountIn)
  await router.swapExactTokensForTokens(
    swapAmountIn,
    0, // amountOutMin (生产环境要设置滑点保护!)
    [await tokenA.getAddress(), await tokenB.getAddress()],
    deployer.address,
    deadline
  )

  // 交换后的余额
  const balanceAAfter = await tokenA.balanceOf(deployer.address)
  const balanceBAfter = await tokenB.balanceOf(deployer.address)

  console.log(
    '   实际消耗 TKA:',
    ethers.formatEther(balanceABefore - balanceAAfter)
  )
  console.log(
    '   实际获得 TKB:',
    ethers.formatEther(balanceBAfter - balanceBBefore)
  )

  // 查看交换后的储备量变化
  const [newReserve0, newReserve1] = await pair.getReserves()
  console.log('   新储备量 Reserve0:', ethers.formatEther(newReserve0))
  console.log('   新储备量 Reserve1:', ethers.formatEther(newReserve1))

  // ========== 3. 价格影响演示 ==========
  console.log('\n【3. 价格影响 (Price Impact)】')

  // 小额交易
  const smallAmount = ethers.parseEther('10')
  const smallOut = await router.getAmountsOut(smallAmount, [
    await tokenA.getAddress(),
    await tokenB.getAddress()
  ])
  const smallPrice =
    Number(ethers.formatEther(smallOut[1])) /
    Number(ethers.formatEther(smallAmount))

  // 大额交易
  const largeAmount = ethers.parseEther('1000')
  const largeOut = await router.getAmountsOut(largeAmount, [
    await tokenA.getAddress(),
    await tokenB.getAddress()
  ])
  const largePrice =
    Number(ethers.formatEther(largeOut[1])) /
    Number(ethers.formatEther(largeAmount))

  console.log(
    '   小额交易 (10 TKA)  -> 价格:',
    smallPrice.toFixed(4),
    'TKB/TKA'
  )
  console.log(
    '   大额交易 (1000 TKA) -> 价格:',
    largePrice.toFixed(4),
    'TKB/TKA'
  )
  console.log(
    '   价格影响:',
    (((smallPrice - largePrice) / smallPrice) * 100).toFixed(2),
    '%'
  )

  // ========== 4. 移除流动性 ==========
  console.log('\n【4. 移除流动性】')

  const lpToRemove = lpBalance / 2n // 移除一半 LP

  // 授权 Router 使用 LP 代币
  await pair.approve(await router.getAddress(), lpToRemove)

  const balanceABeforeRemove = await tokenA.balanceOf(deployer.address)
  const balanceBBeforeRemove = await tokenB.balanceOf(deployer.address)

  await router.removeLiquidity(
    await tokenA.getAddress(),
    await tokenB.getAddress(),
    lpToRemove,
    0,
    0,
    deployer.address,
    deadline
  )

  const balanceAAfterRemove = await tokenA.balanceOf(deployer.address)
  const balanceBAfterRemove = await tokenB.balanceOf(deployer.address)

  console.log('   移除 LP 数量:', ethers.formatEther(lpToRemove))
  console.log(
    '   取回 TKA:',
    ethers.formatEther(balanceAAfterRemove - balanceABeforeRemove)
  )
  console.log(
    '   取回 TKB:',
    ethers.formatEther(balanceBAfterRemove - balanceBBeforeRemove)
  )

  // 最终储备量
  const [finalReserve0, finalReserve1] = await pair.getReserves()
  console.log('   最终储备量 Reserve0:', ethers.formatEther(finalReserve0))
  console.log('   最终储备量 Reserve1:', ethers.formatEther(finalReserve1))

  console.log('\n========== 演示完成 ==========')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
