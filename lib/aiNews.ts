import { sql } from '@/lib/db';
import { Post } from '@/lib/posts';
import { isR2Configured, uploadImageBuffer, uploadImageFromUrl } from '@/lib/r2';

export interface RssFeedItem {
  title: string;
  link: string;
  description: string;
  category: string;
  pubDate: string;
  image?: string;
  source: string;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  category: string;
  content: string;
  slug: string;
  image: string;
  source: string;
  sourceUrl: string;
}

export interface FeedSource {
  name: string;
  category: string;
  url: string;
}

export const SUPPORTED_FEEDS: FeedSource[] = [
  // World & Global News
  { name: 'BBC News (World)', category: 'WORLD', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'BBC News (Top Stories)', category: 'NEWS', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'Google News (World News)', category: 'WORLD', url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en' },
  { name: 'Google News (Top Stories)', category: 'NEWS', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en' },
  { name: 'NPR News (Top Stories)', category: 'NEWS', url: 'https://feeds.npr.org/1001/rss.xml' },
  { name: 'The Guardian (World)', category: 'WORLD', url: 'https://www.theguardian.com/world/rss' },
  { name: 'Al Jazeera (Global)', category: 'WORLD', url: 'https://www.aljazeera.com/xml/rss/all.xml' },

  // Business & Economy
  { name: 'CNBC (International Business)', category: 'ECONOMY', url: 'https://www.cnbc.com/id/100727362/device/rss/rss.html' },
  { name: 'Google News (Business)', category: 'ECONOMY', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en' },

  // Science & Environment
  { name: 'Science Daily (Latest Science)', category: 'SCIENCE', url: 'https://www.sciencedaily.com/rss/top/science.xml' },
  { name: 'Google News (Science)', category: 'SCIENCE', url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en' },

  // Technology
  { name: 'TechCrunch (Tech & Startups)', category: 'TECHNOLOGY', url: 'https://techcrunch.com/feed/' },
  { name: 'Ars Technica (Tech & Policy)', category: 'TECHNOLOGY', url: 'https://feeds.arstechnica.com/arstechnica/index' },
];

export const DEFAULT_FEEDS = [
  SUPPORTED_FEEDS[0], // BBC World
  SUPPORTED_FEEDS[1], // BBC Top Stories
  SUPPORTED_FEEDS[2], // Google News World
];

/**
 * Decodes common HTML entities found in RSS XML text
 */
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .trim();
}

/**
 * Strips HTML tags and excessive whitespace
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

/**
 * Generates a clean URL slug from title
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

import { generateNewsImage } from '@/lib/aiImage';
export { generateNewsImage };

/**
 * Fetches and parses RSS feeds into structured RssFeedItems.
 * Supports world, politics, economy, science, and tech news wire feeds.
 */
export async function fetchRssFeedItems(feedUrl?: string, maxItems: number = 8): Promise<RssFeedItem[]> {
  const feedsToTry = feedUrl
    ? [{ name: 'Custom Feed', category: 'NEWS', url: feedUrl }]
    : DEFAULT_FEEDS;

  const collected: RssFeedItem[] = [];

  for (const feed of feedsToTry) {
    try {
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8',
        },
        next: { revalidate: 300 }, // Cache up to 5 min
      });

      if (!res.ok) {
        console.warn(`Failed to fetch RSS from ${feed.name}: HTTP ${res.status}`);
        continue;
      }

      const xml = await res.text();
      const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

      for (const block of itemBlocks.slice(0, maxItems)) {
        // 1. Title
        const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
        const title = decodeHtmlEntities(titleMatch ? titleMatch[1] : '').trim();

        // 2. Link
        const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
        const link = (linkMatch ? linkMatch[1] : '').trim();

        // 3. Description
        const descMatch =
          block.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i) ||
          block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
        const rawDesc = descMatch ? descMatch[1] : '';
        const description = stripHtml(rawDesc);

        // 4. Category detection
        const catMatch = block.match(/<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/i);
        const rawCat = catMatch ? decodeHtmlEntities(catMatch[1]).toUpperCase() : '';
        
        let detectedCategory = feed.category || 'NEWS';
        if (rawCat.includes('WORLD') || rawCat.includes('INTERNATIONAL') || rawCat.includes('GLOBAL')) {
          detectedCategory = 'WORLD';
        } else if (rawCat.includes('POLITIC') || rawCat.includes('GOV')) {
          detectedCategory = 'POLITICS';
        } else if (rawCat.includes('BUSINESS') || rawCat.includes('ECONOM') || rawCat.includes('MARKET')) {
          detectedCategory = 'ECONOMY';
        } else if (rawCat.includes('SCIENCE') || rawCat.includes('SPACE') || rawCat.includes('CLIMATE')) {
          detectedCategory = 'SCIENCE';
        } else if (rawCat.includes('TECH') || rawCat.includes('SOFTWARE') || rawCat.includes('AI')) {
          detectedCategory = 'TECHNOLOGY';
        }

        // 5. PubDate
        const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toUTCString();

        // 6. Thumbnail Image
        let imageUrl: string | undefined;
        const mediaMatch = block.match(/<(?:media:thumbnail|media:content|enclosure)[\s\S]*?url=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
        if (mediaMatch && mediaMatch[1]) {
          imageUrl = mediaMatch[1];
        } else {
          const anyMedia = block.match(/<media:(?:thumbnail|content)[^>]*url=["']([^"']+)["']/i);
          if (anyMedia && anyMedia[1]) {
            imageUrl = anyMedia[1];
          } else {
            const imgMatch = rawDesc.match(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
            if (imgMatch && imgMatch[1]) {
              imageUrl = imgMatch[1];
            }
          }
        }

        // Upgrade BBC thumbnails from standard low-res (240) to crystal-clear high-res (1024)
        if (imageUrl && imageUrl.includes('ichef.bbci.co.uk/ace/standard/')) {
          imageUrl = imageUrl.replace(/\/standard\/\d+\//, '/standard/1024/');
        }

        if (title && description) {
          collected.push({
            title,
            link,
            description,
            category: detectedCategory,
            pubDate,
            image: imageUrl,
            source: feed.name,
          });
        }
      }

      if (collected.length >= maxItems) break;
    } catch (err) {
      console.error(`Error parsing RSS feed ${feed.name}:`, err);
    }
  }

  return collected.slice(0, maxItems);
}

/**
 * Intelligent, natural editorial synthesizer when Gemini is not available.
 * Tailors a clean, authentic news report based on the actual story details.
 * Absolutely ZERO repetitive boilerplate or canned tables!
 */
export function synthesizeNaturalNewsArticle(item: RssFeedItem): {
  title: string;
  excerpt: string;
  category: string;
  content: string;
} {
  const cleanTitle = item.title;
  const rawDesc = item.description || '';
  
  // Extract sentences from description
  const sentences = rawDesc
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const excerpt =
    sentences.length > 0
      ? sentences.slice(0, 2).join(' ')
      : `${cleanTitle}. Reporting on verified developments from the ground.`;

  const leadParagraph = sentences.length > 0
    ? sentences.slice(0, 2).join(' ')
    : `${cleanTitle}. Verified reports confirm significant developments as events unfold across the region.`;

  const detailsParagraph = sentences.length > 2
    ? sentences.slice(2).join(' ')
    : `According to reporting from ${item.source || 'wire dispatches'}, the situation reflects ongoing developments that are drawing international attention from observers and regional stakeholders.`;

  const outlookParagraph = `Officials and independent analysts continue to follow the situation closely as further details emerge. Subsequent updates are expected as local and international observers assess the broader impact.`;

  const content = [
    leadParagraph,
    '',
    `## Key Facts & Context`,
    '',
    detailsParagraph,
    '',
    `## Looking Ahead`,
    '',
    outlookParagraph,
  ].join('\n');

  return {
    title: cleanTitle,
    excerpt: excerpt.length > 180 ? `${excerpt.slice(0, 177)}...` : excerpt,
    category: item.category || 'NEWS',
    content,
  };
}

/**
 * Transforms an RSS item into an engaging, natural news article using Google Gemini API or natural synthesis.
 * Supports world, politics, science, economy, technology, and general international news.
 * Automatically generates and attaches a unique, relevant AI image uploaded to Cloudflare R2.
 */
export async function processWithAi(
  item: RssFeedItem,
  customApiKey?: string,
): Promise<GeneratedArticle> {
  const apiKey =
    customApiKey?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  const defaultSlug = `${slugify(item.title).slice(0, 60)}-${Date.now().toString().slice(-4)}`;

  let articleTitle = item.title;
  let articleExcerpt = item.description.slice(0, 160);
  let articleCategory = item.category || 'NEWS';
  let articleContent = '';

  if (apiKey) {
    try {
      const prompt = `
You are a senior international news journalist and chief editor for Veninfotech, an authoritative global publication reporting on world events, politics, economy, science, culture, and technology.

Transform the following raw news wire into an engaging, accurate, objective, and well-written news report (~300-450 words).

Headline: "${item.title}"
Source: ${item.source}
Details: "${item.description}"

STRICT EDITORIAL REQUIREMENTS:
1. Title: An informative, professional news headline (accurate, engaging, no clickbait).
2. Excerpt: A concise 2-sentence executive summary.
3. Category: Choose the single best category from: ["WORLD", "POLITICS", "ECONOMY", "SCIENCE", "TECHNOLOGY", "CULTURE", "SPORTS", "NEWS"].
4. Content: Authentic journalistic news coverage:
   - Lead Paragraph: State clearly what happened, who is involved, where, and when.
   - Body Paragraphs: Verified facts, statements, reactions, context, and chronological developments.
   - Conclusion: Significance and what happens next.
   - Tone: Objective, factual, and natural news writing.
   - Formatting: Natural markdown paragraphs. If helpful, use dynamic context-specific subheadings (e.g. "## Key Developments", "## Global Reactions", "## What to Expect Next").
   - NEVER use generic boilerplate titles like "Architectural & Strategic Breakdown" or "Technical Dimensions & Impact Matrix".
   - NEVER insert fake or forced comparison tables. Only include a table if the news story naturally contains numerical/statistical data.
   - ZERO citation markers (no "[1]", "[source]", "(Reuters)").
5. Return ONLY valid JSON with no markdown backticks:
{
  "title": "Editorial headline",
  "excerpt": "Executive summary...",
  "category": "WORLD",
  "content": "Full markdown news story..."
}
`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        },
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanJsonStr = rawText
          .replace(/^```(?:json)?/i, '')
          .replace(/```$/i, '')
          .trim();

        const parsed = JSON.parse(cleanJsonStr);
        if (parsed.title && parsed.content) {
          articleTitle = parsed.title.trim();
          articleExcerpt = parsed.excerpt?.trim() || item.description.slice(0, 160);
          articleCategory = parsed.category?.toUpperCase() || item.category || 'NEWS';
          articleContent = parsed.content.trim();
        }
      } else {
        const errText = await geminiRes.text();
        console.warn('Gemini API call failed, falling back to natural synthesis:', errText);
      }
    } catch (err) {
      console.warn('Gemini AI news generation exception, falling back to natural synthesis:', err);
    }
  }

  // If Gemini was not used or did not produce content, use the natural news synthesizer
  if (!articleContent) {
    const synthesized = synthesizeNaturalNewsArticle(item);
    articleTitle = synthesized.title;
    articleExcerpt = synthesized.excerpt;
    articleCategory = synthesized.category;
    articleContent = synthesized.content;
  }

  // Generate a unique, contextually relevant image for this article
  let articleImage: string | undefined = item.image;

  // If item.image is missing, default, or invalid, generate an AI image
  if (!articleImage || articleImage.includes('hero-bg.jpg')) {
    articleImage = await generateNewsImage(articleTitle, articleCategory, defaultSlug);
  } else if (isR2Configured() && articleImage.startsWith('http')) {
    // If wire provided an image, upload to R2 for permanence
    try {
      articleImage = await uploadImageFromUrl(articleImage, `${defaultSlug}.jpg`);
    } catch {
      // If wire image fetch fails, generate a fresh AI image
      articleImage = await generateNewsImage(articleTitle, articleCategory, defaultSlug);
    }
  }

  return {
    title: articleTitle,
    excerpt: articleExcerpt,
    category: articleCategory,
    content: articleContent,
    slug: slugify(articleTitle).slice(0, 80) || defaultSlug,
    image: articleImage || '/images/hero/hero-bg.jpg',
    source: item.source,
    sourceUrl: item.link,
  };
}

/**
 * Curates trending news from RSS feeds, runs AI transformation, and inserts drafts into Neon Postgres.
 */
export async function curateTrendingNewsDrafts({
  feedUrl,
  limit = 5,
  apiKey,
}: {
  feedUrl?: string;
  limit?: number;
  apiKey?: string;
} = {}): Promise<{
  created: Post[];
  skippedCount: number;
  totalFetched: number;
}> {
  // 1. Fetch raw items from RSS
  const rawItems = await fetchRssFeedItems(feedUrl, limit * 2);
  if (!rawItems || rawItems.length === 0) {
    return { created: [], skippedCount: 0, totalFetched: 0 };
  }

  // 2. Query existing slugs to prevent duplicate ingestion
  const existingRows = await sql`
    SELECT slug, title FROM posts
  `;
  const existingSlugs = new Set((existingRows || []).map((r: any) => r.slug));
  const existingTitles = new Set((existingRows || []).map((r: any) => r.title.toLowerCase().trim()));

  const createdPosts: Post[] = [];
  let skippedCount = 0;

  for (const item of rawItems) {
    if (createdPosts.length >= limit) break;

    const testSlug = slugify(item.title).slice(0, 60);
    if (existingSlugs.has(testSlug) || existingTitles.has(item.title.toLowerCase().trim())) {
      skippedCount++;
      continue;
    }

    // 3. AI Transformation & Dynamic Image Generation
    const article = await processWithAi(item, apiKey);

    // Ensure unique slug
    let finalSlug = article.slug;
    if (existingSlugs.has(finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // 4. Insert into Neon Postgres with status = 'draft' and post_type = 'news'
    try {
      const inserted = await sql`
        INSERT INTO posts (
          slug,
          title,
          excerpt,
          content,
          category,
          image,
          status,
          author,
          is_breaking,
          post_type
        )
        VALUES (
          ${finalSlug},
          ${article.title},
          ${article.excerpt},
          ${article.content},
          ${article.category},
          ${article.image},
          'draft',
          ${'VIT AI Editorial'},
          FALSE,
          'news'
        )
        RETURNING id, slug, title, excerpt, content, category, image, status, author, is_breaking, post_type, created_at
      `;

      if (inserted && inserted.length > 0) {
        const r = inserted[0];
        existingSlugs.add(finalSlug);
        existingTitles.add(article.title.toLowerCase().trim());

        createdPosts.push({
          id: r.id,
          slug: r.slug,
          title: r.title,
          date: new Date(r.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          timestamp: new Date(r.created_at).getTime(),
          excerpt: r.excerpt,
          content: r.content,
          category: r.category,
          image: r.image,
          status: 'draft',
          author: r.author,
          is_breaking: Boolean(r.is_breaking),
          post_type: 'news',
          views: 0,
        });
      }
    } catch (insertErr) {
      console.error('Failed to insert AI draft into Neon DB:', insertErr);
    }
  }

  return {
    created: createdPosts,
    skippedCount,
    totalFetched: rawItems.length,
  };
}
