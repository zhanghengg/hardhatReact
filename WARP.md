# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 项目概览

这是一个包含智能合约和 Next.js 前端的 Web3 单体仓库（monorepo）：

- `contracts/`：使用 Hardhat 的 Solidity 合约工程
  - `hardhat.config.ts`：Solidity 0.8.24，启用优化器，配置 `hardhat` / `localhost` / `sepolia` 网络
  - `scripts/deploy.ts`：部署 `Counter` 合约，并在前端生成 `frontend/src/lib/contracts.ts`（写入地址与 `chainId`）
  - `package.json`：常用脚本（`build`、`test`、`node`、`deploy:localhost` 等）
- `frontend/`：Next.js 15 + TypeScript + TailwindCSS 4 前端应用
  - `src/app`：App Router 目录，包含主页、`/projects`、`/about` 等页面
  - `src/components`：UI 组件、布局组件（`layout/Header`、`layout/Footer`）、粒子动画画布 `ParticleCanvas`
  - `src/data/projects.ts`：项目与技能数据源（含 `Project` 接口定义与 `projects`、`skills`）
  - `src/i18n`：基于 `I18nProvider` / `useI18n` 的多语言上下文（默认导出于 `src/i18n/index.ts`）
  - `src/lib`：工具与合约相关辅助（部署脚本会在此写入 `contracts.ts`）
  - `next.config.ts`：启用 `images.unoptimized = true`，适配 Cloudflare Pages SSR
  - `tsconfig.json`：配置 `@/* -> ./src/*` 路径别名
  - `eslint.config.mjs`：基于 `eslint-config-next` 的 ESLint 配置
  - `wrangler.toml`：Cloudflare Pages/Workers 配置，启用 `nodejs_compat`
- 根目录
  - `package.json`：聚合开发脚本 `dev:start` / `dev:stop` / `dev:check`
  - `scripts/`：本地一键开发脚本（编排 Hardhat 节点、合约部署、前端 dev server）

整体架构：
- Hardhat 负责编译与部署合约，并通过 `hardhat-abi-exporter` 将 ABI 输出到 `frontend/src/abi`
- `contracts/scripts/deploy.ts` 将部署后的 `Counter` 地址写入 `frontend/src/lib/contracts.ts`
- Next.js 前端通过 `@/lib/contracts` 与 `@/abi/*` 访问链上合约
- 布局由 `src/app/layout.tsx` 统一包裹，注入 `ThemeProvider` 和 `I18nProvider`，并挂载 `Header` / `Footer`

## 常用命令

所有命令均在仓库根目录执行，除非特别说明。

### 一键本地开发流程

- 启动本地开发环境（Hardhat 节点 + 合约部署 + 前端 dev server）：
  ```bash
  npm run dev:start
  ```
  对应 `scripts/dev-start.sh`，行为包括：
  - 如果 8545 端口上没有 Hardhat，会在 `contracts/` 目录启动 `npx hardhat node`
  - 在 `contracts/` 中执行 `npx hardhat compile`，触发 ABI 导出
  - 根据 `artifacts/contracts/Counter.sol/Counter.json` 计算哈希，判断是否需要重新部署
  - 如需部署，通过 `npx hardhat run scripts/deploy.ts --network localhost` 部署到本地链，并写入前端 `src/lib/contracts.ts`
  - 在 `frontend/` 中（如无 `node_modules` 则先安装依赖）启动 `npm run dev`（端口 5173 在脚本中配置）

- 停止本地开发环境：
  ```bash
  npm run dev:stop
  ```
  对应 `scripts/dev-stop.sh`，会尝试通过 PID 文件与端口（8545/5173）终止 Hardhat 与前端进程。

- 检查本地开发环境状态：
  ```bash
  npm run dev:check
  ```
  对应 `scripts/dev-check.sh`，会：
  - 检查 Hardhat (8545) 与前端 (5173) 端口监听情况
  - 若 Hardhat 存在，通过 JSON-RPC 请求 `web3_clientVersion` 和 `eth_chainId` 做健康检查

### 合约工程（`contracts/`）

在合约子工程中运行：
- 安装依赖：
  ```bash
  cd contracts
  npm install
  ```

- 编译合约（同时导出 ABI 到 `frontend/src/abi`）：
  ```bash
  npm run build
  # 等价于
  npx hardhat compile
  ```

- 清理构建产物：
  ```bash
  npm run clean
  ```

- 启动本地 Hardhat 节点：
  ```bash
  npm run node
  # 等价于
  npx hardhat node
  ```

- 运行所有 Hardhat 测试：
  ```bash
  npm test
  # 或
  npx hardhat test
  ```

- 运行单个测试文件（示例）：
  ```bash
  npx hardhat test test/<your-test-file>.ts
  ```

- 在本地网络部署合约（手动调用，与一键脚本行为一致）：
  ```bash
  npm run deploy:localhost
  # 等价于
  npx hardhat run scripts/deploy.ts --network localhost
  ```

> 注意：`hardhat.config.ts` 中配置了 `abiExporter`，每次编译都会将 ABI 导出至 `../frontend/src/abi`，前端依赖这些文件进行合约交互。

### 前端工程（`frontend/`）

在前端子工程中运行：

- 安装依赖：
  ```bash
  cd frontend
  npm install
  ```

- 启动 Next.js 开发服务器：
  ```bash
  npm run dev
  ```

- 构建生产包（Next.js）：
  ```bash
  npm run build
  ```

- 启动生产构建后的本地服务：
  ```bash
  npm start
  ```

- 运行 ESLint：
  ```bash
  npm run lint
  ```

- Cloudflare Pages 构建与预览 / 部署：
  ```bash
  # 构建 Cloudflare Pages 产物
  npm run pages:build

  # 本地预览（wrangler pages dev）
  npm run preview

  # 部署到 Cloudflare Pages
  npm run pages:deploy
  ```

## 前端结构与关键约定

### App Router 与布局

- `src/app/layout.tsx`：全局布局根组件
  - 应用 `Inter` 字体并设置 `<html lang="zh-CN">`
  - 在 `<head>` 中注入脚本，基于 `localStorage.theme` 决定是否添加 `dark` class，实现无闪烁的暗色模式
  - `body` 内部依次包裹 `ThemeProvider`、`I18nProvider`、`Header`、`Footer`，并在 `<main className="pt-16">` 中渲染路由内容

- 重要依赖：
  - `@/components/layout/Header` 与 `@/components/layout/Footer`：导航栏和页脚，均依赖 `useI18n()` 提供的多语言文案
  - `@/components/ThemeProvider`：提供 `useTheme()` 勾子，供 `ParticleCanvas` 等组件根据主题选择颜色

### 路由与页面

在 `src/app` 下使用 App Router：
- `/`：主页，对应 `src/app/page.tsx`
  - 使用 `framer-motion` 做滚动动画（`ScrollProgress`、`ScrollIndicator`、`ParallaxText`、`AnimatedNumber` 等）
  - 使用 `ParticleCanvas` 作为背景特效
  - 从 `@/data/projects` 与 `skills` 读取项目与技能数据，构建首页展示
- `/projects`：项目列表页（位于 `src/app/projects`）
- `/about`：个人/简介页面（位于 `src/app/about`）

### 组件与 UI

- `src/components/ui`：按钮、徽章等基础 UI 组件（例如 `Button`、`Badge`），配合 TailwindCSS 使用
- `src/components/layout`：布局性组件
  - `Header`：
    - 使用 `usePathname` 高亮当前路由
    - 导航项从 `useI18n().t.nav` 获取本地化文案
    - 提供主题与语言切换（`ThemeToggle`、`LanguageToggle`），以及 GitHub / Twitter 外链
  - `Footer`：
    - 引用 `t.footer`、`t.nav` 提供的文案
    - 包含快捷链接与联系方式
- `src/components/ParticleCanvas.tsx`：
  - 基于 `<canvas>` 实现的粒子 + 六边形网格 + 鼠标交互背景
  - 使用 `useTheme()` 决定深浅模式下使用的霓虹/柔和色系
  - 包含粒子间连接线、能量脉冲、鼠标能量波等效果，需要在性能敏感场景谨慎使用（避免多处重复挂载）

### 数据与多语言

- `src/data/projects.ts`：
  - 定义 `Project` 接口与 `projects: Project[]` 列表，描述 DEX、NFT 市场、多签钱包等示例 Web3 项目
  - 每个项目包含 `slug`、`title`、`description`、`longDescription`、`tags`、`features`、`techStack` 等字段
  - 导出 `skills` 对象，按 `frontend`、`smart_contract`、`blockchain`、`tools` 分类技能标签

- `src/i18n`：
  - `index.ts` 只导出 `I18nProvider`、`useI18n` 以及 `Locale` 类型
  - 具体文案与多语言配置在 `src/i18n/locales/*` 中维护（例如中文 `zh` 定义 nav/footer/home 等字段）
  - 前端组件通过 `const { t } = useI18n()` 访问嵌套文案对象，如 `t.nav.home`、`t.home.featuredProjects`

### 合约地址与 ABI 对接

- 合约编译：
  - `hardhat.config.ts` 中配置：
    - `abiExporter.path = '../frontend/src/abi'`
    - `runOnCompile: true`，保证每次编译后 ABI 更新到前端

- 合约部署信息：
  - `contracts/scripts/deploy.ts` 部署 `Counter` 后：
    - 在 `frontend/src/lib/contracts.ts` 写入：
      - `Counter` 合约地址 `address`
      - 对应 `chainId`（本地 Hardhat 默认为 31337）
    - 并导出 `contracts` 常量与 `ContractName` 类型
  - 前端与链交互时，应通过 `@/lib/contracts` 读取合约地址与网络信息，避免在组件中硬编码地址

- 开发脚本 `scripts/dev-start.sh` 负责：
  - 根据 `artifacts/contracts/Counter.sol/Counter.json` 计算哈希，保存在 `.dev/counter.artifact.sha256`
  - 如果 ABI/字节码变化或链上不存在已保存地址，即重新执行 `deploy.ts`
  - 利用 `curl` 调用 `eth_getCode` 检查当前链上是否已有部署的合约代码

## 对未来 Warp 实例的建议

- 如需改动或新增合约：
  - 在 `contracts/contracts/` 中添加/修改 `.sol` 文件
  - 运行 `npm run build` 或 `npm run dev:start`，确保 ABI 与前端同步
  - 更新/扩展 `deploy.ts`，将新合约地址写入 `frontend/src/lib/contracts.ts`

- 如需扩展前端页面：
  - 在 `frontend/src/app` 下增加对应路由目录（如 `/blog` -> `src/app/blog/page.tsx`）
  - 将导航配置增加到 `Header` 中，并在 i18n locales 中补充 `t.nav.blog` 等文案

- 如需在前端新增使用合约的组件：
  - 优先通过 `@/lib/contracts` 获取地址，通过 `@/abi/...` 获取 ABI
  - 遵循现有 UI 风格与 Tailwind 原子类组合，尽量复用 `ui` 组件
