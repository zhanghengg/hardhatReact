'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export function ScrollIndicator() {
  const handleClick = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      onClick={handleClick}
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
