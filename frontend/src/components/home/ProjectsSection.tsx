'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { projects } from '@/data/projects';
import { useI18n } from '@/i18n';

const projectCopy = {
  zh: {
    title: '精选作品',
    intro: '把实际项目放在一个可扫描的工作台里：协议、交易界面、机器人和产品站点。',
    all: '全部作品',
    open: '打开项目',
    details: '查看详情',
  },
  en: {
    title: 'Selected work',
    intro: 'A focused bench of shipped systems, protocol experiments, and interface demos.',
    all: 'All projects',
    open: 'Open project',
    details: 'View details',
  },
};

function statusLabel(status: string, labels: ReturnType<typeof useI18n>['t']['projectDetail']) {
  if (status === 'completed') return labels.statusCompleted;
  if (status === 'in-progress') return labels.statusInProgress;
  return labels.statusPlanned;
}

function PreviewFallback({ title }: { title: string }) {
  return (
    <div className="grid h-full place-items-center bg-muted">
      <div className="text-center">
        <div className="font-[family-name:var(--font-exo2)] text-7xl font-black text-muted-foreground/20">
          {title.slice(0, 1)}
        </div>
        <p className="mt-2 font-mono text-xs uppercase text-muted-foreground">Interface preview</p>
      </div>
    </div>
  );
}

export function ProjectsSection() {
  const { language, t } = useI18n();
  const copy = projectCopy[language];
  const visibleProjects = useMemo(
    () => projects.filter((project) => project.status !== 'planned').slice(0, 4),
    []
  );
  const [selectedSlug, setSelectedSlug] = useState(visibleProjects[0]?.slug ?? '');
  const selectedProject = visibleProjects.find((project) => project.slug === selectedSlug) ?? visibleProjects[0];

  if (!selectedProject) return null;

  return (
    <section className="border-b border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <div className="mb-10 flex items-start justify-between gap-6">
              <div>
                <h2 className="font-[family-name:var(--font-exo2)] text-5xl font-black leading-none tracking-normal sm:text-6xl">
                  {copy.title}
                </h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">{copy.intro}</p>
              </div>
            </div>

            <div className="relative border-y border-border">
              <div className="absolute bottom-0 left-0 top-0 w-px bg-[var(--site-cyan)]" />
              {visibleProjects.map((project, index) => {
                const active = project.slug === selectedProject.slug;

                return (
                  <article
                    key={project.slug}
                    onMouseEnter={() => setSelectedSlug(project.slug)}
                    onFocus={() => setSelectedSlug(project.slug)}
                    className={cn(
                      'group grid gap-4 border-b border-border py-7 pl-7 pr-1 last:border-b-0 sm:grid-cols-[42px_1fr_auto]',
                      active && 'bg-accent/45'
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono text-sm',
                        index === 0 ? 'text-[var(--site-cyan)]' : index === 1 ? 'text-[var(--site-red)]' : 'text-[var(--site-green)]'
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="font-[family-name:var(--font-exo2)] text-2xl font-black leading-tight transition-colors group-hover:text-[var(--site-cyan)]"
                        >
                          {project.title}
                        </Link>
                        <Badge variant="outline">{statusLabel(project.status, t.projectDetail)}</Badge>
                      </div>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{project.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="self-start font-mono text-xs uppercase text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {copy.details} <ArrowRight className="inline size-3" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="lg:pt-16">
            <div className="border border-foreground bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <span className="font-mono text-sm text-[var(--site-cyan)]">01</span>
                  <h3 className="mt-2 font-[family-name:var(--font-exo2)] text-3xl font-black">
                    {selectedProject.title}
                  </h3>
                </div>
                <Link href={`/projects/${selectedProject.slug}`} className="hidden text-sm font-semibold underline-offset-4 hover:underline sm:block">
                  {copy.details}
                  <ArrowRight className="ml-2 inline size-4" />
                </Link>
              </div>

              <div className="p-5">
                <p className="mb-5 max-w-2xl text-base leading-7 text-muted-foreground">
                  {selectedProject.description}
                </p>
                <div className="relative aspect-[16/9] overflow-hidden border border-border bg-muted">
                  {selectedProject.image ? (
                    <Image
                      src={selectedProject.image}
                      alt={`${selectedProject.title} preview`}
                      fill
                      sizes="(min-width: 1024px) 660px, 90vw"
                      className="object-cover object-top"
                    />
                  ) : (
                    <PreviewFallback title={selectedProject.title} />
                  )}
                </div>
              </div>

              <div className="grid border-t border-border sm:grid-cols-[1fr_auto]">
                <p className="border-b border-border px-5 py-4 font-mono text-xs text-muted-foreground sm:border-b-0 sm:border-r">
                  Explore shipped builds, experiments, and open demos.
                </p>
                <div className="flex flex-wrap gap-3 px-5 py-4">
                  <Button variant="outline" asChild>
                    <Link href={`/projects/${selectedProject.slug}`}>
                      {copy.details}
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                  {selectedProject.demoUrl && selectedProject.demoUrl !== '#' && (
                    <Button asChild>
                      <a
                        href={selectedProject.demoUrl}
                        target={selectedProject.demoUrl.startsWith('http') ? '_blank' : undefined}
                        rel={selectedProject.demoUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {copy.open}
                        <ExternalLink data-icon="inline-end" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" asChild>
                <Link href="/projects">
                  {copy.all}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
