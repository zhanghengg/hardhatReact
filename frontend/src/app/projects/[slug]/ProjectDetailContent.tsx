'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ExternalLink, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import type { Project } from '@/data/projects';

function statusLabel(status: Project['status'], labels: ReturnType<typeof useI18n>['t']['projectDetail']) {
  if (status === 'completed') return labels.statusCompleted;
  if (status === 'in-progress') return labels.statusInProgress;
  return labels.statusPlanned;
}

function ProjectImage({ project }: { project: Project }) {
  if (!project.image) {
    return (
      <div className="grid aspect-[16/9] place-items-center border border-border bg-muted">
        <span className="font-[family-name:var(--font-exo2)] text-8xl font-black text-muted-foreground/20">
          {project.title.slice(0, 1)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden border border-border bg-muted">
      <Image
        src={project.image}
        alt={project.title}
        fill
        priority
        sizes="(min-width: 1024px) 860px, 92vw"
        className="object-cover object-top"
      />
    </div>
  );
}

export function ProjectDetailContent({ project }: { project: Project }) {
  const { t } = useI18n();
  const descriptionLines = project.longDescription
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" />
          {t.projectDetail.backToProjects}
        </Link>

        <header className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Badge variant="outline">{statusLabel(project.status, t.projectDetail)}</Badge>
              {project.network && <Badge variant="secondary">{project.network}</Badge>}
            </div>
            <h1 className="font-[family-name:var(--font-exo2)] text-5xl font-black leading-none tracking-normal sm:text-6xl lg:text-7xl">
              {project.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{project.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {project.githubUrl && project.githubUrl !== '#' && (
              <Button variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github data-icon="inline-start" />
                  {t.projectDetail.viewCode}
                </a>
              </Button>
            )}
            {project.demoUrl && project.demoUrl !== '#' && (
              <Button asChild>
                <a
                  href={project.demoUrl}
                  target={project.demoUrl.startsWith('http') ? '_blank' : undefined}
                  rel={project.demoUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {t.projectDetail.liveLink}
                  <ExternalLink data-icon="inline-end" />
                </a>
              </Button>
            )}
          </div>
        </header>

        <div className="mt-10">
          <ProjectImage project={project} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="flex flex-col gap-6">
            <section className="border border-border bg-card p-6">
              <h2 className="font-mono text-sm font-semibold uppercase text-[var(--site-cyan)]">
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
              <h2 className="font-mono text-sm font-semibold uppercase text-[var(--site-red)]">
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

            {project.contractAddress && (
              <section className="border border-border bg-card p-6">
                <h2 className="font-mono text-sm font-semibold uppercase text-[var(--site-green)]">
                  {t.projectDetail.contractInfo}
                </h2>
                <div className="mt-5 flex flex-col gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                    <span className="text-muted-foreground">{t.projectDetail.network}</span>
                    <span className="font-mono">{project.network}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground">{t.projectDetail.contractAddress}</span>
                    <code className="break-words border border-border bg-muted px-3 py-2 font-mono text-xs">
                      {project.contractAddress}
                    </code>
                  </div>
                </div>
              </section>
            )}
          </aside>

          <article className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-2xl font-bold">{t.projectDetail.projectDetails}</h2>
              <ArrowRight className="size-5 text-[var(--site-cyan)]" />
            </div>
            <div className="flex flex-wrap gap-2 border-b border-border px-6 py-4">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-col gap-4 p-6">
              {descriptionLines.map((line, index) => {
                const isHeading = line.startsWith('【') && line.endsWith('】');
                const isBullet = line.startsWith('- ');

                if (isHeading) {
                  return (
                    <h3 key={`${line}-${index}`} className="mt-2 border-t border-border pt-5 text-xl font-bold first:mt-0 first:border-t-0 first:pt-0">
                      {line.replace('【', '').replace('】', '')}
                    </h3>
                  );
                }

                return (
                  <p key={`${line}-${index}`} className={isBullet ? 'pl-4 text-sm leading-7 text-muted-foreground before:mr-2 before:content-["-"]' : 'text-sm leading-7 text-muted-foreground'}>
                    {isBullet ? line.slice(2) : line}
                  </p>
                );
              })}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
