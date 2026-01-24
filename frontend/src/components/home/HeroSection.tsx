'use client';

import Link from 'next/link';
import { motion, MotionValue } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FluidCanvas } from '@/components/FluidCanvas';
import { useI18n } from '@/i18n';
import { RefObject } from 'react';
import ShinyText from '@/components/ShinyText';
import { ScrollIndicator } from './ScrollIndicator';

interface HeroSectionProps {
  heroRef: RefObject<HTMLDivElement | null>;
  heroOpacity: MotionValue<number>;
  heroScale: MotionValue<number>;
  heroY: MotionValue<number>;
}

export function HeroSection({ heroRef, heroOpacity, heroScale, heroY }: HeroSectionProps) {
  const { t } = useI18n();

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      <FluidCanvas className="z-0" />
      
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
          className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-14 tracking-tight font-[family-name:var(--font-exo2)]"
        >
          <span className="bg-gradient-to-r from-blue-300 via-slate-100 to-blue-400 bg-clip-text text-transparent">
            {t.home.heroTitle1}
          </span>
          <br />
          <span className="text-foreground">{t.home.heroTitle2}</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
        >
          <ShinyText
            text={t.home.heroDesc1}
            speed={2}
            delay={0}
            color="#b5b5b5"
            shineColor="#ffffff"
            spread={120}
            direction="left"
            yoyo={false}
            pauseOnHover={false}
            disabled={false}
          />
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
  );
}
