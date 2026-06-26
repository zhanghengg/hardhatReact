import type { MetadataRoute } from 'next';
import { projects } from '@/data/projects';

const BASE_URL = 'https://0xmro.me';

export default function sitemap(): MetadataRoute.Sitemap {
  const projectEntries = projects
    .filter((p) => p.status !== 'planned')
    .map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: new Date(),
    }));

  return [
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/projects`, lastModified: new Date() },
    { url: `${BASE_URL}/about`, lastModified: new Date() },
    ...projectEntries,
  ];
}
