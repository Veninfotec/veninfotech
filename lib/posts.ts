import { cache } from 'react';
import { sql } from '@/lib/db';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export interface Post {
  id?: number;
  slug: string;
  title: string;
  date: string;
  timestamp: number;
  excerpt: string;
  content?: string;
  category: string;
  image: string;
  status: 'draft' | 'pending_review' | 'published';
  author: string;
  views: number;
  is_breaking?: boolean;
  post_type?: 'blog' | 'news';
}

/**
 * Determines whether an article is strictly a news item vs a regular blog.
 * An article is classified as NEWS if:
 * 1. Explicitly marked as breaking news (is_breaking = true)
 * 2. Explicitly assigned post_type = 'news'
 * 3. Categorized under 'NEWS', 'WORLD NEWS', or 'BREAKING'
 */
export function isNewsArticle(post: {
  post_type?: string | null;
  category?: string | null;
  is_breaking?: boolean | null;
}): boolean {
  if (post.is_breaking) return true;
  if (post.post_type === 'news') return true;
  const cat = (post.category || '').trim().toUpperCase();
  if (cat === 'NEWS' || cat === 'WORLD NEWS' || cat === 'BREAKING NEWS' || cat === 'BREAKING') {
    return true;
  }
  return false;
}

const CONTENT_DIR = path.join(process.cwd(), 'content');

function formatTimestamp(d: Date | string | number): { label: string; timestamp: number } {
  const dateObj = d instanceof Date ? d : new Date(d);
  const timestamp = Number.isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime();
  const label = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return { label, timestamp };
}

/**
 * Fetch all posts with option to filter by status.
 * Public views (homepage, hero, news list) use 'published'.
 * Admin studio uses 'all' or 'draft'.
 */
export const getAllPosts = cache(
  async (statusFilter: 'published' | 'draft' | 'pending_review' | 'all' = 'published'): Promise<Post[]> => {
    try {
      let query;
      if (statusFilter === 'all') {
        query = sql`
          SELECT 
            p.id,
            p.slug,
            p.title,
            p.excerpt,
            p.content,
            p.category,
            p.image,
            p.status,
            p.author,
            COALESCE(p.is_breaking, false) AS is_breaking,
            COALESCE(p.post_type, 'blog') AS post_type,
            p.created_at,
            COALESCE(v.view_count, p.views, 0) AS views
          FROM posts p
          LEFT JOIN post_views v ON p.slug = v.slug
          ORDER BY p.created_at DESC
        `;
      } else {
        query = sql`
          SELECT 
            p.id,
            p.slug,
            p.title,
            p.excerpt,
            p.content,
            p.category,
            p.image,
            p.status,
            p.author,
            COALESCE(p.is_breaking, false) AS is_breaking,
            COALESCE(p.post_type, 'blog') AS post_type,
            p.created_at,
            COALESCE(v.view_count, p.views, 0) AS views
          FROM posts p
          LEFT JOIN post_views v ON p.slug = v.slug
          WHERE p.status = ${statusFilter}
          ORDER BY p.created_at DESC
        `;
      }

      const rows = await query;

      if (rows && rows.length > 0) {
        interface DbPostRow {
          id: number;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string | null;
          category: string | null;
          image: string | null;
          status: string | null;
          author: string | null;
          is_breaking?: boolean | null;
          post_type?: string | null;
          created_at: string | Date;
          views: number | string | null;
        }

        const dbPosts = (rows as unknown as DbPostRow[]).map((r) => {
          const { label, timestamp } = formatTimestamp(r.created_at);
          const rawPostType = r.post_type as 'blog' | 'news' | undefined;
          const inferredType: 'blog' | 'news' =
            rawPostType === 'news' || isNewsArticle({ category: r.category, is_breaking: Boolean(r.is_breaking) })
              ? 'news'
              : 'blog';

          return {
            id: r.id,
            slug: r.slug,
            title: r.title,
            date: label,
            timestamp,
            excerpt: r.excerpt || '',
            content: r.content || '',
            category: r.category || 'TECH',
            image: r.image || '/images/hero/hero-bg.jpg',
            status: (r.status as 'draft' | 'pending_review' | 'published') || 'published',
            author: r.author || 'Editorial Team',
            is_breaking: Boolean(r.is_breaking),
            post_type: inferredType,
            views: Number(r.views || 0),
          };
        });

        // Also check if any markdown files exist on disk that are not yet in the DB
        try {
          const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'));
          const existingSlugs = new Set(dbPosts.map((p) => p.slug));
          const missingFiles = files.filter((f) => !existingSlugs.has(f.replace(/\.md$/, '')));

          if (missingFiles.length > 0) {
            const extraPosts = await Promise.all(
              missingFiles.map(async (file) => {
                const slug = file.replace(/\.md$/, '');
                const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8');
                const { data, content } = matter(raw);
                const { label, timestamp } = formatTimestamp(data.date || new Date());
                return {
                  slug,
                  title: String(data.title || slug),
                  date: label,
                  timestamp,
                  excerpt: String(data.excerpt || ''),
                  content,
                  category: String(data.category || 'TECH'),
                  image: String(data.image || '/images/hero/hero-bg.jpg'),
                  status: (data.status as 'draft' | 'published') || 'published',
                  author: String(data.author || 'Editorial Team'),
                  views: 0,
                };
              }),
            );
            const filteredExtra =
              statusFilter === 'all'
                ? extraPosts
                : extraPosts.filter((p) => p.status === statusFilter);
            return [...dbPosts, ...filteredExtra].toSorted((a, b) => b.timestamp - a.timestamp);
          }
        } catch {
          // If reading content directory fails, simply return dbPosts
        }

        return dbPosts;
      }
    } catch (err) {
      console.warn('Neon DB posts query failed, falling back to local files if any:', err);
    }

    // Fallback: Read local markdown files if DB is unreachable or empty
    try {
      const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'));
      const parsedPosts = await Promise.all(
        files.map(async (file) => {
          const slug = file.replace(/\.md$/, '');
          const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8');
          const { data, content } = matter(raw);
          const { label, timestamp } = formatTimestamp(data.date || new Date());
          return {
            slug,
            title: String(data.title || slug),
            date: label,
            timestamp,
            excerpt: String(data.excerpt || ''),
            content,
            category: String(data.category || 'TECH'),
            image: String(data.image || '/images/hero/hero-bg.jpg'),
            status: (data.status as 'draft' | 'published') || 'published',
            author: String(data.author || 'Editorial Team'),
            views: 0,
          };
        }),
      );
      const filtered =
        statusFilter === 'all'
          ? parsedPosts
          : parsedPosts.filter((p) => p.status === statusFilter);
      return filtered.toSorted((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  },
);

/**
 * Fetch latest published blog articles for the Hero banner and blog sections.
 * STRICT: Only returns regular BLOG posts, never news articles.
 */
export const getLatestPosts = cache(async (count: number = 5): Promise<Post[]> => {
  const posts = await getAllPosts('published');
  const blogsOnly = posts.filter((p) => !isNewsArticle(p));
  return blogsOnly.slice(0, count);
});

export const getLatestBlogs = getLatestPosts;

/**
 * Fetch published posts matching a specific category slug (e.g. 'technology', 'science', 'economy').
 */
export const getPostsByCategory = cache(async (categorySlug: string): Promise<Post[]> => {
  const posts = await getAllPosts('published');
  const target = categorySlug.toLowerCase().trim();
  return posts.filter((p) => {
    const cat = (p.category || '').toLowerCase().trim();
    const slugified = cat.replace(/[^a-z0-9]+/g, '-');
    return (
      cat === target ||
      slugified === target ||
      (target === 'technology' && (cat === 'tech' || cat === 'technology')) ||
      (target === 'tech' && (cat === 'tech' || cat === 'technology')) ||
      (target === 'world' && (cat === 'world news' || cat === 'world'))
    );
  });
});

/**
 * Fetch a single post by slug (prioritizing database).
 */
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  try {
    const rows = await sql`
      SELECT 
        p.id,
        p.slug,
        p.title,
        p.excerpt,
        p.content,
        p.category,
        p.image,
        p.status,
        p.author,
        COALESCE(p.is_breaking, false) AS is_breaking,
        COALESCE(p.post_type, 'blog') AS post_type,
        p.created_at,
        COALESCE(v.view_count, p.views, 0) AS views
      FROM posts p
      LEFT JOIN post_views v ON p.slug = v.slug
      WHERE p.slug = ${slug}
      LIMIT 1
    `;

    if (rows && rows.length > 0) {
      const r = rows[0];
      const { label, timestamp } = formatTimestamp(r.created_at);
      const rawPostType = r.post_type as 'blog' | 'news' | undefined;
      const inferredType: 'blog' | 'news' =
        rawPostType === 'news' || isNewsArticle({ category: r.category, is_breaking: Boolean(r.is_breaking) })
          ? 'news'
          : 'blog';

      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        date: label,
        timestamp,
        excerpt: r.excerpt || '',
        content: r.content || '',
        category: r.category || 'TECH',
        image: r.image || '/images/hero/hero-bg.jpg',
        status: (r.status as 'draft' | 'pending_review' | 'published') || 'published',
        author: r.author || 'Editorial Team',
        is_breaking: Boolean(r.is_breaking),
        post_type: inferredType,
        views: Number(r.views || 0),
      };
    }
  } catch (err) {
    console.warn('Neon DB getPostBySlug query failed, checking filesystem:', err);
  }

  // Fallback: check content directory
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.md`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const { label, timestamp } = formatTimestamp(data.date || new Date());
    return {
      slug,
      title: String(data.title || slug),
      date: label,
      timestamp,
      excerpt: String(data.excerpt || ''),
      content,
      category: String(data.category || 'BLOG'),
      image: String(data.image || '/images/hero/hero-bg.jpg'),
      status: (data.status as 'draft' | 'pending_review' | 'published') || 'published',
      author: String(data.author || 'Editorial Team'),
      is_breaking: false,
      post_type: 'blog',
      views: 0,
    };
  } catch {
    return null;
  }
});

/**
 * Fetch dedicated news articles for the Breaking & Recent News homepage section.
 * STRICT: Only returns articles that are genuine news (never blogs).
 * If no news articles exist yet, returns null/empty so the section is completely hidden.
 */
export const getNewsPosts = cache(
  async (): Promise<{ breaking: Post | null; recent: Post[] }> => {
    try {
      const allPublished = await getAllPosts('published');
      if (!allPublished || allPublished.length === 0) {
        return { breaking: null, recent: [] };
      }

      // Filter strictly to published NEWS articles (never regular blogs, never drafts)
      const newsArticles = allPublished.filter((p) => isNewsArticle(p) && p.status === 'published');

      // Until news is created/published, do not return any articles (keeps Breaking & Popular section hidden)
      if (newsArticles.length === 0) {
        return { breaking: null, recent: [] };
      }

      // Priority 1: An article explicitly marked as breaking news
      // Priority 2: The newest published news article
      const breakingItem =
        newsArticles.find((p) => p.is_breaking) || newsArticles[0];

      // Recent news items: other news articles excluding the breaking one (never blogs)
      const recentItems = newsArticles
        .filter((p) => (breakingItem ? p.id !== breakingItem.id && p.slug !== breakingItem.slug : true))
        .slice(0, 4);

      return {
        breaking: breakingItem || null,
        recent: recentItems,
      };
    } catch (err) {
      console.warn('Failed to fetch news posts:', err);
      return { breaking: null, recent: [] };
    }
  },
);

/**
 * News grouped by calendar day for the dedicated News tab
 */
export interface DayGroupedNews {
  dateKey: string;
  formattedDate: string;
  relativeLabel: string;
  isRecentDay: boolean;
  posts: Post[];
}

/**
 * Fetch all published news articles.
 */
export const getAllNewsPosts = cache(async (): Promise<Post[]> => {
  try {
    const allPublished = await getAllPosts('published');
    if (!allPublished || allPublished.length === 0) return [];
    return allPublished.filter((p) => isNewsArticle(p) && p.status === 'published');
  } catch (err) {
    console.warn('Failed to fetch all news posts:', err);
    return [];
  }
});

/**
 * Fetch news articles grouped by calendar day.
 * - The first group is always the most recent day (rendered as Cards View).
 * - All subsequent groups are previous days with day separation (rendered as List View).
 */
export const getDayGroupedNews = cache(async (): Promise<DayGroupedNews[]> => {
  try {
    const news = await getAllNewsPosts();
    if (!news || news.length === 0) return [];

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const groupsMap = new Map<
      string,
      { formattedDate: string; relativeLabel: string; posts: Post[] }
    >();

    for (const post of news) {
      const d = new Date(post.timestamp);
      const isDateValid = !Number.isNaN(d.getTime());
      const dateKey = isDateValid
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        : 'recent-day';

      if (!groupsMap.has(dateKey)) {
        let formattedDate = post.date;
        let relativeLabel = post.date;

        if (isDateValid) {
          formattedDate = d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          if (dateKey === todayKey) {
            relativeLabel = 'Today';
          } else if (dateKey === yesterdayKey) {
            relativeLabel = 'Yesterday';
          } else {
            relativeLabel = d.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          }
        }

        groupsMap.set(dateKey, {
          formattedDate,
          relativeLabel,
          posts: [],
        });
      }

      groupsMap.get(dateKey)!.posts.push(post);
    }

    const result: DayGroupedNews[] = [];
    let isFirst = true;

    for (const [dateKey, group] of groupsMap.entries()) {
      result.push({
        dateKey,
        formattedDate: group.formattedDate,
        relativeLabel: group.relativeLabel,
        isRecentDay: isFirst,
        posts: group.posts,
      });
      isFirst = false;
    }

    return result;
  } catch (err) {
    console.warn('Failed to group news posts by day:', err);
    return [];
  }
});

/**
 * Create a new post in Neon database.
 */
export async function createPost(post: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  image?: string;
  status?: 'draft' | 'pending_review' | 'published';
  author?: string;
  is_breaking?: boolean;
  post_type?: 'blog' | 'news';
}): Promise<Post> {
  const slug =
    post.slug?.trim() ||
    post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    `post-${Date.now()}`;

  const category = (post.category || 'TECH').toUpperCase();
  const status = post.status || 'published';
  const author = post.author?.trim() || 'Editorial Team';
  const image = post.image?.trim() || '/images/hero/hero-bg.jpg';
  const excerpt = post.excerpt?.trim() || '';
  const content = post.content || '';
  const isBreaking = Boolean(post.is_breaking);
  const postType = post.post_type || (isBreaking || category === 'NEWS' || category === 'WORLD NEWS' ? 'news' : 'blog');

  const rows = await sql`
    INSERT INTO posts (slug, title, excerpt, content, category, image, status, author, is_breaking, post_type)
    VALUES (${slug}, ${post.title}, ${excerpt}, ${content}, ${category}, ${image}, ${status}, ${author}, ${isBreaking}, ${postType})
    RETURNING id, slug, title, excerpt, content, category, image, status, author, is_breaking, post_type, created_at
  `;

  const r = rows[0];
  const { label, timestamp } = formatTimestamp(r.created_at);

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    date: label,
    timestamp,
    excerpt: r.excerpt,
    content: r.content,
    category: r.category,
    image: r.image,
    status: r.status,
    author: r.author,
    is_breaking: Boolean(r.is_breaking),
    post_type: (r.post_type as 'blog' | 'news') || 'blog',
    views: 0,
  };
}

/**
 * Update an existing post.
 */
export async function updatePost(
  id: number,
  post: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    image?: string;
    status?: 'draft' | 'pending_review' | 'published';
    author?: string;
    is_breaking?: boolean;
    post_type?: 'blog' | 'news';
  },
): Promise<Post> {
  const isBreakingVal = post.is_breaking !== undefined ? post.is_breaking : null;
  const postTypeVal = post.post_type !== undefined ? post.post_type : null;

  const rows = await sql`
    UPDATE posts
    SET 
      title = COALESCE(${post.title}, title),
      slug = COALESCE(${post.slug}, slug),
      excerpt = COALESCE(${post.excerpt}, excerpt),
      content = COALESCE(${post.content}, content),
      category = COALESCE(${post.category ? post.category.toUpperCase() : null}, category),
      image = COALESCE(${post.image}, image),
      status = COALESCE(${post.status}, status),
      author = COALESCE(${post.author}, author),
      is_breaking = COALESCE(${isBreakingVal}, is_breaking),
      post_type = COALESCE(${postTypeVal}, post_type),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING id, slug, title, excerpt, content, category, image, status, author, is_breaking, post_type, created_at
  `;

  if (!rows || rows.length === 0) {
    throw new Error(`Post with id ${id} not found.`);
  }

  const r = rows[0];
  const { label, timestamp } = formatTimestamp(r.created_at);

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    date: label,
    timestamp,
    excerpt: r.excerpt,
    content: r.content,
    category: r.category,
    image: r.image,
    status: r.status,
    author: r.author,
    is_breaking: Boolean(r.is_breaking),
    post_type: (r.post_type as 'blog' | 'news') || 'blog',
    views: 0,
  };
}

/**
 * Delete a post by id.
 */
export async function deletePost(id: number): Promise<void> {
  await sql`DELETE FROM posts WHERE id = ${id}`;
}
