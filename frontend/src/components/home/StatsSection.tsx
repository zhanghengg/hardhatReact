'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';
import { AnimatedNumber } from './AnimatedNumber';

export function StatsSection() {
  const { t } = useI18n();

  const stats = [
    { value: 8, suffix: '+', label: t.stats.yearsExp },
    { value: 20, suffix: '+', label: t.stats.techStack },
    { value: 6, suffix: '+', label: t.stats.projects },
    { value: 2, suffix: '+', label: t.stats.web3Exp },
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.1),transparent)]" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
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
  );
}
