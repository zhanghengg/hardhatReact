# UniswapV2Router.sol

## 文件职责

- 面向用户的主要交互入口：
  - 添加/移除流动性
  - 代币交换（支持多跳）
  - 报价与路径计算的查询包装

## 关键状态变量

- `address public immutable factory`
- `address public immutable WETH`
- `modifier ensure(uint256 deadline)`：过期保护

## 对外方法与作用

- `constructor(address _factory, address _WETH)`

  - 设置 `factory`、`WETH`。

- `addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline)`

  - 若 pair 不存在则创建。
  - 计算最优注入比例（避免“多转一种 token 留在 Router/Pair 外围”）。
  - 把 tokenA/tokenB `transferFrom` 到 Pair。
  - 调用 Pair `mint(to)` 返回 LP 数量。

- `removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline)`

  - 将 LP `transferFrom` 到 Pair。
  - 调用 Pair `burn(to)` 赎回两种 token。
  - 映射 `amount0/amount1` 到 `tokenA/tokenB` 顺序并做最小量校验。

- `swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)`

  - `UniswapV2Library.getAmountsOut` 计算 `amounts[]`。
  - 把输入 token 转入第一跳 Pair。
  - `_swap` 执行逐跳 Pair.swap。

- `swapTokensForExactTokens(amountOut, amountInMax, path, to, deadline)`

  - `UniswapV2Library.getAmountsIn` 反推 `amounts[]`。
  - 校验 `amounts[0] <= amountInMax`。
  - 把输入 token 转入第一跳 Pair，并 `_swap`。

- 查询包装：
  - `quote(amountA, reserveA, reserveB)`
  - `getAmountOut(amountIn, reserveIn, reserveOut)`
  - `getAmountIn(amountOut, reserveIn, reserveOut)`
  - `getAmountsOut(amountIn, path)`
  - `getAmountsIn(amountOut, path)`

## 关键内部方法

- `_addLiquidity(...)`

  - 若 pair 不存在先 `factory.createPair`。
  - 若池子为空：直接使用 desired 数量。
  - 否则：用 `UniswapV2Library.quote` 按储备比例求“最优配比”，并校验 `amountAMin/amountBMin`。

- `_swap(amounts, path, _to)`

  - 逐跳调用 Pair.swap。
  - 中间跳的 `to` 会指向下一跳 Pair，最后一跳输出给 `_to`。

- `_safeTransferFrom(token, from, to, value)`
  - 低级 `call` 调 `IERC20.transferFrom`，兼容非标准 ERC20。

## 与其他合约/库的关系

- 强依赖 `UniswapV2Library` 做报价/路径计算。
- 直接调用 Pair 的 `mint/burn/swap`。
- 通过 Factory `getPair/createPair` 确保池子存在。
- 保存 `WETH` 地址（但本版本 Router 未实现 ETH 相关入口）。
