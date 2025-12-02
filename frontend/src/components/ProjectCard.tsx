'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 border-border/50 hover:border-purple-500/30">
        {/* Project Image Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-cyan-500/20 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-white/20">{project.title[0]}</div>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className={statusColors[project.status]}>
              {statusLabels[project.status]}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2">
          <h3 className="text-xl font-semibold group-hover:text-purple-500 transition-colors">
            {project.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-4 border-t border-border/50">
          <div className="flex gap-2">
            {project.githubUrl && (
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} GitHub`}
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.demoUrl && (
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} Demo`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/projects/${project.slug}`}>
              查看详情 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
