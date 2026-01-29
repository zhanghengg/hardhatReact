'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Github, TrendingUp, Layers, FileCode, Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TradingViewChart, SymbolSearch, IntervalSelector } from '@/components/trading'

const project = {
  title: 'TradingView K 线图',
  description: '基于 TradingView Charting Library 和币安实时数据的专业 K 线图表',
  tags: ['TradingView', 'Binance API', 'WebSocket', 'TypeScript'],
  features: [
    '币安实时 K 线数据',
    'WebSocket 实时推送更新',
    '多周期切换 (1m ~ 1W)',
    '交易对搜索与切换',
    '技术指标支持',
    '深色主题适配',
  ],
  techStack: ['TradingView Charting Library', 'Binance REST API', 'Binance WebSocket', 'Next.js', 'TypeScript'],
  longDescription: `这是一个专业级的 K 线图表实现，展示了如何将 TradingView Charting Library 与币安实时数据源集成。

核心模块包括：
- BinanceDatafeed: 自定义 Datafeed 适配器，直接调用币安 API
- BinanceStreaming: WebSocket 实时数据流管理
- TradingViewChart: 图表组件封装

数据流：
- 历史数据通过 REST API 获取
- 实时更新通过 WebSocket 推送`,
}

export default function TradingViewPage() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState('60')

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* 控制栏 */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <SymbolSearch value={symbol} onChange={setSymbol} />
          <IntervalSelector value={interval} onChange={setInterval} />
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-green-500" />
            <span>实时数据</span>
          </div>
        </div>

        {/* VPN 访问提示 */}
        <div className="mb-4 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-500">网络访问提示</p>
              <p className="text-muted-foreground mt-1">
                币安 K 线数据需要通过 VPN 访问。如未开启 VPN，可能无法正常请求数据，图表将无法正常展示。
              </p>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 图表区域 - 占 3 列 */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
              <div className="h-[600px]">
                <TradingViewChart
                  symbol={symbol}
                  interval={interval}
                  theme="Dark"
                  onSymbolChange={setSymbol}
                  onIntervalChange={setInterval}
                />
              </div>
            </div>
          </div>

          {/* 侧边栏 - 占 1 列 */}
          <div className="space-y-6">
            {/* 当前交易对信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  当前交易对
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">符号</span>
                    <span className="font-mono">{symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">周期</span>
                    <span className="font-mono">{interval === '1D' ? '1 天' : interval === '1W' ? '1 周' : `${interval} 分钟`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">数据源</span>
                    <span>Binance</span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      <span className="text-muted-foreground text-sm">{feature}</span>
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
                    <Badge key={tech} variant="outline" className="text-xs">
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
