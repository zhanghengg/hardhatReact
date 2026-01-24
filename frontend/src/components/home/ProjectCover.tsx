'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Project {
  title: string;
  image?: string;
}

interface ProjectCoverProps {
  project: Project;
}

export function ProjectCover({ project }: ProjectCoverProps) {
  const [imageError, setImageError] = useState(false);

  if (project.image && !imageError) {
    return (
      <Image
        src={project.image}
        alt={project.title}
        fill
        className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),transparent)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl font-bold text-white/20">{project.title[0]}</div>
      </div>
    </>
  );
}
