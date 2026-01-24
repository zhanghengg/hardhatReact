'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

export function FooterCTA() {
  const { t } = useI18n();

  return (
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
  );
}
