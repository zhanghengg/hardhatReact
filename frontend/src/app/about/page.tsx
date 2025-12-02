'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, Mail, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
  const experiences = [
    {
      period: '2023 - 现在',
      title: 'Web3 前端开发',
      company: '独立开发者',
      description: '专注于 DeFi 协议和 DApp 开发，使用 React、Next.js 和 Solidity',
    },
    // 可以添加更多经历
  ];

  const socialLinks = [
    { icon: Github, label: 'GitHub', href: 'https://github.com', username: '@yourname' },
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com', username: '@yourname' },
    { icon: Mail, label: 'Email', href: 'mailto:your@email.com', username: 'your@email.com' },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Avatar */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <span className="text-4xl font-bold text-purple-500">W3</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2">Web3 开发者</h1>
          <p className="text-lg text-muted-foreground mb-4">
            前端工程师 / 智能合约开发者
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              中国
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              7+ 年经验
            </span>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-12"
        >
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">关于我</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  我是一名热爱 Web3 技术的前端工程师，专注于构建去中心化应用（DApps）和智能合约开发。
                </p>
                <p>
                  我相信区块链技术将重塑互联网，让用户真正拥有自己的数据和资产。
                  我致力于通过优秀的用户体验，降低 Web3 的使用门槛，让更多人能够参与到去中心化世界中来。
                </p>
                <p>
                  目前我主要关注 DeFi 协议开发、NFT 应用以及智能合约安全领域。
                  我喜欢学习新技术，也乐于分享我的知识和经验。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold mb-4">专业技能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3 text-purple-500">前端开发</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'ethers.js', 'wagmi', 'viem'].map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3 text-cyan-500">智能合约</h3>
                <div className="flex flex-wrap gap-2">
                  {['Solidity', 'Hardhat', 'Foundry', 'OpenZeppelin', 'ERC20', 'ERC721'].map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold mb-4">工作经历</h2>
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="font-medium">{exp.title}</h3>
                    <Badge variant="outline">{exp.period}</Badge>
                  </div>
                  <p className="text-sm text-purple-500 mb-2">{exp.company}</p>
                  <p className="text-muted-foreground text-sm">{exp.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Contact Section */}
        <motion.div
          id="contact"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-center">联系我</h2>
          <p className="text-center text-muted-foreground mb-8">
            如果你有任何问题或合作意向，欢迎通过以下方式联系我
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="hover:border-purple-500/50 transition-colors">
                  <CardContent className="pt-6 text-center">
                    <link.icon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-medium mb-1">{link.label}</h3>
                    <p className="text-sm text-muted-foreground">{link.username}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <a href="mailto:your@email.com">
                <Mail className="mr-2 h-4 w-4" />
                发送邮件
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
