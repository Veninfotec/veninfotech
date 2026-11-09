import { sql } from '@/lib/db';
import { Post } from '@/lib/posts';
import { isR2Configured, uploadImageFromUrl } from '@/lib/r2';
import { generateNewsImage } from '@/lib/aiImage';

export { generateNewsImage };

export interface RssFeedItem {
  title: string;
  link: string;
  description: string;
  fullTextParagraphs?: string[];
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
  SUPPORTED_FEEDS[4], // NPR Top Stories
  SUPPORTED_FEEDS[5], // The Guardian World
];

/**
 * Decodes HTML entities (named, decimal, and hex) found in RSS XML and article HTML
 */
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&hellip;/g, '...')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isNaN(code) ? '' : String.fromCodePoint(code);
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isNaN(code) ? '' : String.fromCodePoint(code);
    })
    .trim();
}

/**
 * Strips HTML tags and excessive whitespace into a single clean string
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return decodeHtmlEntities(
    html
      .replace(/<(script|style|noscript|svg|figure|figcaption|aside|nav|footer)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Checks whether a paragraph is boilerplate UI noise rather than real journalism
 */
function isBoilerplateParagraph(text: string): boolean {
  const lower = text.toLowerCase();
  if (text.length < 45) return true;

  const noisePatterns = [
    'sign up for',
    'subscribe to our',
    'newsletter',
    'all rights reserved',
    'copyright ©',
    'terms of use',
    'privacy policy',
    'cookie policy',
    'we use cookies',
    'follow us on',
    'download our app',
    'listen to the podcast',
    'click here to',
    'read more:',
    'related articles',
    'related stories',
    'more on this story',
    'share this article',
    'watch the video',
    'getty images',
    'reuters/file photo',
    'associated press file',
    'this article was amended',
    'do you have a story',
    'contact the author',
    'advertisement',
    'sponsored content',
  ];

  return noisePatterns.some((pat) => lower.includes(pat));
}

/**
 * Extracts clean paragraphs from HTML block (preserving <p> tags)
 */
function extractParagraphsFromHtmlBlock(html: string): string[] {
  if (!html) return [];

  // Remove non-content elements first
  const cleanedHtml = html.replace(
    /<(script|style|noscript|svg|figure|figcaption|aside|nav|footer|header|form|button)[\s\S]*?<\/\1>/gi,
    ' '
  );

  const pMatches = cleanedHtml.match(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi) || [];
  const paragraphs: string[] = [];
  const seen = new Set<string>();

  for (const rawP of pMatches) {
    const text = stripHtml(rawP);
    const norm = text.toLowerCase().slice(0, 80);
    if (text && !isBoilerplateParagraph(text) && !seen.has(norm)) {
      seen.add(norm);
      paragraphs.push(text);
    }
  }

  return paragraphs;
}

/**
 * Fetches the actual source article webpage to extract real, verified journalistic paragraphs
 * (~1–2 minute read, 200–450 words) and high-res OpenGraph image.
 * Strictly extracts factual text from the publisher—never invents content.
 */
export async function fetchSourceArticleDetails(url: string): Promise<{
  paragraphs: string[];
  ogImage?: string;
}> {
  if (!url || !url.startsWith('http')) {
    return { paragraphs: [] };
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { paragraphs: [] };
    }

    const html = await res.text();

    // 1. Extract high-res og:image if available
    let ogImage: string | undefined;
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1] && ogMatch[1].startsWith('http')) {
      ogImage = decodeHtmlEntities(ogMatch[1]);
    }

    const collectedParagraphs: string[] = [];
    const seen = new Set<string>();

    const addParagraph = (p: string) => {
      const cleaned = p.replace(/\s+/g, ' ').trim();
      const key = cleaned.toLowerCase().slice(0, 80);
      if (cleaned && !isBoilerplateParagraph(cleaned) && !seen.has(key)) {
        seen.add(key);
        collectedParagraphs.push(cleaned);
      }
    };

    // 2. Check JSON-LD NewsArticle / Article schema for articleBody
    const jsonLdMatches =
      html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const block of jsonLdMatches) {
      const inner = block
        .replace(/^<script[^>]*>/i, '')
        .replace(/<\/script>$/i, '')
        .trim();
      try {
        const parsed = JSON.parse(inner);
        const candidates = Array.isArray(parsed)
          ? parsed
          : parsed?.['@graph'] && Array.isArray(parsed['@graph'])
          ? parsed['@graph']
          : [parsed];

        for (const node of candidates) {
          if (node && typeof node.articleBody === 'string' && node.articleBody.length > 150) {
            const rawBody = decodeHtmlEntities(node.articleBody);
            // Split by double newline or group sentences into readable paragraphs
            const rawChunks = rawBody
              .split(/\n\s*\n|\r\n\s*\r\n/)
              .map((c) => c.trim())
              .filter(Boolean);

            if (rawChunks.length >= 2) {
              for (const chunk of rawChunks) {
                addParagraph(chunk);
              }
            } else {
              const sentences = rawBody
                .split(/(?<=[.!?])\s+(?=[A-Z"“])/)
                .map((s) => s.trim())
                .filter((s) => s.length > 25);
              for (let i = 0; i < sentences.length; i += 3) {
                addParagraph(sentences.slice(i, i + 3).join(' '));
              }
            }
          }
        }
      } catch {
        // Ignore malformed JSON-LD
      }
    }

    // 3. Extract paragraphs from <article> or <main> HTML
    if (collectedParagraphs.length < 4) {
      const articleMatch =
        html.match(/<article(?:\s[^>]*)?>([\s\S]*?)<\/article>/i) ||
        html.match(/<main(?:\s[^>]*)?>([\s\S]*?)<\/main>/i);
      const targetHtml = articleMatch ? articleMatch[1] : html;
      const htmlParas = extractParagraphsFromHtmlBlock(targetHtml);
      for (const p of htmlParas) {
        addParagraph(p);
      }
    }

    return {
      paragraphs: collectedParagraphs.slice(0, 12),
      ogImage,
    };
  } catch {
    return { paragraphs: [] };
  }
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
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8',
        },
        next: { revalidate: 300 },
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
        const linkMatch =
          block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) ||
          block.match(/<guid[^>]*isPermaLink=["']true["'][^>]*>([\s\S]*?)<\/guid>/i);
        const link = (linkMatch ? linkMatch[1] : '').trim();

        // 3. Description & Content:Encoded
        const encodedMatch = block.match(
          /<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i
        );
        const descMatch = block.match(
          /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i
        );

        const rawEncoded = encodedMatch ? encodedMatch[1] : '';
        const rawDesc = descMatch ? descMatch[1] : rawEncoded;

        const encodedParagraphs = extractParagraphsFromHtmlBlock(rawEncoded || rawDesc);
        const description = stripHtml(rawDesc || rawEncoded);

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
        const mediaMatch = block.match(
          /<(?:media:thumbnail|media:content|enclosure)[\s\S]*?url=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i
        );
        if (mediaMatch && mediaMatch[1]) {
          imageUrl = mediaMatch[1];
        } else {
          const anyMedia = block.match(/<media:(?:thumbnail|content)[^>]*url=["']([^"']+)["']/i);
          if (anyMedia && anyMedia[1]) {
            imageUrl = anyMedia[1];
          } else {
            const imgMatch = (rawEncoded || rawDesc).match(
              /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i
            );
            if (imgMatch && imgMatch[1]) {
              imageUrl = imgMatch[1];
            }
          }
        }

        // Upgrade BBC thumbnails from standard low-res (240) to crystal-clear high-res (1024)
        if (imageUrl && imageUrl.includes('ichef.bbci.co.uk/ace/standard/')) {
          imageUrl = imageUrl.replace(/\/standard\/\d+\//, '/standard/1024/');
        }

        if (title && (description || encodedParagraphs.length > 0)) {
          collected.push({
            title,
            link,
            description: description || encodedParagraphs.join(' '),
            fullTextParagraphs: encodedParagraphs.length > 0 ? encodedParagraphs : undefined,
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
 * Builds a 100% factual, authentic 1–2 minute news report strictly from the verified RSS feed
 * and the extracted source article paragraphs.
 * ZERO AI-invented filler, ZERO fake quotes, ZERO repetitive boilerplate!
 */
export function synthesizeNaturalNewsArticle(
  item: RssFeedItem,
  extractedParagraphs: string[] = []
): {
  title: string;
  excerpt: string;
  category: string;
  content: string;
} {
  const cleanTitle = item.title.trim();
  const rawDesc = (item.description || '').trim();

  // Merge RSS paragraphs + scraped article paragraphs without duplicates
  const allParagraphs: string[] = [];
  const seenKeys = new Set<string>();

  const pushUnique = (text: string) => {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned || cleaned.length < 30) return;
    const normKey = cleaned.toLowerCase().slice(0, 75);
    // Avoid duplicating paragraphs that share the exact same opening
    for (const existing of seenKeys) {
      if (existing.includes(normKey.slice(0, 45)) || normKey.includes(existing.slice(0, 45))) {
        return;
      }
    }
    seenKeys.add(normKey);
    allParagraphs.push(cleaned);
  };

  // First include the verified RSS summary if it isn't already repeated verbatim
  if (rawDesc && rawDesc.toLowerCase() !== cleanTitle.toLowerCase()) {
    const descSentences = rawDesc
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);
    if (descSentences.length > 0) {
      pushUnique(descSentences.slice(0, 3).join(' '));
      if (descSentences.length > 3) {
        pushUnique(descSentences.slice(3).join(' '));
      }
    }
  }

  // Next include paragraphs from <content:encoded> if present
  if (item.fullTextParagraphs && item.fullTextParagraphs.length > 0) {
    for (const p of item.fullTextParagraphs) {
      pushUnique(p);
    }
  }

  // Next include the real paragraphs extracted directly from the publisher's article URL
  for (const p of extractedParagraphs) {
    pushUnique(p);
  }

  // Select ~1 to 2 minutes of reading material (up to ~380-450 words, or 6-9 real paragraphs)
  const selectedParagraphs: string[] = [];
  let totalWords = 0;

  for (const p of allParagraphs) {
    const words = p.split(/\s+/).length;
    selectedParagraphs.push(p);
    totalWords += words;
    if (totalWords >= 380 && selectedParagraphs.length >= 5) {
      break;
    }
    if (selectedParagraphs.length >= 9) {
      break;
    }
  }

  // Build concise 2-sentence excerpt from the true opening paragraph
  const firstPara = selectedParagraphs[0] || rawDesc || cleanTitle;
  const excerptSentences = firstPara
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const rawExcerpt =
    excerptSentences.length >= 2
      ? `${excerptSentences[0]} ${excerptSentences[1]}`
      : firstPara;
  const excerpt = rawExcerpt.length > 220 ? `${rawExcerpt.slice(0, 217)}...` : rawExcerpt;

  // Format paragraphs cleanly with a natural subheading break if there are multiple paragraphs
  const contentBlocks: string[] = [];
  if (selectedParagraphs.length === 0) {
    contentBlocks.push(rawDesc || cleanTitle);
  } else if (selectedParagraphs.length <= 3) {
    contentBlocks.push(selectedParagraphs.join('\n\n'));
  } else {
    // Opening lead paragraphs (first 2 paragraphs)
    contentBlocks.push(selectedParagraphs.slice(0, 2).join('\n\n'));
    contentBlocks.push('## Key Details & Developments');
    contentBlocks.push(selectedParagraphs.slice(2).join('\n\n'));
  }

  // Add transparent factual source attribution at the bottom if source link is available
  if (item.source && item.link) {
    contentBlocks.push(`---\n*Source: Verified reporting from [${item.source}](${item.link}).*`);
  } else if (item.source) {
    contentBlocks.push(`---\n*Source: ${item.source}.*`);
  }

  return {
    title: cleanTitle,
    excerpt,
    category: item.category || 'NEWS',
    content: contentBlocks.join('\n\n'),
  };
}

/**
 * Processes an RSS item into a detailed, 100% factual 1–2 minute news report (~220–420 words).
 * 1. Fetches the full source article webpage to extract the real journalistic paragraphs and press photo.
 * 2. Structures only the verified facts from the source—never adds fake AI filler or invented details.
 */
export async function processWithAi(
  item: RssFeedItem,
  customApiKey?: string,
): Promise<GeneratedArticle> {
  const defaultSlug = `${slugify(item.title).slice(0, 60)}-${Date.now().toString().slice(-4)}`;

  // 1. Fetch real full-text paragraphs and og:image from the source article URL
  const { paragraphs: scrapedParagraphs, ogImage } = await fetchSourceArticleDetails(item.link);

  // 2. Build the authentic factual news report directly from verified source paragraphs
  const factualArticle = synthesizeNaturalNewsArticle(item, scrapedParagraphs);

  let articleTitle = factualArticle.title;
  let articleExcerpt = factualArticle.excerpt;
  let articleCategory = factualArticle.category;
  let articleContent = factualArticle.content;

  // 3. Optional: If an explicit Gemini API key is configured AND we have substantial source text,
  // allow strictly factual journalistic copy-editing (Temperature 0.1, zero invention).
  const apiKey =
    customApiKey?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  const combinedSourceText = [item.description, ...scrapedParagraphs].filter(Boolean).join('\n\n');

  if (apiKey && combinedSourceText.split(/\s+/).length >= 120) {
    try {
      const prompt = `
You are a factual news wire editor. Below is the verified source reporting for a news story.

Headline: "${item.title}"
Source: ${item.source}
Verified Source Text:
"""
${combinedSourceText.slice(0, 5000)}
"""

STRICT FACTUAL RULES (CRITICAL):
1. Write a clear, engaging 1 to 2 minute news report (220 to 400 words, 4 to 7 paragraphs) using ONLY the facts, numbers, names, and quotes present in the Verified Source Text above.
2. DO NOT add, invent, extrapolate, or speculate on anything not explicitly stated in the Verified Source Text.
3. DO NOT add generic filler sentences like "Officials continue to monitor the situation" or "This reflects ongoing global developments". Every sentence must contain specific factual details from the source.
4. Keep the headline accurate to the original story.
5. Provide a 2-sentence factual summary as the excerpt (140–210 characters).
6. Choose the best category from: ["WORLD", "POLITICS", "ECONOMY", "SCIENCE", "TECHNOLOGY", "CULTURE", "SPORTS", "NEWS"].
7. Return ONLY valid JSON with no markdown backticks:
{
  "title": "Factual headline",
  "excerpt": "Two-sentence factual summary...",
  "category": "WORLD",
  "content": "Multi-paragraph factual news report in markdown..."
}
`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
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
        if (parsed.title && parsed.content && parsed.content.split(/\s+/).length >= 100) {
          articleTitle = parsed.title.trim();
          articleExcerpt = parsed.excerpt?.trim() || factualArticle.excerpt;
          articleCategory = parsed.category?.toUpperCase() || factualArticle.category;
          const attribution =
            item.source && item.link
              ? `\n\n---\n*Source: Verified reporting from [${item.source}](${item.link}).*`
              : '';
          articleContent = `${parsed.content.trim()}${attribution}`;
        }
      }
    } catch (err) {
      console.warn('Gemini factual copy-edit skipped, using direct source paragraphs:', err);
    }
  }

  // 4. Attach real press photo (RSS media -> article og:image -> category fallback)
  let articleImage: string | undefined = item.image || ogImage;

  if (!articleImage || articleImage.includes('hero-bg.jpg')) {
    articleImage = await generateNewsImage(articleTitle, articleCategory, defaultSlug);
  } else if (isR2Configured() && articleImage.startsWith('http')) {
    try {
      articleImage = await uploadImageFromUrl(articleImage, `${defaultSlug}.jpg`);
    } catch {
      // Keep original press photo URL if R2 upload fails
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
 * Curates trending news from RSS feeds, extracts full factual 1–2 minute reports from the source articles,
 * and inserts drafts into Neon Postgres.
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

  // 2. Query existing slugs and content to prevent duplicates (and upgrade old short/boilerplate stories)
  const existingRows = await sql`
    SELECT id, slug, title, content, status, is_breaking, created_at FROM posts
  `;
  const existingBySlug = new Map<string, any>();
  const existingByTitle = new Map<string, any>();
  for (const r of existingRows || []) {
    existingBySlug.set(r.slug, r);
    if (r.title) existingByTitle.set(r.title.toLowerCase().trim(), r);
  }

  const createdPosts: Post[] = [];
  let skippedCount = 0;

  for (const item of rawItems) {
    if (createdPosts.length >= limit) break;

    const testSlug = slugify(item.title).slice(0, 60);
    const matchedRow =
      existingBySlug.get(testSlug) || existingByTitle.get(item.title.toLowerCase().trim());

    if (matchedRow) {
      const existingContent = String(matchedRow.content || '');
      const hasOldBoilerplate =
        existingContent.includes('Officials and independent analysts continue to follow') ||
        existingContent.includes('the situation reflects ongoing developments');
      const isTooShort = existingContent.split(/\s+/).length < 90;

      if (hasOldBoilerplate || isTooShort) {
        try {
          const upgraded = await processWithAi(item, apiKey);
          const cleanAuthor = item.source
            ? item.source.replace(/\s*\(.*?\)\s*/g, '').trim()
            : 'News Desk';
          await sql`
            UPDATE posts
            SET
              excerpt = ${upgraded.excerpt},
              content = ${upgraded.content},
              author = ${cleanAuthor},
              updated_at = NOW()
            WHERE id = ${matchedRow.id}
          `;
        } catch (upErr) {
          console.warn('Could not auto-upgrade existing short news post:', upErr);
        }
      }
      skippedCount++;
      continue;
    }

    // 3. Extract Full Factual Article & Press Image
    const article = await processWithAi(item, apiKey);

    // Ensure unique slug
    let finalSlug = article.slug;
    if (existingBySlug.has(finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const cleanAuthor = item.source ? item.source.replace(/\s*\(.*?\)\s*/g, '').trim() : 'News Desk';

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
          ${cleanAuthor},
          FALSE,
          'news'
        )
        RETURNING id, slug, title, excerpt, content, category, image, status, author, is_breaking, post_type, created_at
      `;

      if (inserted && inserted.length > 0) {
        const r = inserted[0];
        existingBySlug.set(finalSlug, r);
        existingByTitle.set(article.title.toLowerCase().trim(), r);

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
      console.error('Failed to insert news draft into Neon DB:', insertErr);
    }
  }

  return {
    created: createdPosts,
    skippedCount,
    totalFetched: rawItems.length,
  };
}
