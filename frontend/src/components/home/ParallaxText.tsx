'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface ParallaxTextProps {
  children: string;
  baseVelocity?: number;
}

export function ParallaxText({ children, baseVelocity = 5 }: ParallaxTextProps) {
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
