'use client';

import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { profile } from '@/data/profile';

const heroCopy = {
  zh: {
    title: '从合约到界面，构建可用的 Web3 产品',
    desc:
      '我把智能合约、交易界面和产品体验连成一个完整系统，让复杂的链上逻辑更容易理解、更容易使用。',
    primary: '查看作品',
    secondary: '联系我',
    rail: 'Selected systems',
    railItems: ['A402 Launchpad', 'Hidex Signals', 'Simple DEX'],
  },
  en: {
    title: 'Building useful Web3 products with full-stack craft',
    desc:
      'I design and ship smart-contract systems, trading interfaces, and thoughtful web experiences from protocol to pixel.',
    primary: 'View projects',
    secondary: 'Contact me',
    rail: 'Selected systems',
    railItems: ['A402 Launchpad', 'Hidex Signals', 'Simple DEX'],
  },
};

function ContractGraph() {
  return (
    <div className="relative h-full min-h-[260px] overflow-hidden border border-border bg-[#07101d] p-5 text-white shadow-[10px_10px_0_rgba(10,167,223,0.16)]">
      <div className="mb-5 flex items-center justify-between border-b border-white/15 pb-3">
        <span className="font-mono text-xs text-white/70">Smart Contract Graph</span>
        <span className="text-sm text-white/50">x</span>
      </div>
      <div className="relative mx-auto h-40 max-w-[310px]">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 border border-[var(--site-cyan)] px-4 py-3 font-mono text-xs text-white">
          Router
          <span className="mt-1 block text-white/45">0x3f...a9c1</span>
        </div>
        <div className="absolute left-2 top-20 border border-[var(--site-cyan)] px-4 py-3 font-mono text-xs text-white">
          Factory
          <span className="mt-1 block text-white/45">0x8b...11e2</span>
        </div>
        <div className="absolute right-0 top-20 border border-[var(--site-red)] px-4 py-3 font-mono text-xs text-white">
          Pair
          <span className="mt-1 block text-white/45">0x7c...9d4f</span>
        </div>
        <div className="absolute bottom-0 left-14 border border-[var(--site-green)] px-4 py-3 font-mono text-xs text-white">
          Token A
        </div>
        <div className="absolute bottom-0 right-10 border border-[var(--site-cyan)] px-4 py-3 font-mono text-xs text-white">
          Token B
        </div>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 310 160" aria-hidden="true">
          <path d="M155 45 C120 70 92 78 58 96" stroke="var(--site-cyan)" strokeWidth="2" fill="none" />
          <path d="M155 45 C188 70 218 77 255 96" stroke="var(--site-red)" strokeWidth="2" fill="none" />
          <path d="M65 112 C82 126 97 136 117 141" stroke="var(--site-green)" strokeWidth="2" fill="none" />
          <path d="M248 112 C226 126 208 136 190 141" stroke="var(--site-cyan)" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="mt-5 border-t border-white/15 pt-4 font-mono text-[11px] leading-5 text-white/70">
        <span className="text-[var(--site-cyan)]">function</span> swapExactTokensForTokens(
        <span className="text-[var(--site-green)]">amountIn</span>, path, deadline)
      </div>
    </div>
  );
}

function ChartPreview() {
  const candles = [36, 54, 42, 68, 72, 58, 84, 94, 78, 88, 104, 92, 116, 108, 124];

  return (
    <div className="h-full min-h-[230px] border border-border bg-card p-4 shadow-[8px_8px_0_rgba(255,59,37,0.13)]">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <span className="font-mono text-xs font-semibold">ETH / USDC</span>
        <div className="flex gap-3 font-mono text-[11px] text-muted-foreground">
          <span>1H</span>
          <span>4H</span>
          <span className="text-foreground underline decoration-[var(--site-cyan)] decoration-2 underline-offset-4">1D</span>
          <span>1W</span>
        </div>
      </div>
      <div className="mb-4">
        <p className="font-mono text-2xl text-foreground">2,532.41</p>
        <p className="font-mono text-xs text-[var(--site-green)]">+1.28%</p>
      </div>
      <div className="relative h-32 border-b border-l border-border">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 128" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 86 C28 72 42 96 68 72 C96 45 116 58 142 38 C174 14 190 24 212 45 C236 68 256 32 300 18" fill="none" stroke="var(--site-green)" strokeWidth="2" />
          <path d="M0 100 C36 92 60 108 92 82 C124 58 146 70 176 66 C218 62 248 78 300 44" fill="none" stroke="var(--site-red)" strokeWidth="1.5" opacity="0.65" />
        </svg>
        <div className="absolute inset-x-3 bottom-0 flex h-24 items-end gap-1">
          {candles.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className={index % 3 === 0 ? 'w-full bg-[var(--site-red)]/70' : 'w-full bg-[var(--site-green)]/70'}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SwapPreview() {
  return (
    <div className="h-full min-h-[230px] border border-border bg-card p-4 shadow-[8px_8px_0_rgba(11,125,77,0.13)]">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <span className="font-mono text-xs font-semibold">Swap</span>
        <span className="font-mono text-[11px] text-muted-foreground">0.30%</span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>You pay</span>
            <span>Balance: 2.8109</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">ETH</span>
            <span className="font-mono text-2xl">1.25</span>
          </div>
        </div>
        <div className="mx-auto grid size-8 place-items-center border border-border bg-card font-mono text-sm">↓</div>
        <div className="border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>You receive</span>
            <span>Balance: 5,688.21</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">USDC</span>
            <span className="font-mono text-2xl">2,532.41</span>
          </div>
        </div>
        <div className="border border-primary bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[4px_4px_0_var(--site-cyan)]">
          Swap
        </div>
      </div>
    </div>
  );
}

function HeroProductScene() {
  return (
    <div className="relative lg:pl-8">
      <div className="absolute -left-4 top-12 hidden h-[72%] w-px bg-[var(--site-cyan)] lg:block" />
      <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
        <div className="md:row-span-2">
          <ContractGraph />
        </div>
        <ChartPreview />
        <SwapPreview />
      </div>
      <div className="pointer-events-none absolute -right-3 bottom-12 hidden h-28 w-28 border-r border-t border-dashed border-border lg:block" />
    </div>
  );
}

export function HeroSection() {
  const { language } = useI18n();
  const copy = heroCopy[language];

  return (
    <section className="relative flex min-h-[calc(100svh-73px)] flex-col border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl flex-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-exo2)] text-5xl font-black leading-[0.98] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
            {copy.desc}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/projects">
                {copy.primary}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={`mailto:${profile.contact.email}`}>
                <Mail data-icon="inline-start" />
                {copy.secondary}
              </a>
            </Button>
          </div>
        </div>

        <HeroProductScene />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 border-x border-border md:grid-cols-[1fr_3fr]">
          <div className="border-b border-border px-6 py-5 font-mono text-xs uppercase text-muted-foreground md:border-b-0 md:border-r">
            {copy.rail}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {copy.railItems.map((item, index) => (
              <div key={item} className="flex items-center gap-4 border-b border-border px-6 py-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <span className="font-mono text-sm text-[var(--site-cyan)]">0{index + 1}</span>
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
