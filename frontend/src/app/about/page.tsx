import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  title: '关于我 | 0xMRO',
  description: 'Web3 前端工程师 / 智能合约开发者，8+ 年开发经验，专注于 DeFi 和 DApp 构建',
  keywords: ['Web3', '前端工程师', '智能合约', 'Solidity', 'React'],
};

export default function AboutPage() {
  return <AboutContent />;
}
