export interface Project {
  slug: string
  title: string
  description: string
  longDescription: string
  tags: string[]
  image: string
  demoUrl?: string
  githubUrl?: string
  contractAddress?: string
  network?: string
  features: string[]
  techStack: string[]
  status: 'completed' | 'in-progress' | 'planned'
}

export const projects: Project[] = [
  {
    slug: 'a402-launchpad',
    title: 'A402 - Meme Launchpad',
    description:
      '基于 x402 协议构建的 Meme 代币发射平台，支持 1 USDC 低门槛参与、无 Gas 铸造和迁移前退款',
    longDescription: `A402 是一个基于 x402 协议的 Meme 代币发射平台，部署在 Base 链上。本人负责项目的前端开发和智能合约开发。

【智能合约开发】

合约架构设计（分层架构）：
- Manager 层：X402LaunchPadManager 作为用户交互入口，管理代币创建、批量购买和迁移触发
- Controller 层：X402TokenController 封装核心交易逻辑，采用 BeaconProxy 模式实现可升级
- Token 层：X402Token 继承 ERC20 和 EIP-3009，支持授权转账和迁移后手续费机制

核心技术实现：
- EIP-3009 授权转账：实现 transferWithAuthorization 和 receiveWithAuthorization，用户签名后由 Operator 代付 Gas 完成转账
- Bonding Curve 机制：预售阶段采用固定汇率 (exchangeRate)，当募集金额达到 migrateThreshold 时触发 DEX 迁移
- Uniswap V2 集成：调用 Router.addLiquidity() 添加流动性，并将 LP Token 发送至死地址实现永久锁定
- 可升级合约：使用 OpenZeppelin Upgradeable + BeaconProxy 模式，支持 Controller 逻辑热升级
- 权限控制：基于 AccessControlEnumerable 实现 OPERATOR_ROLE、CLAIM_ROLE 等角色管理
- 安全机制：ReentrancyGuard 防重入、Pausable 紧急暂停、迁移前限制合约调用

【前端开发】

技术架构：
- Next.js 15 (App Router) + React 19 + TypeScript 构建，支持 SSR 和 Turbopack 开发
- wagmi + viem 实现链上交互，封装 useTokenBalance、useTokenApproval 等自定义 Hooks
- Zustand 全局状态管理，Immer 实现不可变数据更新
- Privy 集成实现 Web3 登录（支持社交账号 + 钱包多种方式）

核心功能实现：
- x402-fetch 支付流程：集成 x402 协议实现 Gasless 铸造，前端处理签名授权和支付验证
- 代币创建表单：React Hook Form + Zod 验证，Pinata 上传图片至 IPFS
- 交易面板：实时余额查询、滑点设置、授权检查、交易状态轮询
- 响应式适配：TailwindCSS + postcss-pxtorem 实现移动端适配
- 国际化：i18next 实现中英文切换，支持浏览器语言自动检测`,
    tags: ['Solidity', 'DeFi', 'Next.js', 'Base', 'Full-Stack'],
    image: '/projects/a402.png',
    demoUrl: 'https://a402.space/',
    features: [
      'EIP-3009 Gasless 授权转账',
      'Bonding Curve + DEX 自动迁移',
      'BeaconProxy 可升级合约',
      'LP Token 永久锁定',
      'AccessControl 权限管理',
      'wagmi/viem 链上交互封装',
      'Privy Web3 身份认证',
      'x402 协议支付集成',
      'React Hook Form + Zod 表单',
      'i18next 国际化'
    ],
    techStack: [
      'Solidity',
      'Hardhat 3',
      'OpenZeppelin Upgradeable',
      'EIP-3009',
      'Uniswap V2',
      'Next.js 15',
      'React 19',
      'TypeScript',
      'Privy',
      'wagmi',
      'viem',
      'x402-fetch',
      'Zustand',
      'TailwindCSS',
      'i18next'
    ],
    network: 'Base',
    status: 'completed'
  },
  {
    slug: 'hidex',
    title: 'Hidex - AI Crypto Trading Signals',
    description:
      '专业的 AI 驱动加密货币交易信号平台，提供智能跟单、新币发现、Alpha 报告等功能，支持 Solana/EVM 多链',
    longDescription: `Hidex 是一个功能完善的 AI 加密货币交易信号平台，本人负责项目的前端开发工作。

【技术架构】

- React 18 + Vite + TypeScript 构建，采用模块化目录结构（view/components/hooks/store/api）
- Redux Toolkit + Zustand 混合状态管理，createSlice 管理全局状态，Zustand 处理轻量级局部状态
- 封装 Axios 请求层，统一拦截器处理 Token 刷新、错误码映射和请求重试
- Sentry 集成实现错误监控和性能追踪

【多链钱包集成】

- Privy 实现 Web3 身份认证，支持社交账号（Google/Twitter/Email）和钱包（MetaMask/Phantom）多种登录方式
- 封装 usePrivyWalletsBalance Hook，聚合查询用户在 Solana 和 EVM 链上的资产余额
- Solana Web3.js 处理 SPL Token 交互，Ethers.js 处理 ERC20 交互，抽象统一的资产管理接口
- 助记词派生多链地址，使用 ed25519-hd-key 和 bip39 实现 HD 钱包

【核心功能实现】

- TradingView 图表集成：封装 Datafeed 和 Streaming 模块，实现实时 K 线数据推送和自定义指标
- 信号列表：react-virtualized 虚拟滚动优化长列表渲染，useInfiniteScroll 自定义 Hook 实现无限加载
- 信号推送：封装 useSignalPushNotification Hook，结合 Web Notification API 实现浏览器通知
- 交易面板：实时价格轮询、滑点计算、Gas 估算，支持快捷交易和高级设置

【UI/UX 优化】

- Ant Design + React Vant 组件库，PC/Mobile 双端适配
- TailwindCSS + Less 混合样式方案，支持深色/浅色主题切换
- i18next 国际化，支持中英文切换和浏览器语言自动检测
- Lottie 动画提升交互体验，html-to-image 实现分享图片生成`,
    tags: ['React', 'Web3', 'Trading', 'Solana', 'Multi-Chain'],
    image: '/projects/hidex.png',
    demoUrl: 'https://hidex.ai/',
    features: [
      'Privy 多方式 Web3 登录',
      'Solana + EVM 多链资产管理',
      'TradingView K线图深度集成',
      'react-virtualized 虚拟滚动',
      'Redux Toolkit + Zustand 状态管理',
      'Web Notification 信号推送',
      '深色/浅色主题切换',
      'i18next 国际化',
      'Sentry 错误监控'
    ],
    techStack: [
      'React 18',
      'TypeScript',
      'Vite',
      'Redux Toolkit',
      'Zustand',
      'Privy',
      'Solana Web3.js',
      'Ethers.js',
      'TradingView',
      'react-virtualized',
      'Ant Design',
      'React Vant',
      'TailwindCSS',
      'Less',
      'i18next',
      'Sentry'
    ],
    status: 'completed'
  },
  {
    slug: 'hidex-tg-bot',
    title: 'Hidex Telegram Bot',
    description:
      '多链加密货币代币信息查询机器人，支持 Solana/EVM 链代币实时数据查询、安全检测和智能资金信号推送',
    longDescription: `Hidex Telegram Bot 是一个专业的加密货币代币信息查询机器人，支持多链实时数据查询和智能信号推送。本人负责整个项目的后端开发。

【项目架构】

采用 Node.js + Express + Telegraf 构建，模块化分层设计：
- 入口层 (app.js)：Express 服务器 + Bot 初始化 + 定时任务调度
- Bot 层 (bot.js)：Telegraf 消息处理、命令路由、Inline Keyboard 交互
- Controller 层：消息模板渲染、HTML 构建、命令处理器
- Data 层：链上数据聚合（Codex SDK、RugCheck API、DexScreener）
- Utils 层：多链工具函数、配置管理、HTTP 封装

【多链数据聚合】

- 智能地址识别：通过地址长度自动判断链类型（Solana 44字符 / EVM 42字符 0x前缀）
- Codex GraphQL SDK 集成：封装 CodexSdk 类，实现 filterTokens、getTokenPrices、getHolders 等查询
- 多源数据聚合：Promise.all 并发查询 RugCheck（安全检测）+ Codex（价格/市值）+ Pumpfun（Solana Meme 状态）
- EVM 多链并行查询：ETH/BSC/Base 等链同时查询同一地址，聚合返回有效结果

【代币安全检测】

Solana 链检测项：
- Mint Authority（铸造权限弃权检测）
- Freeze Authority（黑名单/冻结权限检测）
- LP Burned Percentage（流动性燃烧比例）
- Top 10 Holders（前10持仓集中度分析，排除已知账户）

EVM 链检测项：
- Honeypot Detection（蜜罐检测）
- Open Source Verification（合约开源验证）
- LP Locked（流动性锁定检测）
- Owner Renounced（所有权弃权检测）

【定时任务系统】

基于 node-schedule 实现多任务调度：
- 母币价格缓存 (*/15s)：定时更新 SOL/ETH/BNB 价格，用于流动性 USD 换算
- 公告推送 (*/5s)：轮询消息队列，向订阅用户推送运营公告
- 智能资金信号 (*/2s)：监控 Smart Money 交易信号，实时推送 FOMO 买入提醒
- 日志清理 (每天0点)：定期清理历史日志，防止磁盘溢出
- 用户缓存刷新 (每天0点)：更新 Telegram 用户 ID 缓存

【缓存优化】

- node-cache 内存缓存：RugCheck 结果缓存避免重复 API 调用
- 母币价格缓存：减少高频价格查询压力
- 用户语言偏好缓存：基于 chatId 存储用户语言设置

【消息渲染引擎】

- Markdown 模板引擎：动态生成格式化代币信息卡片
- 特殊字符转义：sanitizeMarkdownString 处理 Telegram Markdown 语法冲突
- 数字格式化：formatNumberZeroToSubscript 处理极小数下标显示（如 $0.₆123）
- 多语言支持：基于 chatId 的 i18n 方案，支持中英文切换

【Telegram 交互】

- Inline Keyboard：刷新按钮、交易链接、图表链接等动态按钮
- Callback Query：处理 refresh 等回调事件，实现消息原地更新
- Reply 模式：引用原消息回复，保持上下文关联
- 代理支持：SOCKS5 代理配置，解决网络访问限制`,
    tags: ['Node.js', 'Telegram Bot', 'Web3', 'Solana', 'Multi-Chain'],
    image: '/projects/telegramBot.png',
    demoUrl: 'https://t.me/Hidex_Global_Bot',
    features: [
      'Solana + EVM 多链代币查询',
      '智能地址链类型识别',
      'Codex GraphQL SDK 集成',
      '代币安全性多维检测',
      'node-schedule 定时任务',
      'Smart Money 信号推送',
      'node-cache 内存缓存',
      'Markdown 消息模板引擎',
      'Inline Keyboard 交互',
      'SOCKS5 代理支持'
    ],
    techStack: [
      'Node.js',
      'Express',
      'Telegraf',
      'Codex SDK',
      'Solana Web3.js',
      'node-schedule',
      'node-cache',
      'Axios',
      'SOCKS5 Proxy',
      'PM2'
    ],
    status: 'completed'
  },
  {
    slug: 'simple-dex',
    title: 'Simple DEX',
    description:
      '一个基于 Uniswap V2 机制的简化版去中心化交易所，支持代币交换和流动性提供',
    longDescription: `这是一个教学目的的 DEX 实现，展示了 AMM（自动做市商）的核心原理。
    
用户可以：
- 在两种 ERC20 代币之间进行交换
- 提供流动性并获得 LP 代币
- 移除流动性并赎回代币

合约实现了恒定乘积公式 (x * y = k) 来确定交换价格。

核心合约包括：
- UniswapV2Factory: 创建和管理交易对
- UniswapV2Pair: 实现 AMM 核心逻辑
- UniswapV2Router: 用户交互入口
- UniswapV2Library: 价格计算辅助库`,
    tags: ['DeFi', 'AMM', 'Solidity', 'Uniswap V2'],
    image: '/projects/simple-dex.png',
    demoUrl: '/projects/simple-dex',
    githubUrl: '#',
    contractAddress: '已部署至 Sepolia 测试网',
    network: 'Sepolia',
    features: [
      '代币交换功能 (恒定乘积公式)',
      '添加/移除流动性',
      'LP 代币机制',
      'TWAP 价格预言机',
      '0.3% 交易手续费'
    ],
    techStack: ['Solidity', 'Hardhat', 'Next.js', 'viem', 'TailwindCSS'],
    status: 'completed'
  },
  {
    slug: 'tradingview',
    title: 'TradingView K 线图',
    description:
      '基于 TradingView Charting Library 和币安实时数据的专业 K 线图表',
    longDescription: `这是一个专业级的 K 线图表实现，展示了如何将 TradingView Charting Library 与币安实时数据源集成。

核心模块包括：
- BinanceDatafeed: 自定义 Datafeed 适配器，直接调用币安 API
- BinanceStreaming: WebSocket 实时数据流管理
- TradingViewChart: 图表组件封装

数据流：
- 历史数据通过币安 REST API 获取
- 实时更新通过 WebSocket 推送

技术亮点：
- 完整实现 TradingView Datafeed API 接口
- 支持多周期切换（1m ~ 1W）
- 支持交易对搜索和切换
- WebSocket 自动重连机制`,
    tags: ['TradingView', 'Binance API', 'WebSocket', 'TypeScript'],
    image: '/projects/tradingview.png',
    demoUrl: '/projects/tradingview',
    githubUrl: '#',
    features: [
      '币安实时 K 线数据',
      'WebSocket 实时推送更新',
      '多周期切换 (1m ~ 1W)',
      '交易对搜索与切换',
      '技术指标支持',
      '深色主题适配'
    ],
    techStack: ['TradingView Charting Library', 'Binance REST API', 'Binance WebSocket', 'Next.js', 'TypeScript', 'React'],
    status: 'completed'
  },
  {
    slug: 'nft-marketplace',
    title: 'NFT Marketplace',
    description: '一个简洁的 NFT 交易市场，支持铸造、上架和购买 NFT',
    longDescription: `一个功能完整的 NFT 市场，允许用户创建、展示和交易数字艺术品。

核心功能：
- 铸造自定义 NFT
- 设置价格并上架销售
- 浏览和购买 NFT
- 查看个人收藏`,
    tags: ['NFT', 'ERC721', 'Marketplace'],
    image: '',
    features: ['NFT 铸造', '上架销售', '购买功能', '个人收藏展示'],
    techStack: ['Solidity', 'Foundry', 'Next.js', 'wagmi', 'IPFS'],
    status: 'planned'
  },
  {
    slug: 'multi-sig-wallet',
    title: 'Multi-Sig Wallet',
    description: '多重签名钱包，需要多个所有者批准才能执行交易',
    longDescription: `一个安全的多重签名钱包实现，适用于团队资金管理和 DAO 财库。

主要特点：
- 可配置的签名阈值
- 交易提案和投票
- 紧急暂停功能`,
    tags: ['Security', 'Wallet', 'DAO'],
    image: '',
    features: ['多签名确认', '交易提案', '所有者管理', '执行延迟'],
    techStack: ['Solidity', 'Hardhat', 'React', 'viem'],
    status: 'planned'
  }
]

export const skills = {
  frontend: [
    'React',
    'Next.js',
    'TypeScript',
    'TailwindCSS',
    'ethers.js',
    'wagmi',
    'viem'
  ],
  smart_contract: ['Solidity', 'Hardhat', 'Foundry', 'OpenZeppelin'],
  blockchain: ['Ethereum', 'EVM Chains', 'IPFS', 'The Graph'],
  tools: ['Git', 'VS Code', 'Remix','jenkins']
}
