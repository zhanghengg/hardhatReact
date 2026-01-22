# libraries/Math.sol

## 文件职责

- 提供基础数学工具函数。

## 方法

- `min(uint256 x, uint256 y) internal pure returns (uint256 z)`

  - 返回两者较小值。

- `sqrt(uint256 y) internal pure returns (uint256 z)`
  - 巴比伦法求平方根。
  - Pair 首次添加流动性时会用 `sqrt(amount0 * amount1)` 计算 LP 铸造量。

## 被谁使用

- `UniswapV2Pair` 使用：
  - `Math.sqrt`：首次 `mint`。
  - `Math.min`：非首次 `mint` 时按比例取较小值。
