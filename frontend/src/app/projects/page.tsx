import type { Metadata } from 'next';
import { ProjectsContent } from './ProjectsContent';

export const metadata: Metadata = {
  title: '项目作品集 | 0xMRO',
  description: '0xMRO 的 Web3 项目作品集，包含 DeFi、智能合约、TradingView 等项目',
  keywords: ['Web3', 'DeFi', 'Solidity', 'Projects', '作品集'],
};

export default function ProjectsPage() {
  return <ProjectsContent />;
}
