import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, FileCode, Layers } from 'lucide-react';
import { projects } from '@/data/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const statusColors = {
    completed: 'bg-green-500/10 text-green-500 border-green-500/20',
    'in-progress': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    planned: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  const statusLabels = {
    completed: '已完成',
    'in-progress': '进行中',
    planned: '计划中',
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回作品集
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold">{project.title}</h1>
            <Badge variant="outline" className={statusColors[project.status]}>
              {statusLabels[project.status]}
            </Badge>
          </div>

          <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {project.demoUrl && project.demoUrl !== '#' && (
              <Button asChild>
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  在线演示
                </a>
              </Button>
            )}
            {project.githubUrl && project.githubUrl !== '#' && (
              <Button variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  查看代码
                </a>
              </Button>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Project Image/Demo Area */}
        <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl mb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-white/20 mb-2">{project.title[0]}</div>
            <p className="text-muted-foreground">项目演示区域</p>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-purple-500" />
                功能特性
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileCode className="h-5 w-5 text-cyan-500" />
                技术栈
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Info */}
        {project.contractAddress && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">合约信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">网络:</span>
                  <Badge variant="secondary">{project.network}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">合约地址:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {project.contractAddress}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Long Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">项目详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              {project.longDescription.split('\n').map((paragraph, index) => (
                <p key={index} className="text-muted-foreground mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
