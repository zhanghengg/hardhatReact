'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ArrowRight, Database, FileCode, Layers, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TradingViewChart, SymbolSearch, IntervalSelector, DataSourceSelector } from '@/components/trading';
import type { DataSource } from '@/components/trading';
import { projects } from '@/data/projects';
import { useI18n } from '@/i18n';

const project = projects.find((p) => p.slug === 'tradingview')!;

export default function TradingViewPage() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('60');
  const [dataSource, setDataSource] = useState<DataSource>('okx');
  const { t } = useI18n();

  return (
    <div className="min-h-screen border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" />
          {t.projectDetail.backToProjects}
        </Link>

        <header className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge variant="outline">{t.projectDetail.statusCompleted}</Badge>
              <Badge variant="secondary">Realtime charting</Badge>
            </div>
            <h1 className="font-[family-name:var(--font-exo2)] text-5xl font-black leading-none tracking-normal sm:text-6xl lg:text-7xl">
              {project.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{project.description}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/projects">
              Projects
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </header>

        <div className="mt-10 border border-border bg-card">
          <div className="flex flex-wrap items-center gap-4 border-b border-border p-4">
            <SymbolSearch value={symbol} onChange={setSymbol} />
            <IntervalSelector value={interval} onChange={setInterval} />

            <div className="flex items-center gap-2">
              <Database className="size-4 text-muted-foreground" />
              <DataSourceSelector value={dataSource} onChange={setDataSource} />
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <Zap className="size-4 text-[var(--site-green)]" />
              <span>{t.projectDetail.realTimeData}</span>
            </div>
          </div>

          {dataSource === 'binance' && (
            <div className="border-b border-amber-500/40 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600 dark:text-amber-400">{t.projectDetail.vpnTitle}</p>
                  <p className="mt-1 text-muted-foreground">{t.projectDetail.vpnDesc}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            <div className="min-h-[620px] border-b border-border lg:border-b-0 lg:border-r">
              <TradingViewChart
                key={dataSource}
                symbol={symbol}
                interval={interval}
                theme="Dark"
                dataSource={dataSource}
                onSymbolChange={setSymbol}
                onIntervalChange={setInterval}
              />
            </div>

            <aside className="flex flex-col">
              <section className="border-b border-border p-5">
                <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase text-[var(--site-green)]">
                  <TrendingUp className="size-4" />
                  {t.projectDetail.currentPair}
                </h2>
                <div className="mt-5 flex flex-col gap-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-border pb-3">
                    <span className="text-muted-foreground">{t.projectDetail.symbol}</span>
                    <span className="font-mono">{symbol}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-border pb-3">
                    <span className="text-muted-foreground">{t.projectDetail.interval}</span>
                    <span className="font-mono">{interval === '1D' ? '1 Day' : interval === '1W' ? '1 Week' : `${interval}m`}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{t.projectDetail.dataSource}</span>
                    <span className={dataSource === 'okx' ? 'text-[var(--site-cyan)]' : 'text-[var(--site-red)]'}>
                      {dataSource === 'okx' ? 'OKX' : 'Binance'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="border-b border-border p-5">
                <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase text-[var(--site-cyan)]">
                  <Layers className="size-4" />
                  {t.projectDetail.features}
                </h2>
                <div className="mt-5 flex flex-col gap-3">
                  {project.features.map((feature, index) => (
                    <div key={feature} className="grid grid-cols-[28px_1fr] gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                      <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                      <p className="text-sm leading-6 text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-b border-border p-5">
                <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase text-[var(--site-red)]">
                  <FileCode className="size-4" />
                  {t.projectDetail.techStack}
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </section>

              <section className="p-5">
                <h2 className="text-xl font-bold">{t.projectDetail.projectDetails}</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {project.longDescription
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .slice(0, 8)
                    .map((line, index) => (
                      <p key={`${line}-${index}`} className="text-sm leading-7 text-muted-foreground">
                        {line}
                      </p>
                    ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
