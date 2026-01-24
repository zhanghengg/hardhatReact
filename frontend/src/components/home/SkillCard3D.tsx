'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export interface SkillCategory {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  skills: string[];
}

interface SkillCard3DProps {
  category: SkillCategory;
  index: number;
}

export function SkillCard3D({ category, index }: SkillCard3DProps) {
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
