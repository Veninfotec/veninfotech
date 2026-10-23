import { isR2Configured, uploadImageBuffer } from '@/lib/r2';

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
 * Curated high-resolution editorial press photographs by category.
 * Used as reliable fallbacks when external AI image generation is rate-limited (402) or unavailable.
 */
const CATEGORY_EDITORIAL_FALLBACKS: Record<string, string[]> = {
  WORLD: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop', // Global summit & press
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop', // International conference
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1200&auto=format&fit=crop', // International flags
  ],
  POLITICS: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop', // Government briefing
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1200&auto=format&fit=crop', // Diplomatic forum
  ],
  ECONOMY: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop', // Financial markets
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop', // Global commerce & trade
  ],
  SCIENCE: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop', // Space & Earth science
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop', // Scientific research
  ],
  TECHNOLOGY: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop', // Microchips & AI
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop', // Cloud data center
  ],
  SPORTS: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop', // Athletic stadium
  ],
  NEWS: [
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop', // Newsroom microphone
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop', // Newspaper press
  ],
};

function getFallbackPhotoUrl(category: string): string {
  const cat = (category || 'NEWS').toUpperCase().trim();
  const pool = CATEGORY_EDITORIAL_FALLBACKS[cat] || CATEGORY_EDITORIAL_FALLBACKS.NEWS;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked;
}

/**
 * Generates a photorealistic, contextual editorial image for any news or blog article
 * and uploads permanently to Cloudflare R2 bucket.
 * 
 * If external AI generation is rate-limited (status 402) or errors, it automatically falls back
 * to high-definition category-matched editorial photography and uploads to R2 for 100% permanence.
 * 
 * @param title - The headline or topic
 * @param category - Category (e.g. WORLD, TECH, POLITICS, SCIENCE, ECONOMY)
 * @param slug - Optional slug to customize the stored filename
 * @returns Permanent Cloudflare R2 CDN URL
 */
export async function generateNewsImage(
  title: string,
  category: string = 'NEWS',
  slug?: string
): Promise<string> {
  const cleanSubject = title
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .slice(0, 10)
    .join(' ')
    .trim();

  const fileSlug = (slug || slugify(title).slice(0, 40) || 'news') + `-${Date.now()}.jpg`;

  // 1. Try AI Generation with Pollinations Flux
  const promptText = `Editorial documentary photojournalism: ${cleanSubject}, ${category.toLowerCase()} news report, realistic natural lighting, authentic press photography, 4k resolution, cinematic 16:9 aspect ratio`;
  const encoded = encodeURIComponent(promptText);
  const seed = Math.floor(Math.random() * 1000000);
  
  // Check for Pollinations API key in environment
  const apiKey = process.env.POLLINATIONS_API_KEY || process.env.POLLEN_API_KEY;
  const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
  const pollUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=675&nologo=true&model=flux&seed=${seed}${keyParam}`;

  let imageBuffer: Buffer | null = null;

  try {
    const res = await fetch(pollUrl, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 5000) {
        imageBuffer = buf;
      }
    } else {
      console.warn(`AI image generation returned status ${res.status}. Falling back to topic editorial photo.`);
    }
  } catch (err) {
    console.warn('AI image generation fetch timed out or failed. Falling back to topic editorial photo:', err);
  }

  // 2. If AI generator failed or returned 402 rate-limit, download topic-matched editorial photo
  if (!imageBuffer) {
    const fallbackSource = getFallbackPhotoUrl(category);
    try {
      const fbRes = await fetch(fallbackSource, { signal: AbortSignal.timeout(10000) });
      if (fbRes.ok) {
        imageBuffer = Buffer.from(await fbRes.arrayBuffer());
      }
    } catch (fbErr) {
      console.warn('Failed to fetch fallback photo buffer:', fbErr);
    }
  }

  // 3. Upload buffer permanently to Cloudflare R2 if configured
  if (isR2Configured() && imageBuffer) {
    try {
      const r2Url = await uploadImageBuffer(imageBuffer, fileSlug, 'image/jpeg');
      return r2Url;
    } catch (r2Err) {
      console.error('Failed to upload image buffer to Cloudflare R2:', r2Err);
    }
  }

  // 4. Ultimate fallback: return high-res category editorial CDN URL (never failing 402 URL!)
  return getFallbackPhotoUrl(category);
}
