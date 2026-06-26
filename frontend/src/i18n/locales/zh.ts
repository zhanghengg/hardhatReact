export const zh = {
  // 导航
  nav: {
    home: '首页',
    projects: '作品集',
    about: '关于我'
  },

  // 首页
  home: {
    badge: 'Web3 开发者',
    heroTitle1: '构建去中心化',
    heroTitle2: '未来',
    heroDesc1: '专注于 DeFi、智能合约开发和现代化 DApp 构建。',
    heroDesc2: '用代码连接区块链与用户体验。',
    viewProjects: '查看作品集',
    learnMore: '了解更多',
    featuredProjects: '精选项目',
    featuredProjectsDesc: '探索我的 Web3 项目，从 DeFi 协议到 NFT 市场',
    viewAllProjects: '查看全部项目',
    ctaTitle: '期待新机会',
    ctaDesc:
      '正在寻找 Web3 领域的工作机会，如果您的团队需要有经验的前端/智能合约开发者，欢迎联系我',
    contactMe: '联系我'
  },

  // 技能部分
  skills: {
    title: '技术栈',
    subtitle: '专注于 Web3 全栈开发，从智能合约到前端 DApp',
    frontend: '前端开发',
    smartContract: '智能合约',
    blockchain: '区块链',
    tools: '开发工具'
  },

  // 统计数字
  stats: {
    yearsExp: '年开发经验',
    projects: '项目作品',
    techStack: '技术栈',
    web3Exp: '年Web3行业经验'
  },

  // Footer
  footer: {
    desc: 'Web3 前端工程师，专注于 DeFi 和智能合约开发',
    quickLinks: '快速链接',
    contact: '联系方式',
    copyright: '© {year} web3.0xMRO. Built with Next.js & ❤️'
  },

  // 项目页面
  projects: {
    title: '项目作品集',
    subtitle: '探索我在 Web3 领域的项目，从 DeFi 协议到 NFT 平台',
    filterAll: '全部',
    liveDemo: '在线演示',
    viewCode: '查看代码'
  },

  // 关于页面
  about: {
    title: '关于我',
    subtitle: '一个热爱 Web3 技术的开发者',
    contactTitle: '联系我',
    contactDesc: '如果你有任何问题或合作意向，欢迎通过以下方式联系我',
    pageTitle: '0xMRO',
    pageSubtitle: 'Web3 前端工程师 / 智能合约开发者',
    location: '中国',
    experience: '8+ 年经验',
    aboutMe: '关于我',
    bio1: '我是一名热爱 Web3 技术的前端工程师，专注于构建去中心化应用（DApps）和智能合约开发。',
    bio2: '我相信区块链技术将重塑互联网，让用户真正拥有自己的数据和资产。我致力于通过优秀的用户体验，降低 Web3 的使用门槛，让更多人能够参与到去中心化世界中来。',
    bio3: '目前我主要关注 DeFi、DApps、智能合约开发。我喜欢学习新技术，也乐于分享我的知识和经验。',
    skillsTitle: '专业技能',
    frontendDev: '前端开发',
    smartContractDev: '智能合约',
    workExperience: '工作经历',
    expPeriod: '2023 - 现在',
    expTitle: 'Web3 前端开发',
    expCompany: '独立开发者',
    expDesc: '专注于 DeFi 协议和 DApp 开发，使用 React、Next.js 和 Solidity',
    sendEmail: '发送邮件'
  },

  // 项目页面扩展
  projectsPage: {
    subtitle: '',
    noProjects: '暂无项目，敬请期待..'
  },

  // 项目详情页
  projectDetail: {
    backToProjects: '返回作品集',
    statusCompleted: '已完成',
    statusInProgress: '进行中',
    statusPlanned: '计划中',
    features: '功能特性',
    techStack: '技术栈',
    contractInfo: '合约信息',
    network: '网络',
    contractAddress: '合约地址',
    projectDetails: '项目详情',
    liveLink: '在线链接',
    viewCode: '查看代码',
    demoArea: '项目演示区域',
    onlineDemo: '🎮 在线演示',
    currentPair: '当前交易对',
    symbol: '符号',
    interval: '周期',
    dataSource: '数据源',
    realTimeData: '实时数据',
    vpnTitle: '网络访问提示',
    vpnDesc: '币安 K 线数据需要通过 VPN 访问。如未开启 VPN，可能无法正常请求数据，图表将无法正常展示。',
    viewDetails: '查看详情'
  },

  // AI 聊天机器人
  chatbot: {
    title: '0xMRO 的小秘书',
    subtitle: '随时为你解答 ~',
    welcome: '👋 嗨！我是开发者 0xMRO 的 AI 小秘书，关于 TA 的项目经验、技术能力、合作咨询...随便问我吧！',
    tryAsking: '不知道问什么？试试这些：',
    q1: '介绍一下开发者吧',
    q2: '开发过哪些项目？',
    q3: '我的联系方式？',
    placeholder: '想了解什么，尽管问我...',
    errorMessage: '哎呀，出了点小问题，稍后再试试吧~'
  }
}

export type Locale = {
  nav: { home: string; projects: string; about: string }
  home: {
    badge: string
    heroTitle1: string
    heroTitle2: string
    heroDesc1: string
    heroDesc2: string
    viewProjects: string
    learnMore: string
    featuredProjects: string
    featuredProjectsDesc: string
    viewAllProjects: string
    ctaTitle: string
    ctaDesc: string
    contactMe: string
  }
  skills: {
    title: string
    subtitle: string
    frontend: string
    smartContract: string
    blockchain: string
    tools: string
  }
  stats: {
    yearsExp: string
    projects: string
    techStack: string
    web3Exp: string
  }
  footer: {
    desc: string
    quickLinks: string
    contact: string
    copyright: string
  }
  projects: {
    title: string
    subtitle: string
    filterAll: string
    liveDemo: string
    viewCode: string
  }
  about: {
    title: string
    subtitle: string
    contactTitle: string
    contactDesc: string
    pageTitle: string
    pageSubtitle: string
    location: string
    experience: string
    aboutMe: string
    bio1: string
    bio2: string
    bio3: string
    skillsTitle: string
    frontendDev: string
    smartContractDev: string
    workExperience: string
    expPeriod: string
    expTitle: string
    expCompany: string
    expDesc: string
    sendEmail: string
  }
  projectsPage: { subtitle: string; noProjects: string }
  projectDetail: {
    backToProjects: string
    statusCompleted: string
    statusInProgress: string
    statusPlanned: string
    features: string
    techStack: string
    contractInfo: string
    network: string
    contractAddress: string
    projectDetails: string
    liveLink: string
    viewCode: string
    demoArea: string
    onlineDemo: string
    currentPair: string
    symbol: string
    interval: string
    dataSource: string
    realTimeData: string
    vpnTitle: string
    vpnDesc: string
    viewDetails: string
  }
  chatbot: {
    title: string
    subtitle: string
    welcome: string
    tryAsking: string
    q1: string
    q2: string
    q3: string
    placeholder: string
    errorMessage: string
  }
}
