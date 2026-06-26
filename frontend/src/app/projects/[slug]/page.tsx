import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';
import { ProjectDetailContent } from './ProjectDetailContent';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

// 有专门页面的项目 slug 列表（这些项目有独立的 /projects/xxx/page.tsx）
const projectsWithDedicatedPages = ['simple-dex', 'tradingview']

export async function generateStaticParams() {
  return projects
    .filter((project) => !projectsWithDedicatedPages.includes(project.slug))
    .map((project) => ({
      slug: project.slug,
    }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} | 0xMRO`,
    description: project.description,
    keywords: project.tags,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  if (projectsWithDedicatedPages.includes(slug)) {
    notFound();
  }

  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailContent project={project} />;
}
