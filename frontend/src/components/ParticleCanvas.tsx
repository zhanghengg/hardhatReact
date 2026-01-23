'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from './ThemeProvider';

interface ParticleCanvasProps {
  className?: string;
}

// 配置常量
const DOT_SPACING = 32; // 点之间的间距
const BASE_DOT_SIZE = 1.5; // 基础点大小
const GLOW_DOT_SIZE = 2.5; // 光晕区域内点的额外大小
const BASE_ALPHA = 0.15; // 基础透明度
const GLOW_ALPHA = 0.85; // 光晕区域内的额外透明度
const GLOW_RADIUS = 200; // 光晕影响半径
const MOUSE_GLOW_SIZE = 300; // 鼠标光晕大小

export function ParticleCanvas({ className = '' }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const targetMouseRef = useRef({ x: -1000, y: -1000 });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 平滑插值函数
  const lerp = useCallback((start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  }, []);

  // 绘制单个点
  const drawDot = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    mouseX: number,
    mouseY: number,
    isDarkMode: boolean
  ) => {
    const dx = x - mouseX;
    const dy = y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 计算基于距离的强度 (0-1)
    const intensity = Math.max(0, 1 - distance / GLOW_RADIUS);
    const easedIntensity = intensity * intensity; // 二次缓动，使边缘更柔和
    
    // 计算点的大小和透明度
    const size = BASE_DOT_SIZE + easedIntensity * GLOW_DOT_SIZE;
    const alpha = BASE_ALPHA + easedIntensity * GLOW_ALPHA;
    
    // 颜色设置
    if (isDarkMode) {
      // 深色模式：紫色到青色渐变
      if (intensity > 0) {
        const hue = 270 - intensity * 90; // 从紫色(270)到青色(180)
        ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`; // slate-400
      }
    } else {
      // 浅色模式：柔和紫色
      if (intensity > 0) {
        const hue = 270 - intensity * 30; // 紫色范围
        ctx.fillStyle = `hsla(${hue}, 60%, 50%, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(100, 116, 139, ${alpha})`; // slate-500
      }
    }
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // 绘制鼠标光晕
  const drawMouseGlow = useCallback((
    ctx: CanvasRenderingContext2D,
    mouseX: number,
    mouseY: number,
    isDarkMode: boolean
  ) => {
    // 只在鼠标在画布内时绘制光晕
    if (mouseX < -500 || mouseY < -500) return;
    
    const gradient = ctx.createRadialGradient(
      mouseX, mouseY, 0,
      mouseX, mouseY, MOUSE_GLOW_SIZE
    );
    
    if (isDarkMode) {
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)'); // violet-500
      gradient.addColorStop(0.3, 'rgba(6, 182, 212, 0.08)'); // cyan-500
      gradient.addColorStop(0.6, 'rgba(139, 92, 246, 0.03)'); // violet-500
      gradient.addColorStop(1, 'transparent');
    } else {
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.12)'); // violet-500
      gradient.addColorStop(0.4, 'rgba(192, 132, 252, 0.05)'); // violet-400
      gradient.addColorStop(1, 'transparent');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      mouseX - MOUSE_GLOW_SIZE,
      mouseY - MOUSE_GLOW_SIZE,
      MOUSE_GLOW_SIZE * 2,
      MOUSE_GLOW_SIZE * 2
    );
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
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      targetMouseRef.current = { x: -1000, y: -1000 };
    };

    // 监听整个窗口的鼠标移动，以便在 hero 区域外也能跟踪
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      
      // 平滑鼠标位置
      mouseRef.current.x = lerp(mouseRef.current.x, targetMouseRef.current.x, 0.1);
      mouseRef.current.y = lerp(mouseRef.current.y, targetMouseRef.current.y, 0.1);
      
      // 清除画布
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // 绘制鼠标光晕（在点之前绘制，作为背景）
      drawMouseGlow(ctx, mouseRef.current.x, mouseRef.current.y, isDark);
      
      // 绘制点阵
      const cols = Math.ceil(rect.width / DOT_SPACING) + 1;
      const rows = Math.ceil(rect.height / DOT_SPACING) + 1;
      
      // 计算偏移使点阵居中
      const offsetX = (rect.width - (cols - 1) * DOT_SPACING) / 2;
      const offsetY = (rect.height - (rows - 1) * DOT_SPACING) / 2;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = offsetX + col * DOT_SPACING;
          const y = offsetY + row * DOT_SPACING;
          drawDot(ctx, x, y, mouseRef.current.x, mouseRef.current.y, isDark);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [drawDot, drawMouseGlow, lerp, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}
