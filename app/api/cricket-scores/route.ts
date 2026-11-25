import { NextResponse } from 'next/server';

const CRICINFO_RSS_URL = 'https://static.cricinfo.com/rss/livescores.xml';

export interface CricketTeamScore {
  name: string;
  score: string | null;
  isBatting: boolean;
}

export interface CricketMatchItem {
  id: string;
  title: string;
  teamA: CricketTeamScore;
  teamB: CricketTeamScore;
  status: 'LIVE' | 'UPCOMING';
  isInternational: boolean;
  url: string;
}

const INTERNATIONAL_TEAMS = new Set([
  'india',
  'sri lanka',
  'australia',
  'england',
  'new zealand',
  'pakistan',
  'south africa',
  'west indies',
  'bangladesh',
  'afghanistan',
  'zimbabwe',
  'ireland',
  'netherlands',
  'scotland',
  'hong kong',
  'nepal',
  'uae',
  'united arab emirates',
  'usa',
  'u.s.a.',
  'united states',
  'united states of america',
  'namibia',
  'oman',
  'canada',
  'papua new guinea',
  'png',
  'uganda',
  'kenya',
  'jersey',
  'italy',
  'bermuda',
]);

function decodeXmlEntities(value: string): string {
  if (!value) return '';
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number.parseInt(dec, 10);
      return Number.isNaN(code) ? '' : String.fromCodePoint(code);
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function extractXmlTag(block: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = block.match(regex);
  return match ? decodeXmlEntities(match[1]) : '';
}

function normalizeTeamBaseName(teamName: string): string {
  let normalized = teamName.toLowerCase().trim();
  // Strip national squad suffixes while keeping domestic city/club identifiers intact
  // (e.g. "India A" -> "india", "Ireland Women" -> "ireland", while "Hyderabad (India)" stays unchanged).
  const suffixPattern =
    /\s+(?:women|men|a|b|xi|lions|emerging|u-?19s?|under-?19s?|u-?23s?|under-?23s?)$/i;
  while (suffixPattern.test(normalized)) {
    normalized = normalized.replace(suffixPattern, '').trim();
  }
  return normalized;
}

function isInternationalSide(teamName: string): boolean {
  if (!teamName) return false;
  const normalized = normalizeTeamBaseName(teamName);
  return INTERNATIONAL_TEAMS.has(normalized);
}

function parseTeamSide(rawSide: string): CricketTeamScore {
  const isBatting = /\*/.test(rawSide);
  const cleaned = rawSide.replace(/\*/g, '').replace(/\s+/g, ' ').trim();

  // Match trailing score patterns like "368/10", "486/4", "309/10 & 109/2", "312/8d", or "240"
  const scoreMatch = cleaned.match(
    /^(.*?)\s+(\d+(?:\/\d+[a-z]*)?(?:\s*&\s*\d+(?:\/\d+[a-z]*)?)*)$/i
  );

  if (scoreMatch && scoreMatch[1].trim().length > 0) {
    return {
      name: scoreMatch[1].trim(),
      score: scoreMatch[2].replace(/\s*&\s*/g, ' & ').trim(),
      isBatting,
    };
  }

  return {
    name: cleaned,
    score: null,
    isBatting,
  };
}

function cleanScorecardUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return 'https://www.espncricinfo.com/live-cricket-score';

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }
    if (parsed.searchParams.get('CMP') === 'OTC-RSS') {
      parsed.searchParams.delete('CMP');
    }
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

function parseCricketMatchItem(block: string, index: number): CricketMatchItem | null {
  const title = extractXmlTag(block, 'title');
  if (!title) return null;

  const link = extractXmlTag(block, 'link');
  const guid = extractXmlTag(block, 'guid');

  const sides = title.split(/\s+v(?:s\.?)?\s+/i);
  const teamA = parseTeamSide(sides[0] ?? title);
  const teamB = parseTeamSide(sides.slice(1).join(' v ') || 'TBA');

  const hasLiveScore = Boolean(
    teamA.score || teamB.score || teamA.isBatting || teamB.isBatting
  );

  const status: 'LIVE' | 'UPCOMING' = hasLiveScore ? 'LIVE' : 'UPCOMING';
  const isInternational =
    isInternationalSide(teamA.name) || isInternationalSide(teamB.name);

  return {
    id: guid || link || `match-${index}`,
    title,
    teamA,
    teamB,
    status,
    isInternational,
    url: cleanScorecardUrl(link || guid),
  };
}

function parseCricinfoRss(xml: string): {
  updatedAt: string;
  matches: CricketMatchItem[];
} {
  const channelBlock = xml.split(/<item[\s>]/i)[0] ?? xml;
  const rawPubDate = extractXmlTag(channelBlock, 'pubDate');
  const parsedDate = rawPubDate ? new Date(rawPubDate) : new Date();
  const updatedAt = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString()
    : parsedDate.toISOString();

  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  const matches: CricketMatchItem[] = [];

  for (let i = 0; i < itemBlocks.length; i += 1) {
    const parsed = parseCricketMatchItem(itemBlocks[i], i);
    if (parsed) {
      matches.push(parsed);
    }
  }

  // Sort: International first, then LIVE before UPCOMING
  matches.sort((a, b) => {
    if (a.isInternational !== b.isInternational) {
      return a.isInternational ? -1 : 1;
    }
    if (a.status !== b.status) {
      return a.status === 'LIVE' ? -1 : 1;
    }
    return 0;
  });

  return { updatedAt, matches };
}

export async function GET() {
  try {
    const res = await fetch(CRICINFO_RSS_URL, {
      headers: {
        'User-Agent': 'Veninfotech-LiveScores/1.0 (+https://veninfotech.net)',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Unable to fetch live cricket scores (HTTP ${res.status}).`,
          updatedAt: null,
          matches: [],
        },
        {
          status: 502,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const xml = await res.text();
    const payload = parseCricinfoRss(xml);

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error('Error fetching ESPNcricinfo live RSS feed:', err);
    return NextResponse.json(
      {
        error: 'Live cricket score feed is temporarily unreachable.',
        updatedAt: null,
        matches: [],
      },
      {
        status: 502,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
