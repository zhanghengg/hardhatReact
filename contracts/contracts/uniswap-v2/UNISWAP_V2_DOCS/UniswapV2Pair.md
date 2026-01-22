# UniswapV2Pair.sol

## 文件职责

- 每个交易对一个 Pair 合约实例，承载 AMM 核心逻辑：
  - 添加流动性：`mint`
  - 移除流动性：`burn`
  - 交换：`swap`（支持 flash swap 回调）
  - 状态维护：`sync` / `skim`
- 存储储备量（reserve）并维护 TWAP 相关的价格累积器。
- 若协议费开启（`factory.feeTo != 0`），会在流动性增长时通过 `_mintFee` 给 `feeTo` 铸造 LP。

## 关键状态变量

- `address public factory`
- `address public token0`
- `address public token1`
- `uint112 private reserve0`
- `uint112 private reserve1`
- `uint32 private blockTimestampLast`
- `uint256 public price0CumulativeLast`
- `uint256 public price1CumulativeLast`
- `uint256 public kLast`
- `modifier lock()`：重入锁

## 对外方法与作用

- `initialize(address _token0, address _token1) external`

  - 仅允许 `factory` 调用一次。
  - 设置 `token0/token1`。

- `getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)`

  - 返回当前储备与上次更新时间戳。

- `mint(address to) external returns (uint256 liquidity)`

  - 在 Pair 已收到 token0/token1 后调用。
  - 用“余额 - 储备”得到本次实际注入量 `amount0/amount1`。
  - 首次注入：`sqrt(amount0*amount1) - MINIMUM_LIQUIDITY`，并锁定最小流动性。
  - 非首次注入：按比例铸造 `min(amount0*totalSupply/reserve0, amount1*totalSupply/reserve1)`。
  - 更新储备 `_update(...)`，并在协议费开启时更新 `kLast`。

- `burn(address to) external returns (uint256 amount0, uint256 amount1)`

  - Router 通常会先把 LP `transferFrom` 到 Pair 自己。
  - 按 `liquidity/totalSupply` 份额赎回两种 token。
  - `_burn` 销毁 LP，并把 token 转给 `to`。
  - `_update(...)` 更新储备。

- `swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external`

  - 核心 swap：
    - 先把 `amount0Out/amount1Out` 转出。
    - 若 `data` 非空，回调 `to.uniswapV2Call(...)`（flash swap）。
    - 通过新的余额反推 `amount0In/amount1In`。
    - 用“扣除 0.3% 手续费后的余额”检查 `K` 不下降。
    - `_update(...)` 更新储备。

- `skim(address to) external`

  - 把“余额超出储备的部分”转走。

- `sync() external`
  - 把储备强制同步为当前余额。

## 关键内部方法（理解逻辑必读）

- `_safeTransfer(token, to, value)`

  - 低级 `call` 调用 `IERC20.transfer`，兼容非标准 ERC20。

- `_update(balance0, balance1, _reserve0, _reserve1)`

  - 写入储备与时间戳。
  - 若 `timeElapsed > 0` 且储备非 0，累积价格（TWAP 基础）。

- `_mintFee(_reserve0, _reserve1)`
  - 若 `factory.feeTo != 0`，根据 `sqrt(k)` 的增长给 `feeTo` 铸造 LP。

## 与其他合约/库的关系

- 继承自 `UniswapV2ERC20`（LP Token）。
- 使用 `Math.sqrt/min`、`UQ112x112`。
- 通过 `IERC20` 读取余额/转账。
- 通过 `IUniswapV2Factory(factory).feeTo()` 判断协议费。
- Router 通过 `mint/burn/swap` 驱动 Pair 状态变化。
