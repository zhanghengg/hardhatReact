'use client';

import { motion } from 'framer-motion';
import { ProjectCard } from '@/components/ProjectCard';
import { projects } from '@/data/projects';
import { useI18n } from '@/i18n';

export default function ProjectsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              {t.projects.title}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.projectsPage.subtitle}
          </p>
        </motion.div>

        {/* Filter Tabs - 可以后续扩展 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {[t.projects.filterAll, 'DeFi', 'NFT', 'Security'].map((tag, index) => (
            <button
              key={tag}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                index === 0
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>

        {/* Empty State for future projects */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t.projectsPage.noProjects}</p>
          </div>
        )}
      </div>
    </div>
  );
}
