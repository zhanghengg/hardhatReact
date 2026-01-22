# WETH.sol

## 文件职责

- 将 ETH 包装成 ERC20 风格代币（WETH）。
- 主要能力：
  - `deposit`：存 ETH 得到 WETH 余额。
  - `withdraw`：销毁 WETH 余额取回 ETH。
  - ERC20 风格方法：`approve/transfer/transferFrom`。

## 关键状态变量

- `mapping(address => uint256) public balanceOf`
- `mapping(address => mapping(address => uint256)) public allowance`

## 对外方法与作用

- `deposit() public payable`

  - 增加 `balanceOf[msg.sender]`。

- `withdraw(uint256 wad) public`

  - 扣减 `balanceOf[msg.sender]` 并向调用者转出等额 ETH。

- `totalSupply() public view returns (uint256)`

  - 返回 `address(this).balance`（合约持有的 ETH）。

- `approve(address guy, uint256 wad) public returns (bool)`

  - 设置授权额度。

- `transfer(address dst, uint256 wad) public returns (bool)`

  - 等价于 `transferFrom(msg.sender, dst, wad)`。

- `transferFrom(address src, address dst, uint256 wad) public returns (bool)`

  - 在授权额度下搬运 WETH。

- `receive() external payable`
  - 直接收 ETH 时自动 `deposit()`。

## 与其他合约的关系

- 本目录的 Router 合约保存了 `WETH` 地址，但未实现 ETH 入口方法；如果你后续扩展 Router 的 ETH 功能，会用到 WETH 的 `deposit/withdraw`。
