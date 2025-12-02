'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from './ThemeProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
  type: 'normal' | 'core' | 'orbit';
}

interface ParticleCanvasProps {
  className?: string;
}

// 霓虹色系 - 暗色模式（更亮更醒目）
const NEON_COLORS_DARK = [
  '#00ffff', // 青色
  '#ff00ff', // 品红
  '#00ff88', // 绿色
  '#ff3366', // 红粉
  '#8855ff', // 紫色
  '#ffff00', // 黄色
];

// 柔和色系 - 白天模式（深色调，适合浅色背景）
const NEON_COLORS_LIGHT = [
  '#0891b2', // 深青色
  '#c026d3', // 深品红
  '#059669', // 深绿色
  '#dc2626', // 深红色
  '#7c3aed', // 深紫色
  '#d97706', // 深橙色
];

export function ParticleCanvas({ className = '' }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, isMoving: false });
  const timeRef = useRef(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? NEON_COLORS_DARK : NEON_COLORS_LIGHT;

  const createParticle = useCallback((canvas: HTMLCanvasElement, type: 'normal' | 'core' | 'orbit' = 'normal'): Particle => {
    const baseRadius = type === 'core' ? 4 : type === 'orbit' ? 2 : 3;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * baseRadius + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.4 + 0.6,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.05 + 0.02,
      type,
    };
  }, [colors]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle, time: number) => {
    const pulseAlpha = Math.sin(particle.pulse + time * particle.pulseSpeed) * 0.3 + 0.7;
    const glowRadius = particle.radius * (1.5 + Math.sin(particle.pulse + time * 0.02) * 0.5);
    
    // 外发光效果
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, glowRadius * 3
    );
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.4, particle.color + '80');
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, glowRadius * 3, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = particle.alpha * pulseAlpha * 0.6;
    ctx.fill();
    
    // 核心亮点
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = particle.alpha * pulseAlpha;
    ctx.fill();
    
    // 颜色环
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = particle.alpha * pulseAlpha * 0.8;
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  }, []);

  // 绘制六边形网格背景
  const drawHexGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const hexSize = 40;
    const hexHeight = hexSize * Math.sqrt(3);
    const hexWidth = hexSize * 2;
    
    ctx.strokeStyle = isDark ? '#00ffff' : '#0891b2';
    ctx.lineWidth = 0.3;
    
    for (let row = -1; row < height / hexHeight + 1; row++) {
      for (let col = -1; col < width / (hexWidth * 0.75) + 1; col++) {
        const x = col * hexWidth * 0.75;
        const y = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);
        
        // 距离中心的闪烁效果
        const distToCenter = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
        const wave = Math.sin(distToCenter * 0.01 - time * 0.002) * 0.5 + 0.5;
        
        ctx.globalAlpha = 0.03 + wave * 0.05;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i + Math.PI / 6;
          const hx = x + hexSize * Math.cos(angle);
          const hy = y + hexSize * Math.sin(angle);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }, [isDark]);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[], time: number) => {
    const maxDistance = 200;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.5;
          const gradient = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          gradient.addColorStop(0, particles[i].color);
          gradient.addColorStop(0.5, '#ffffff40');
          gradient.addColorStop(1, particles[j].color);
          
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = gradient;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // 能量脉冲效果
          const pulsePos = (time * 0.003 + i * 0.1) % 1;
          const pulseX = particles[i].x + (particles[j].x - particles[i].x) * pulsePos;
          const pulseY = particles[i].y + (particles[j].y - particles[i].y) * pulsePos;
          
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = opacity * 0.8;
          ctx.fill();
          
          ctx.globalAlpha = 1;
        }
      }
    }

    // 鼠标交互 - 能量波效果
    const mouse = mouseRef.current;
    if (mouse.isMoving) {
      // 鼠标光环
      const mouseGlow = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 150
      );
      mouseGlow.addColorStop(0, isDark ? '#00ffff40' : '#0891b240');
      mouseGlow.addColorStop(0.5, isDark ? '#ff00ff20' : '#c026d320');
      mouseGlow.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
      ctx.fillStyle = mouseGlow;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      
      // 扩散波纹
      const waveRadius = (time * 0.1) % 200;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? '#00ffff' : '#0891b2';
      ctx.lineWidth = 2;
      ctx.globalAlpha = (1 - waveRadius / 200) * 0.5;
      ctx.stroke();
      
      for (const particle of particles) {
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 250) {
          const opacity = (1 - distance / 250) * 0.8;
          
          // 电流效果连线
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          
          // 添加抖动的中间点模拟电流
          const midX = (particle.x + mouse.x) / 2 + (Math.random() - 0.5) * 20;
          const midY = (particle.y + mouse.y) / 2 + (Math.random() - 0.5) * 20;
          ctx.quadraticCurveTo(midX, midY, mouse.x, mouse.y);
          
          ctx.strokeStyle = particle.color;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }, [isDark]);

  const updateParticle = useCallback((particle: Particle, canvas: HTMLCanvasElement, time: number) => {
    // 更新脉冲
    particle.pulse += particle.pulseSpeed;
    
    particle.x += particle.vx;
    particle.y += particle.vy;

    // 鼠标吸引/排斥效果
    const mouse = mouseRef.current;
    if (mouse.isMoving) {
      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150 && distance > 0) {
        // 近距离排斥，远距离轻微吸引
        const force = distance < 80 
          ? (80 - distance) / 80 * 0.5 
          : -(150 - distance) / 150 * 0.1;
        particle.vx += (dx / distance) * force;
        particle.vy += (dy / distance) * force;
      }
    }

    // 添加微小的正弦波动
    particle.vx += Math.sin(time * 0.001 + particle.pulse) * 0.01;
    particle.vy += Math.cos(time * 0.001 + particle.pulse) * 0.01;

    // 速度限制
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    if (speed > 3) {
      particle.vx = (particle.vx / speed) * 3;
      particle.vy = (particle.vy / speed) * 3;
    }

    // 摩擦力
    particle.vx *= 0.995;
    particle.vy *= 0.995;

    // 最小速度
    if (speed < 0.3) {
      particle.vx = (Math.random() - 0.5) * 0.8;
      particle.vy = (Math.random() - 0.5) * 0.8;
    }

    // 边界环绕
    if (particle.x < -50) particle.x = canvas.width + 50;
    if (particle.x > canvas.width + 50) particle.x = -50;
    if (particle.y < -50) particle.y = canvas.height + 50;
    if (particle.y > canvas.height + 50) particle.y = -50;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // 更多粒子，更震撼的效果
      const particleCount = Math.min(Math.floor((rect.width * rect.height) / 4000), 200);
      const particles: Particle[] = [];
      
      // 添加核心粒子
      for (let i = 0; i < particleCount * 0.2; i++) {
        particles.push(createParticle({ ...canvas, width: rect.width, height: rect.height }, 'core'));
      }
      // 添加普通粒子
      for (let i = 0; i < particleCount * 0.6; i++) {
        particles.push(createParticle({ ...canvas, width: rect.width, height: rect.height }, 'normal'));
      }
      // 添加轨道粒子
      for (let i = 0; i < particleCount * 0.2; i++) {
        particles.push(createParticle({ ...canvas, width: rect.width, height: rect.height }, 'orbit'));
      }
      
      particlesRef.current = particles;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isMoving: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isMoving = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      timeRef.current++;
      const time = timeRef.current;
      const rect = canvas.getBoundingClientRect();
      
      // 半透明清除，产生拖尾效果
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // 绘制六边形网格背景
      drawHexGrid(ctx, rect.width, rect.height, time);

      // 更新并绘制粒子
      for (const particle of particlesRef.current) {
        updateParticle(particle, { ...canvas, width: rect.width, height: rect.height } as HTMLCanvasElement, time);
        drawParticle(ctx, particle, time);
      }

      // 绘制连线
      drawConnections(ctx, particlesRef.current, time);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [createParticle, drawParticle, drawHexGrid, drawConnections, updateParticle, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}
