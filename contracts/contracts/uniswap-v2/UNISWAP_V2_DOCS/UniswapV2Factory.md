# UniswapV2Factory.sol

## 文件职责

- 负责创建与管理所有交易对（Pair）。
- 维护交易对索引：
  - `getPair[tokenA][tokenB] -> pair`（双向映射）。
  - `allPairs` 数组。
- 管理协议费参数：
  - `feeTo`：协议费接收地址。
  - `feeToSetter`：可修改 `feeTo`/`feeToSetter` 的管理员。

## 关键状态变量

- `address public feeTo`
- `address public feeToSetter`
- `mapping(address => mapping(address => address)) public getPair`
- `address[] public allPairs`

## 对外方法与作用

- `constructor(address _feeToSetter)`

  - 初始化 `feeToSetter`。

- `allPairsLength() external view returns (uint256)`

  - 返回 `allPairs.length`。

- `createPair(address tokenA, address tokenB) external returns (address pair)`

  - 创建交易对（核心入口）。
  - 关键点：
    - 校验 `tokenA != tokenB`。
    - 对 token 地址排序得到 `token0 < token1`，并禁止 `token0 == 0`。
    - 若 `getPair[token0][token1] != 0`，拒绝重复创建。
    - 使用 CREATE2 部署 `UniswapV2Pair`，salt 为 `keccak256(token0, token1)`。
    - 部署后调用 `pair.initialize(token0, token1)` 完成初始化。
    - 写入 `getPair` 双向映射并追加到 `allPairs`。

- `setFeeTo(address _feeTo) external`

  - 仅 `feeToSetter` 可调用。
  - 设置协议费接收地址。

- `setFeeToSetter(address _feeToSetter) external`
  - 仅 `feeToSetter` 可调用。
  - 转移管理员权限。

## 与其他合约的关系

- Factory 通过 CREATE2 部署 `UniswapV2Pair`。
- Pair 在 `_mintFee` 中会通过 `factory.feeTo()` 判断协议费是否开启。
