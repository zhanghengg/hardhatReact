# Uniswap V2（本仓库版本）代码学习笔记

本笔记基于目录：`contracts/contracts/uniswap-v2`。

## 目录

- [整体结构与阅读顺序](#整体结构与阅读顺序)
- [UniswapV2Factory.sol](#uniswapv2factorysol)
- [UniswapV2Pair.sol](#uniswapv2pairsol)
- [UniswapV2ERC20.sol](#uniswapv2erc20sol)
- [UniswapV2Router.sol](#uniswapv2routersol)
- [WETH.sol](#wethsol)
- [libraries/Math.sol](#librariesmathsol)
- [libraries/UQ112x112.sol](#librariesuq112x112sol)
- [libraries/UniswapV2Library.sol](#librariesuniswapv2librarysol)

## 整体结构与阅读顺序

建议你按下面顺序阅读（从“状态如何存储”到“用户如何调用”）：

1. `UniswapV2ERC20.sol`
   - LP Token 的 ERC20 + `permit`（EIP-2612）逻辑。
2. `UniswapV2Pair.sol`
   - AMM 核心：`mint/burn/swap/sync/skim`，储备量、手续费、TWAP 累积价格。
3. `UniswapV2Factory.sol`
   - 负责用 CREATE2 部署 Pair、记录 `getPair` 映射、管理协议费接收地址。
4. `libraries/*`
   - `Math` / `UQ112x112` / `UniswapV2Library`：常用计算、价格定点数、路径多跳报价。
5. `UniswapV2Router.sol`
   - “用户入口”：封装加/减流动性、代币交换、以及对库函数的查询包装。
6. `WETH.sol`
   - 本地 WETH 实现，主要用于把 ETH 包装成 ERC20（当前 Router 里只保存了 `WETH` 地址，但本版本 Router 没实现 ETH 相关入口）。

---

## UniswapV2Factory.sol

### 文件职责

- **创建与管理交易对（Pair）**。
- 维护：
  - `getPair[tokenA][tokenB] -> pairAddress`（双向映射）。
  - `allPairs` 数组。
- 管理协议费：
  - `feeTo`：协议费接收地址。
  - `feeToSetter`：允许修改 `feeTo` 的权限地址。

### 关键状态变量

- `address public feeTo`
- `address public feeToSetter`
- `mapping(address => mapping(address => address)) public getPair`
- `address[] public allPairs`

### 对外方法与作用

- `constructor(address _feeToSetter)`

  - 初始化权限地址 `feeToSetter`。

- `function allPairsLength() external view returns (uint256)`

  - 返回已创建的 Pair 数量。

- `function createPair(address tokenA, address tokenB) external returns (address pair)`

  - 使用 CREATE2 部署 `UniswapV2Pair`。
  - 核心点：
    - 对 `tokenA/tokenB` 做排序，确保 `token0 < token1`。
    - 防止重复创建（`PAIR_EXISTS`）。
    - 部署后调用 `pair.initialize(token0, token1)` 完成初始化。
    - 写入 `getPair` 双向映射并 push 到 `allPairs`。

- `function setFeeTo(address _feeTo) external`

  - 仅 `feeToSetter` 可调用。
  - 设置协议费接收地址（Pair 的 `_mintFee` 会读取该地址以决定是否开启协议费）。

- `function setFeeToSetter(address _feeToSetter) external`
  - 仅 `feeToSetter` 可调用。
  - 变更权限管理员。

---

## UniswapV2Pair.sol

### 文件职责

- **每个交易对一个 Pair 合约实例**，实现恒定乘积 AMM：
  - 添加流动性（铸造 LP）：`mint`
  - 移除流动性（销毁 LP）：`burn`
  - 交换：`swap`（支持 flash swap 回调）
  - 储备同步与“扫多余余额”：`sync/skim`
- 维护储备量与价格累积器（TWAP 预言机相关）。
- 协议费（若 `factory.feeTo != 0`）通过 `_mintFee` 铸造 LP 给 `feeTo`。

### 关键状态变量

- `address public factory`
- `address public token0`
- `address public token1`
- `uint112 private reserve0`
- `uint112 private reserve1`
- `uint32 private blockTimestampLast`
- `uint256 public price0CumulativeLast`
- `uint256 public price1CumulativeLast`
- `uint256 public kLast`
- `uint256 private unlocked` + `modifier lock()`：重入锁

### 对外方法与作用

- `constructor()`

  - 把 `factory` 设置为部署者（Factory 用 CREATE2 部署 Pair，因此这里的 `msg.sender` 即 Factory）。

- `function initialize(address _token0, address _token1) external`

  - 仅允许 `factory` 调用。
  - 设置 `token0/token1`。

- `function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)`

  - 返回储备量与上次更新时间戳。

- `function mint(address to) external returns (uint256 liquidity)`

  - “加流动性”核心：
    - 读取当前 token 余额与储备的差值，得到本次实际注入 `amount0/amount1`。
    - 首次注入：`sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY`，并把 `MINIMUM_LIQUIDITY` 铸给 `address(0)` 永久锁定。
    - 非首次：按比例铸造：`min(amount0 * totalSupply / reserve0, amount1 * totalSupply / reserve1)`。
    - 调用 `_update` 写入新储备、更新价格累积器。
    - 若协议费开启：更新 `kLast`。

- `function burn(address to) external returns (uint256 amount0, uint256 amount1)`

  - “减流动性”核心：
    - Router 会先把 LP `transferFrom` 到 Pair 自己地址。
    - 读取 Pair 当前 token 余额和 `liquidity = balanceOf[address(this)]`。
    - 按份额赎回：`amount0 = liquidity * balance0 / totalSupply`，`amount1 = liquidity * balance1 / totalSupply`。
    - `_burn` 销毁 LP，并把 token0/token1 安全转给 `to`。
    - `_update` 更新储备。

- `function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external`

  - 交换核心：
    - 校验输出量、流动性、`to` 不能是 `token0/token1`。
    - 先转出 `amount0Out/amount1Out`。
    - 若 `data.length > 0`，触发 flash swap 回调：`IUniswapV2Callee(to).uniswapV2Call(...)`。
    - 读取转出+回调后的新余额，反推 `amount0In/amount1In`。
    - 校验扣除 0.3% 手续费后的 `K` 不下降（`balanceAdjusted` 检查）。
    - `_update` 更新储备并发事件。

- `function skim(address to) external`

  - 把“多余余额”（余额 - 储备）转出到 `to`。
  - 常用于有人误转 token 到 Pair 或 flash swap 后清理。

- `function sync() external`
  - 强制把储备更新为当前余额（用于纠正储备与余额不一致）。

### 关键内部方法（理解逻辑必读）

- `_safeTransfer(token, to, value)`

  - 通过低级 `call` 调用 `IERC20.transfer`，兼容“无返回值 ERC20”。

- `_update(balance0, balance1, _reserve0, _reserve1)`

  - 写入 `reserve0/reserve1/blockTimestampLast`。
  - 如果时间流逝且储备非 0，累积 TWAP：
    - `price0CumulativeLast += (reserve1/reserve0) * dt`
    - `price1CumulativeLast += (reserve0/reserve1) * dt`

- `_mintFee(_reserve0, _reserve1) returns (bool feeOn)`
  - 若 `factory.feeTo != address(0)`，开启协议费：
    - 当 `sqrt(k)` 增长时，按公式给 `feeTo` 铸造 LP。
  - 若关闭协议费且 `kLast != 0`，重置 `kLast = 0`。

---

## UniswapV2ERC20.sol

### 文件职责

- Pair 的 LP Token 基础实现：
  - `approve/transfer/transferFrom`
  - 内部 `_mint/_burn`
  - `permit`（EIP-2612）离线签名授权

### 关键状态变量

- `string public constant name/symbol`
- `uint8 public constant decimals`
- `uint256 public totalSupply`
- `mapping(address => uint256) public balanceOf`
- `mapping(address => mapping(address => uint256)) public allowance`
- `bytes32 public DOMAIN_SEPARATOR`
- `bytes32 public constant PERMIT_TYPEHASH`
- `mapping(address => uint256) public nonces`

### 对外方法与作用

- `approve(address spender, uint256 value)`

  - 授权 `spender` 可花费你的 LP。

- `transfer(address to, uint256 value)`

  - 转账 LP。

- `transferFrom(address from, address to, uint256 value)`

  - 在授权额度下搬运 LP。
  - 若 allowance 是 `type(uint256).max`，视为“无限授权”，不递减。

- `permit(owner, spender, value, deadline, v, r, s)`
  - 通过签名设置 `allowance`，减少一次链上 `approve`。

---

## UniswapV2Router.sol

### 文件职责

- 面向用户的“便捷入口”：
  - 加/减流动性
  - 代币交换（多跳）
  - 价格/路径相关查询（对 `UniswapV2Library` 的包装）

### 关键状态变量

- `address public immutable factory`
- `address public immutable WETH`
- `modifier ensure(deadline)`：防止过期交易

### 对外方法与作用

- `constructor(address _factory, address _WETH)`

  - 初始化 Factory/WETH 地址。

- `addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline) returns (amountA, amountB, liquidity)`

  - 内部调用 `_addLiquidity` 算出最优 `amountA/amountB`。
  - 把两种 token `transferFrom` 到 Pair。
  - 调用 Pair 的 `mint(to)`，返回 LP 数量。

- `removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline) returns (amountA, amountB)`

  - 把 LP `transferFrom` 到 Pair。
  - 调用 Pair 的 `burn(to)` 取回两种 token。
  - 根据 `sortTokens` 把 `amount0/amount1` 映射回 `tokenA/tokenB`。
  - 检查 `amountAMin/amountBMin`。

- `swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline) returns (amounts)`

  - 通过 `UniswapV2Library.getAmountsOut` 计算多跳输出数组 `amounts`。
  - 把输入 token 转进第一跳 Pair。
  - 调用 `_swap` 逐跳执行 Pair.swap。

- `swapTokensForExactTokens(amountOut, amountInMax, path, to, deadline) returns (amounts)`

  - 通过 `UniswapV2Library.getAmountsIn` 反推所需输入。
  - 校验 `amounts[0] <= amountInMax`。
  - 把输入 token 转进第一跳 Pair 并 `_swap`。

- 查询包装：
  - `quote(amountA, reserveA, reserveB)`
  - `getAmountOut(amountIn, reserveIn, reserveOut)`
  - `getAmountIn(amountOut, reserveIn, reserveOut)`
  - `getAmountsOut(amountIn, path)`
  - `getAmountsIn(amountOut, path)`

### 关键内部方法

- `_addLiquidity(...) returns (amountA, amountB)`

  - 若 Pair 不存在先 `factory.createPair`。
  - 若池子为空：直接用 desired 数量。
  - 否则按储备比例用 `quote` 计算“最优配比”，并校验 min。

- `_swap(amounts, path, _to)`

  - 逐跳：
    - 确定 input/output 的 `token0` 排序。
    - 决定本跳 `amount0Out/amount1Out`。
    - `to` 若不是最后一跳则是下一跳 Pair，否则是最终接收者 `_to`。

- `_safeTransferFrom(token, from, to, value)`
  - 用低级 `call` 调 `IERC20.transferFrom`，兼容非标准 ERC20。

---

## WETH.sol

### 文件职责

- 把 ETH 包装成 ERC20 风格代币：
  - 存 ETH 得 WETH：`deposit`/`receive`
  - 烧 WETH 取回 ETH：`withdraw`
  - ERC20 风格：`approve/transfer/transferFrom`

### 对外方法与作用

- `deposit() payable`

  - `balanceOf[msg.sender] += msg.value`。

- `withdraw(uint256 wad)`

  - 扣减 WETH 余额并 `transfer` ETH 给调用者。

- `totalSupply()`

  - 等于合约持有 ETH 的余额。

- `approve(guy, wad)` / `transfer(dst, wad)` / `transferFrom(src, dst, wad)`

  - 轻量 ERC20 逻辑。

- `receive() external payable`
  - 直接收 ETH 时自动调用 `deposit()`。

---

## libraries/Math.sol

### 文件职责

- 数学工具：
  - `min`
  - `sqrt`（巴比伦法）

### 方法

- `min(uint256 x, uint256 y) -> uint256`

  - 返回较小值。

- `sqrt(uint256 y) -> uint256`
  - 求平方根。
  - 用于初次铸造 LP 时的 `sqrt(amount0 * amount1)`。

---

## libraries/UQ112x112.sol

### 文件职责

- 112.112 定点数运算，用于 TWAP 累积价格计算。

### 方法

- `encode(uint112 y) -> uint224`

  - 将整数转为定点数（乘以 `2**112`）。

- `uqdiv(uint224 x, uint112 y) -> uint224`
  - 定点数除法：`x / y`。

---

## libraries/UniswapV2Library.sol

### 文件职责

- Router/外部查询常用的纯计算与路径计算：
  - token 排序
  - CREATE2 计算 Pair 地址
  - 获取储备
  - 报价/多跳 amount 计算

### 方法

- `sortTokens(tokenA, tokenB) -> (token0, token1)`

  - 对 token 地址排序，保证一致性。

- `pairFor(factory, tokenA, tokenB) -> pair`

  - 用 CREATE2 规则推导 Pair 地址（无需读链上 storage）。
  - 注意：这里使用 `type(UniswapV2Pair).creationCode` 作为 init code hash 输入。

- `getReserves(factory, tokenA, tokenB) -> (reserveA, reserveB)`

  - 读取 Pair 的 `getReserves()` 并映射回 A/B 顺序。

- `getAmountOut(amountIn, reserveIn, reserveOut) -> amountOut`

  - 给定输入算输出（含 0.3% 手续费）：
    - `amountOut = (amountIn*997*reserveOut) / (reserveIn*1000 + amountIn*997)`

- `getAmountIn(amountOut, reserveIn, reserveOut) -> amountIn`

  - 给定期望输出反推所需输入（含手续费），结果会 `+1` 做向上取整。

- `getAmountsOut(factory, amountIn, path) -> amounts[]`

  - 多跳：从 `path[0]` 开始逐跳用 `getAmountOut` 推导整条路径输出。

- `getAmountsIn(factory, amountOut, path) -> amounts[]`

  - 多跳：从终点反推每一跳所需输入。

- `quote(amountA, reserveA, reserveB) -> amountB`
  - 不含手续费的等价比例换算：`amountB = amountA * reserveB / reserveA`。
