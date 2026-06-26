'use client';

import { ArrowRight, Blocks, CandlestickChart, Code2, FileCode2 } from 'lucide-react';
import { useI18n } from '@/i18n';

const capabilityCopy = {
  zh: {
    title: '从协议到产品',
    quote: '我喜欢能把复杂系统状态清楚呈现出来的界面。',
    items: [
      {
        title: '智能合约',
        desc: 'Solidity、Hardhat、ERC20 流程、本地部署、合约集成。',
        icon: FileCode2,
        color: 'text-[var(--site-cyan)]',
      },
      {
        title: '前端系统',
        desc: 'Next.js、React、TypeScript、设计系统、可访问交互。',
        icon: Code2,
        color: 'text-[var(--site-red)]',
      },
      {
        title: '市场界面',
        desc: '交易图表、实时数据源、交易对搜索、Charting Library。',
        icon: CandlestickChart,
        color: 'text-[var(--site-green)]',
      },
      {
        title: '产品打磨',
        desc: '中英文内容、深色模式、动效、性能导向实现。',
        icon: Blocks,
        color: 'text-foreground',
      },
    ],
  },
  en: {
    title: 'From protocol to product',
    quote: 'I like interfaces that make complex systems feel inspectable.',
    items: [
      {
        title: 'Smart contracts',
        desc: 'Solidity, Hardhat, ERC20 flows, local deployment, contract integration.',
        icon: FileCode2,
        color: 'text-[var(--site-cyan)]',
      },
      {
        title: 'Frontend systems',
        desc: 'Next.js, React, TypeScript, design systems, accessible interaction.',
        icon: Code2,
        color: 'text-[var(--site-red)]',
      },
      {
        title: 'Market interfaces',
        desc: 'Trading charts, realtime data feeds, symbol search, charting widgets.',
        icon: CandlestickChart,
        color: 'text-[var(--site-green)]',
      },
      {
        title: 'Product polish',
        desc: 'Bilingual content, dark mode, motion, performance-minded implementation.',
        icon: Blocks,
        color: 'text-foreground',
      },
    ],
  },
};

function BlueprintPanel() {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-xs uppercase text-muted-foreground">Architecture overview</span>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="h-px w-4 bg-current" />
          <span className="size-2 border border-current" />
          <span className="text-sm">x</span>
        </div>
      </div>
      <div className="grid gap-0 lg:grid-cols-3">
        {[
          ['Onchain', 'Solidity contracts', 'Events', 'State'],
          ['Offchain', 'Indexing', 'Caching', 'APIs'],
          ['Interface', 'Next.js app', 'Charts', 'Wallet UX'],
        ].map((column, index) => (
          <div key={column[0]} className="border-b border-border p-5 lg:border-b-0 lg:border-r lg:last:border-r-0">
            <div className="mb-4 flex items-center justify-between">
              <span
                className={
                  index === 0
                    ? 'font-mono text-xs uppercase text-[var(--site-cyan)]'
                    : index === 1
                      ? 'font-mono text-xs uppercase text-[var(--site-red)]'
                      : 'font-mono text-xs uppercase text-[var(--site-green)]'
                }
              >
                {column[0]}
              </span>
              <span className="size-3 border border-current text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-2">
              {column.slice(1).map((item) => (
                <div key={item} className="border border-border px-3 py-2 font-mono text-xs text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2">
        <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
          <p className="mb-4 font-mono text-xs uppercase text-muted-foreground">Contract (Solidity)</p>
          <pre className="overflow-hidden font-mono text-[11px] leading-5 text-muted-foreground">
            <code>{`contract Token {
  string public name = "ProtoToken";
  mapping(address => uint256) balanceOf;

  event Transfer(address indexed from,
                 address indexed to,
                 uint256 amount);
}`}</code>
          </pre>
        </div>
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-xs uppercase text-muted-foreground">Market preview</p>
            <span className="font-mono text-xs text-[var(--site-green)]">BTC / USDT</span>
          </div>
          <div className="flex h-36 items-end gap-1 border-b border-l border-border px-3 pb-3">
            {[42, 58, 38, 64, 70, 51, 76, 83, 68, 92, 74, 86, 61, 72, 95, 80, 88, 101].map((height, index) => (
              <span
                key={`${height}-${index}`}
                className={index % 4 === 0 ? 'w-full bg-[var(--site-red)]' : 'w-full bg-[var(--site-green)]'}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 font-mono text-[11px] text-muted-foreground">
            <span>1H</span>
            <span>4H</span>
            <span className="text-foreground underline decoration-[var(--site-cyan)] decoration-2 underline-offset-4">1D</span>
            <span>1W</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkillsSection() {
  const { language } = useI18n();
  const copy = capabilityCopy[language];

  return (
    <section className="border-b border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-5xl font-[family-name:var(--font-exo2)] text-5xl font-black leading-none tracking-normal sm:text-6xl lg:text-7xl">
          {copy.title}
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative">
            <div className="absolute bottom-10 left-4 top-6 w-px bg-border" />
            <div className="flex flex-col gap-0">
              {copy.items.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="relative grid grid-cols-[44px_1fr_auto] items-start gap-5 border-b border-border py-7">
                    <span className={`relative z-10 grid size-8 place-items-center border bg-background font-mono text-sm ${item.color}`}>
                      {`0${index + 1}`}
                    </span>
                    <div className="flex gap-4">
                      <Icon className={`mt-1 size-7 shrink-0 ${item.color}`} />
                      <div>
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className={`mt-2 size-5 ${item.color}`} />
                  </div>
                );
              })}
            </div>

            <blockquote className="mt-10 flex gap-5 border-l-2 border-[var(--site-cyan)] pl-6">
              <span className="font-[family-name:var(--font-exo2)] text-7xl leading-none text-[var(--site-cyan)]">“</span>
              <p className="max-w-lg text-2xl font-medium leading-snug">{copy.quote}</p>
            </blockquote>
          </div>

          <BlueprintPanel />
        </div>
      </div>
    </section>
  );
}
