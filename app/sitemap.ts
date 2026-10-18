import type { MetadataRoute } from 'next';
import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://veninfotech.net';

const CATEGORIES = [
  'technology',
  'science',
  'economy',
  'culture',
  'world',
  'politics',
  'travel',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  for (const cat of CATEGORIES) {
    routes.push({
      url: `${SITE_URL}/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  try {
    const contentDir = path.join(process.cwd(), 'content');
    if (fs.existsSync(contentDir)) {
      const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'));
      for (const file of files) {
        const slug = file.replace(/\.md$/, '');
        routes.push({
          url: `${SITE_URL}/posts/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    }
  } catch (err) {
    console.warn('Sitemap file read error:', err);
  }

  return routes;
}
