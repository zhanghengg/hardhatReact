# UniswapV2ERC20.sol

## 文件职责

- Pair 的 LP Token 基础实现：
  - ERC20 最小子集：`approve/transfer/transferFrom`
  - 内部铸造/销毁：`_mint/_burn`
  - `permit`（EIP-2612）：用签名完成授权

## 关键状态变量

- `string public constant name = "Uniswap V2"`
- `string public constant symbol = "UNI-V2"`
- `uint8 public constant decimals = 18`
- `uint256 public totalSupply`
- `mapping(address => uint256) public balanceOf`
- `mapping(address => mapping(address => uint256)) public allowance`

EIP-2612：

- `bytes32 public DOMAIN_SEPARATOR`
- `bytes32 public constant PERMIT_TYPEHASH`
- `mapping(address => uint256) public nonces`

## 对外方法与作用

- `approve(address spender, uint256 value) external returns (bool)`

  - 设置 `allowance[msg.sender][spender]`。

- `transfer(address to, uint256 value) external returns (bool)`

  - 将 LP 从 `msg.sender` 转给 `to`。

- `transferFrom(address from, address to, uint256 value) external returns (bool)`

  - 依据授权从 `from` 转到 `to`。
  - 若 allowance 为 `type(uint256).max`，视为无限授权，不递减。

- `permit(owner, spender, value, deadline, v, r, s) external`
  - EIP-2612 离线签名授权。
  - 通过 EIP-712 的 `DOMAIN_SEPARATOR` 与 `PERMIT_TYPEHASH` 构造 digest。
  - `ecrecover` 验证签名后调用 `_approve(owner, spender, value)`。

## 内部方法（被 Pair 使用）

- `_mint(address to, uint256 value) internal`
- `_burn(address from, uint256 value) internal`

## 与其他合约的关系

- `UniswapV2Pair` 继承它，用它作为 LP Token。
