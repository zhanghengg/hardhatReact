'use client';

import { motion } from 'framer-motion';
import { Code2, FileCode, Blocks, Wrench } from 'lucide-react';
import { useI18n } from '@/i18n';
import { skills } from '@/data/projects';
import { SkillCard3D } from './SkillCard3D';

export function SkillsSection() {
  const { t } = useI18n();

  const skillCategories = [
    { key: 'frontend', label: t.skills.frontend, icon: Code2, skills: skills.frontend },
    { key: 'smart_contract', label: t.skills.smartContract, icon: FileCode, skills: skills.smart_contract },
    { key: 'blockchain', label: t.skills.blockchain, icon: Blocks, skills: skills.blockchain },
    { key: 'tools', label: t.skills.tools, icon: Wrench, skills: skills.tools },
  ];

  return (
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
  );
}
