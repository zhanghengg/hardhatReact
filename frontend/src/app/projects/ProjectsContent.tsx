'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { projects, type Project } from '@/data/projects';
import { useI18n } from '@/i18n';

type Filter = 'all' | Project['status'];

const pageCopy = {
  zh: {
    title: '项目作品集',
    intro: '实际交付、协议实验和界面 demo，覆盖 Web3 产品从合约到前端的完整路径。',
    filters: {
      all: '全部',
      completed: '已完成',
      'in-progress': '进行中',
      planned: '计划中',
    },
    details: '查看详情',
    demo: '在线演示',
    preview: '预览',
    selected: '当前选中',
  },
  en: {
    title: 'Project portfolio',
    intro: 'Production work, protocol experiments, and interface demos across Web3.',
    filters: {
      all: 'All',
      completed: 'Completed',
      'in-progress': 'In progress',
      planned: 'Planned',
    },
    details: 'View details',
    demo: 'Live demo',
    preview: 'Preview',
    selected: 'Selected',
  },
};

function ProjectPreview({ project, label }: { project: Project; label: string }) {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-xs uppercase text-muted-foreground">{label}</span>
        <span className="h-px w-8 bg-[var(--site-cyan)]" />
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} preview`}
            fill
            sizes="(min-width: 1024px) 360px, 90vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="font-[family-name:var(--font-exo2)] text-8xl font-black text-muted-foreground/20">
              {project.title.slice(0, 1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectsContent() {
  const { language } = useI18n();
  const copy = pageCopy[language];
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedSlug, setSelectedSlug] = useState(projects[0]?.slug ?? '');

  const filteredProjects = useMemo(
    () => (filter === 'all' ? projects : projects.filter((project) => project.status === filter)),
    [filter]
  );
  const selectedProject =
    projects.find((project) => project.slug === selectedSlug) ?? filteredProjects[0] ?? projects[0];

  return (
    <div className="min-h-screen border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <h1 className="font-[family-name:var(--font-exo2)] text-5xl font-black leading-none tracking-normal sm:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">{copy.intro}</p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {(Object.keys(copy.filters) as Filter[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setFilter(item);
                  const next = item === 'all' ? projects[0] : projects.find((project) => project.status === item);
                  if (next) setSelectedSlug(next.slug);
                }}
                className={cn(
                  'border-b-2 px-4 py-3 font-mono text-sm transition-colors',
                  filter === item
                    ? 'border-[var(--site-cyan)] text-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                )}
              >
                {copy.filters[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px]">
          <div className="overflow-hidden border-y border-border">
            <div className="hidden grid-cols-[56px_1.2fr_0.65fr_0.9fr_1.4fr_0.8fr] border-b border-border px-4 py-3 font-mono text-[11px] uppercase text-muted-foreground lg:grid">
              <span>#</span>
              <span>Project</span>
              <span>Status</span>
              <span>Tags</span>
              <span>Description</span>
              <span>Actions</span>
            </div>

            {filteredProjects.map((project, index) => {
              const active = selectedProject?.slug === project.slug;

              return (
                <article
                  key={project.slug}
                  onMouseEnter={() => setSelectedSlug(project.slug)}
                  onFocus={() => setSelectedSlug(project.slug)}
                  className={cn(
                    'grid gap-4 border-b border-border px-4 py-5 last:border-b-0 lg:grid-cols-[56px_1.2fr_0.65fr_0.9fr_1.4fr_0.8fr] lg:items-center',
                    active && 'bg-accent/45'
                  )}
                >
                  <span className={cn('font-mono text-sm', active ? 'text-[var(--site-cyan)]' : 'text-muted-foreground')}>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <Link href={`/projects/${project.slug}`} className="font-[family-name:var(--font-exo2)] text-xl font-black hover:text-[var(--site-cyan)]">
                    {project.title}
                  </Link>

                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        project.status === 'completed'
                          ? 'bg-[var(--site-green)]'
                          : project.status === 'in-progress'
                            ? 'bg-[var(--site-cyan)]'
                            : 'bg-[var(--site-red)]'
                      )}
                    />
                    {copy.filters[project.status]}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">{project.description}</p>

                  <div className="flex flex-col items-start gap-2 font-mono text-xs uppercase">
                    <Link href={`/projects/${project.slug}`} className="text-foreground underline-offset-4 hover:underline">
                      {copy.details}
                      <ArrowRight className="ml-2 inline size-3" />
                    </Link>
                    {project.demoUrl && project.demoUrl !== '#' && (
                      <a
                        href={project.demoUrl}
                        target={project.demoUrl.startsWith('http') ? '_blank' : undefined}
                        rel={project.demoUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {copy.demo}
                        <ExternalLink className="ml-2 inline size-3" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="px-4 py-16 text-center text-muted-foreground">
                No projects match this filter.
              </div>
            )}
          </div>

          {selectedProject && (
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <ProjectPreview project={selectedProject} label={copy.preview} />
              <div className="border-x border-b border-border bg-card p-5">
                <p className="font-mono text-xs uppercase text-muted-foreground">{copy.selected}</p>
                <h2 className="mt-3 font-[family-name:var(--font-exo2)] text-3xl font-black">
                  {selectedProject.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedProject.description}</p>
                <div className="mt-5 flex flex-wrap gap-3">
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
                        {copy.demo}
                        <ExternalLink data-icon="inline-end" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
