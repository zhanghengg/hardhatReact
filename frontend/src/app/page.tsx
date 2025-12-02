'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { ArrowRight, ArrowDown, Code2, FileCode, Blocks, Wrench, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParticleCanvas } from '@/components/ParticleCanvas';
import { projects, skills } from '@/data/projects';
import { useI18n } from '@/i18n';
import { useRef, useEffect, useState } from 'react';

// 滚动进度指示器
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 origin-left z-50"
      style={{ scaleX }}
    />
  );
}

// 滚动指示箭头
function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
    >
      <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ArrowDown className="h-5 w-5 text-purple-500" />
      </motion.div>
    </motion.div>
  );
}

// 视差文字效果
function ParallaxText({ children, baseVelocity = 5 }: { children: string; baseVelocity?: number }) {
  const baseX = useRef(0);
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      baseX.current += baseVelocity * 0.05;
      if (baseX.current > 100) baseX.current = 0;
      if (baseX.current < 0) baseX.current = 100;
      setPosition(baseX.current);
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [baseVelocity]);
  
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="flex gap-8 text-6xl md:text-8xl font-bold text-muted-foreground/10"
        style={{ x: `${-position}%` }}
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className="flex-shrink-0">{children}</span>
        ))}
      </motion.div>
    </div>
  );
}

// 数字计数动画
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (isInView) {
      const end = value;
      const duration = 2000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }
  }, [isInView, value]);
  
  return <span ref={ref}>{count}{suffix}</span>;
}

// 技能卡片3D效果
function SkillCard3D({ category, index }: { category: { key: string; label: string; icon: React.ComponentType<{ className?: string }>; skills: string[] }; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 10);
    setRotateY((centerX - x) / 10);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };
  
  const Icon = category.icon;
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
      className="p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center gap-3 mb-4" style={{ transform: 'translateZ(30px)' }}>
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-colors">
          <Icon className="h-6 w-6 text-purple-500" />
        </div>
        <h3 className="font-semibold text-lg">{category.label}</h3>
      </div>
      <div className="flex flex-wrap gap-2" style={{ transform: 'translateZ(20px)' }}>
        {category.skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs hover:bg-purple-500/20 transition-colors">
            {skill}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

// 项目卡片水平滚动
function HorizontalProjectScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const { t } = useI18n();
  
  return (
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8 px-8">
          {/* 标题卡片 */}
          <div className="flex-shrink-0 w-[400px] h-[500px] flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                {t.home.featuredProjects}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              {t.home.featuredProjectsDesc}
            </p>
            <Button asChild className="w-fit">
              <Link href="/projects">
                {t.home.viewAllProjects} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {/* 项目卡片 */}
          {projects.map((project) => (
            <motion.div
              key={project.slug}
              className="flex-shrink-0 w-[400px] h-[500px] rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden group cursor-pointer"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="h-48 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),transparent)]" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 flex-wrap">
                    {project.tags.map((tag) => (
                      <Badge key={tag} className="bg-background/80 backdrop-blur-sm text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-500 transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>
                <div className="flex items-center text-purple-500 text-sm font-medium">
                  <span>{t.home.learnMore}</span>
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* CTA卡片 */}
          <div className="flex-shrink-0 w-[400px] h-[500px] rounded-2xl border border-dashed border-purple-500/50 flex flex-col items-center justify-center p-8 text-center">
            <Sparkles className="h-12 w-12 text-purple-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">{t.home.ctaTitle}</h3>
            <p className="text-muted-foreground mb-6">{t.home.ctaDesc}</p>
            <Button variant="outline" asChild>
              <Link href="/about#contact">{t.home.contactMe}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useI18n();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  
  const skillCategories = [
    { key: 'frontend', label: t.skills.frontend, icon: Code2, skills: skills.frontend },
    { key: 'smart_contract', label: t.skills.smartContract, icon: FileCode, skills: skills.smart_contract },
    { key: 'blockchain', label: t.skills.blockchain, icon: Blocks, skills: skills.blockchain },
    { key: 'tools', label: t.skills.tools, icon: Wrench, skills: skills.tools },
  ];

  return (
    <div className="relative">
      <ScrollProgress />
      
      {/* Hero Section - 全屏视差 */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParticleCanvas className="z-0" />
        
        {/* 多层渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 text-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-purple-500">{t.home.badge}</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              {t.home.heroTitle1}
            </span>
            <br />
            <span className="text-foreground">{t.home.heroTitle2}</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t.home.heroDesc1}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="group" asChild>
              <Link href="/projects">
                {t.home.viewProjects}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">{t.home.learnMore}</Link>
            </Button>
          </motion.div>
        </motion.div>
        
        <ScrollIndicator />
      </section>
      
      {/* 滚动文字背景 */}
      <section className="py-20 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <ParallaxText baseVelocity={-3}>WEB3 • DEFI • SMART CONTRACTS • DAPPS •</ParallaxText>
      </section>
      
      {/* 统计数字 Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.1),transparent)]" />
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 7, suffix: '+', label: t.stats.yearsExp },
              { value: 50, suffix: '+', label: t.stats.projects },
              { value: 100, suffix: '%', label: t.stats.satisfaction },
              { value: 24, suffix: '/7', label: t.stats.support },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 技能 Section - 3D卡片 */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                {t.skills.title}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.skills.subtitle}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map((category, index) => (
              <SkillCard3D key={category.key} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>
      
      {/* 项目水平滚动 */}
      <HorizontalProjectScroll />
      
      {/* Footer CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 text-center relative"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {t.home.ctaTitle}
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t.home.ctaDesc}
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/about#contact">
              {t.home.contactMe}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
