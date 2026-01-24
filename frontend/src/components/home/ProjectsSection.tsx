'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { useRef } from 'react';
import { projects } from '@/data/projects';
import { ProjectCover } from './ProjectCover';

// 标题卡片
function TitleCard() {
  const { t } = useI18n();
  
  return (
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
  );
}

// 项目卡片
function ProjectCard({ project }: { project: typeof projects[0] }) {
  const { t } = useI18n();
  
  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="flex-shrink-0 w-[400px] h-[500px] rounded-2xl border border-border/50 bg-card overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-2.5">
        <div className="h-48 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 relative overflow-hidden">
          <ProjectCover project={project} />
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="flex gap-2 flex-wrap">
              {project.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  className="bg-black/80 text-white text-xs border-0 px-2.5 py-1 font-medium shadow-sm"
                >
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
      </div>
    </Link>
  );
}

// CTA卡片
function CTACard() {
  const { t } = useI18n();
  
  return (
    <div className="flex-shrink-0 w-[400px] h-[500px] rounded-2xl border border-dashed border-purple-500/50 flex flex-col items-center justify-center p-8 text-center">
      <Sparkles className="h-12 w-12 text-purple-500 mb-4" />
      <h3 className="text-2xl font-bold mb-2">{t.home.ctaTitle}</h3>
      <p className="text-muted-foreground mb-6">{t.home.ctaDesc}</p>
      <Button variant="outline" asChild>
        <Link href="/about#contact">{t.home.contactMe}</Link>
      </Button>
    </div>
  );
}

export function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // 计算需要滚动的总距离
  const totalCards = projects.length + 2;
  const cardWidth = 400;
  const gap = 32;
  const totalWidth = totalCards * cardWidth + (totalCards - 1) * gap;
  const scrollDistance = totalWidth - cardWidth;
  
  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);
  const x = useSpring(xRaw, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });
  
  return (
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div 
          style={{ x }} 
          className="flex gap-8 px-8 will-change-transform"
        >
          <TitleCard />
          
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
          
          <CTACard />
        </motion.div>
      </div>
    </section>
  );
}
