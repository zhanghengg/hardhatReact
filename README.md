# hardhatReact

一个 Web3 全栈 Monorepo：`Hardhat + Solidity` 合约工程 + `Next.js` 前端应用。

> 适合用于展示「前端 + 智能合约」一体化开发能力。

## Tech Stack

- **Smart Contracts**: Solidity `0.8.24`, Hardhat, OpenZeppelin
- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS
- **Web3 Client**: wagmi, viem, ethers
- **Deploy/Runtime**: Local Hardhat Node, Sepolia (optional)

## Repository Structure

- `contracts/`：合约工程（编译、测试、部署脚本）
- `frontend/`：前端工程（项目展示页 + Web3 交互）
- `scripts/`：一键本地开发脚本（启动链、部署、启动前端）
- `strategies/`：TradingView Pine Script 策略示例

## Key Features

- 本地一键开发：自动启动 Hardhat 节点、编译、部署、启动前端
- ABI 自动导出：合约编译后自动写入 `frontend/src/abi`
- 地址自动同步：部署后自动生成 `frontend/src/lib/contracts.ts`
- 包含 Uniswap V2 简化实现（学习/演示用途）

## Quick Start

### 1) Install dependencies

```bash
# root
npm install

# contracts
cd contracts && npm install && cd ..

# frontend
cd frontend && npm install && cd ..
```

### 2) One-command local dev

```bash
npm run dev:start
```

默认行为：

- 启动 Hardhat 节点：`127.0.0.1:8545`
- 编译合约并导出 ABI
- 部署 `Counter` 合约到本地链
- 启动前端开发服务（脚本配置端口 `5173`）

### 3) Stop / check status

```bash
npm run dev:stop
npm run dev:check
```

## Contracts Commands

```bash
cd contracts
npm run build               # hardhat compile
npm run test                # hardhat test
npm run node                # local chain
npm run deploy:localhost    # deploy to local node
npm run deploy:uniswap      # deploy uniswap demo to local
npm run deploy:uniswap:sepolia
```

## Frontend Commands

```bash
cd frontend
npm run dev
npm run build
npm run start
npm run lint
```

## Environment Variables (Sepolia)

在 `contracts/` 下创建 `.env`：

```bash
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_without_0x
```

> 不要提交真实私钥；仓库已通过 `.gitignore` 屏蔽 `.env*`。

## Current Hygiene Cleanup

本仓库已补充并建议保持：

- `.gitignore`（忽略 `node_modules`、构建产物、日志、IDE 文件）
- `README.md`（项目说明、运行方式、结构化命令）

## License

MIT (recommended)
