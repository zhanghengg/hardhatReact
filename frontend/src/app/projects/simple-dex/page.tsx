'use client'

import Link from 'next/link'
import { ArrowLeft, Github, FileCode, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UniswapDemo } from '@/components/dex/UniswapDemo'
import { ContractAddresses, PoolInfoSection } from '@/components/dex/components'

const project = {
  title: 'Simple DEX',
  description: '一个基于 Uniswap V2 机制的简化版去中心化交易所',
  tags: ['DeFi', 'AMM', 'Solidity', 'Uniswap V2'],
  features: [
    '代币交换功能 (恒定乘积公式)',
    '添加/移除流动性',
    'LP 代币机制',
    'TWAP 价格预言机',
    '0.3% 交易手续费'
  ],
  techStack: ['Solidity', 'Hardhat', 'Next.js', 'viem', 'TailwindCSS'],
  longDescription: `这是一个教学目的的 DEX 实现，展示了 AMM（自动做市商）的核心原理。

核心合约包括：
- UniswapV2Factory: 创建和管理交易对
- UniswapV2Pair: 实现 AMM 核心逻辑  
- UniswapV2Router: 用户交互入口
- UniswapV2Library: 价格计算辅助库

合约实现了恒定乘积公式 (x * y = k) 来确定交换价格。`
}

export default function SimpleDexPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回作品集
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold">{project.title}</h1>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              已完成
            </Badge>
          </div>

          <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                查看代码
              </a>
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        {/* 主要内容区域 - 两栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧: 演示区域 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">🎮 在线演示</h2>
            <div className="rounded-xl border border-border/50 bg-card/30 p-4">
              <UniswapDemo />
            </div>
          </div>

          {/* 右侧: 项目信息 */}
          <div className="space-y-6">
            {/* 合约地址 */}
            <ContractAddresses />

            {/* 池子信息 */}
            <PoolInfoSection />

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="h-5 w-5 text-purple-500" />
                  功能特性
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileCode className="h-5 w-5 text-cyan-500" />
                  技术栈
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map(tech => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Long Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">项目详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  {project.longDescription.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground mb-2 last:mb-0 text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
