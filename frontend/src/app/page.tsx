'use client';

import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  ScrollProgress,
  ParallaxText,
  HeroSection,
  StatsSection,
  SkillsSection,
  ProjectsSection,
  FooterCTA,
} from '@/components/home';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <div className="relative">
      <ScrollProgress />
      
      {/* Hero Section - 全屏视差 */}
      <HeroSection
        heroRef={heroRef}
        heroOpacity={heroOpacity}
        heroScale={heroScale}
        heroY={heroY}
      />
      
      {/* 滚动文字背景 */}
      <section className="py-20 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <ParallaxText baseVelocity={-3}>WEB3 • DEFI • SMART CONTRACTS • DAPPS •</ParallaxText>
      </section>
      
      {/* 统计数字 Section */}
      <StatsSection />
      
      {/* 技能 Section - 3D卡片 */}
      <SkillsSection />
      
      {/* 项目水平滚动 */}
      <ProjectsSection />
      
      {/* Footer CTA */}
      <FooterCTA />
    </div>
  );
}
