'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, FileCode, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UniswapDemo } from '@/components/dex/UniswapDemo';
import { ContractAddresses, PoolInfoSection } from '@/components/dex/components';
import { projects } from '@/data/projects';
import { useI18n } from '@/i18n';

const project = projects.find((p) => p.slug === 'simple-dex')!;

export default function SimpleDexPage() {
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
              <Badge variant="secondary">{project.network}</Badge>
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

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-2xl font-bold">{t.projectDetail.onlineDemo}</h2>
              <span className="font-mono text-xs uppercase text-[var(--site-cyan)]">Live interface</span>
            </div>
            <div className="border border-border bg-card p-4">
              <UniswapDemo />
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <ContractAddresses />
            <PoolInfoSection />

            <section className="border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase text-[var(--site-cyan)]">
                <Layers className="size-4" />
                {t.projectDetail.features}
              </h2>
              <div className="mt-5 flex flex-col gap-3">
                {project.features.map((feature, index) => (
                  <div key={feature} className="grid grid-cols-[32px_1fr] gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <span className="font-mono text-sm text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                    <p className="text-sm leading-6 text-muted-foreground">{feature}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-border bg-card p-6">
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

            <section className="border border-border bg-card p-6">
              <h2 className="text-2xl font-bold">{t.projectDetail.projectDetails}</h2>
              <div className="mt-5 flex flex-col gap-3">
                {project.longDescription
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
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
  );
}
