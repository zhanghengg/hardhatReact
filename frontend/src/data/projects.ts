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
    slug: 'simple-dex',
    title: 'Simple DEX',
    description:
      '一个基于 Uniswap V2 机制的简化版去中心化交易所，支持代币交换和流动性提供',
    longDescription: `这是一个教学目的的 DEX 实现，展示了 AMM（自动做市商）的核心原理。
    
用户可以：
- 在两种 ERC20 代币之间进行交换
- 提供流动性并获得 LP 代币
- 移除流动性并赎回代币

合约实现了恒定乘积公式 (x * y = k) 来确定交换价格。`,
    tags: ['DeFi', 'AMM', 'Solidity'],
    image: '/projects/dex.png',
    demoUrl: '#',
    githubUrl: '#',
    contractAddress: '0x...',
    network: 'Sepolia',
    features: [
      '代币交换功能',
      '添加/移除流动性',
      'LP 代币机制',
      '滑点保护',
      '价格影响显示'
    ],
    techStack: ['Solidity', 'Hardhat', 'React', 'ethers.js', 'TailwindCSS'],
    status: 'planned'
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
    image: '/projects/nft.png',
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
    image: '/projects/multisig.png',
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
  tools: ['Git', 'VS Code', 'Remix', 'Tenderly']
}
