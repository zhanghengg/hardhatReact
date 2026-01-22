# libraries/UniswapV2Library.sol

## 文件职责

- 给 Router/外部查询提供常用计算：
  - token 排序
  - CREATE2 推导 Pair 地址
  - 读取储备
  - 单跳/多跳报价计算

## 方法

- `sortTokens(tokenA, tokenB) internal pure returns (token0, token1)`

  - 对 token 地址排序，保证 token0 < token1。

- `pairFor(factory, tokenA, tokenB) internal pure returns (pair)`

  - 基于 CREATE2 规则推导 Pair 地址。
  - 本版本用 `keccak256(type(UniswapV2Pair).creationCode)` 作为 init code hash 的来源。

- `getReserves(factory, tokenA, tokenB) internal view returns (reserveA, reserveB)`

  - 调用 Pair `getReserves()` 并映射回 A/B 的顺序。

- `getAmountOut(amountIn, reserveIn, reserveOut) internal pure returns (amountOut)`

  - 含 0.3% 手续费的输出计算：
    - `amountOut = (amountIn*997*reserveOut) / (reserveIn*1000 + amountIn*997)`

- `getAmountIn(amountOut, reserveIn, reserveOut) internal pure returns (amountIn)`

  - 含手续费的输入反推，并向上取整 `+1`。

- `getAmountsOut(factory, amountIn, path) internal view returns (amounts[])`

  - 从 `path[0]` 开始逐跳推导输出。

- `getAmountsIn(factory, amountOut, path) internal view returns (amounts[])`

  - 从终点反推所需输入。

- `quote(amountA, reserveA, reserveB) internal pure returns (amountB)`
  - 不含手续费的比例换算：`amountB = amountA * reserveB / reserveA`。

## 被谁使用

- `UniswapV2Router`：
  - 报价查询：`quote/getAmountOut/getAmountIn/getAmountsOut/getAmountsIn`。
  - 获取储备与推导 pair 地址：`getReserves/pairFor/sortTokens`。

## 与其他合约的关系

- 依赖 `UniswapV2Pair`：
  - 读取 `getReserves()`。
  - 使用 `type(UniswapV2Pair).creationCode` 参与 CREATE2 地址推导。
