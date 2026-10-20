import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    const posts = await getAllPosts('published');
    for (const post of posts) {
      routes.push({
        url: `${SITE_URL}/posts/${post.slug}`,
        lastModified: new Date(post.timestamp || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  } catch (err) {
    console.warn('Sitemap dynamic posts query error:', err);
  }

  return routes;
}
