'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { skills } from '@/data/projects';
import { Code2, FileCode, Blocks, Wrench } from 'lucide-react';
import { useI18n } from '@/i18n';


export function SkillSection() {
  const { t } = useI18n();

  const skillCategories = [
    { key: 'frontend' as const, label: t.skills.frontend, icon: Code2 },
    { key: 'smart_contract' as const, label: t.skills.smartContract, icon: FileCode },
    { key: 'blockchain' as const, label: t.skills.blockchain, icon: Blocks },
    { key: 'tools' as const, label: t.skills.tools, icon: Wrench },
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">{t.skills.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.skills.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-6 rounded-xl border border-border/50 bg-card hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <category.icon className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-semibold">{category.label}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills[category.key].map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
