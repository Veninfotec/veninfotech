export type EmbedType = 'iframe' | 'script' | 'api';

export type FootballWidgetType = 'matches' | 'standings' | 'scorers' | 'team';

export type WidgetPlacement = 'main' | 'sidebar';

export interface SportApiWidgetConfig {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  placement: WidgetPlacement;
  creditHref: string;
  creditText: string;
  dataAttributes: {
    'data-type': FootballWidgetType;
    'data-league'?: string;
    'data-team'?: string;
    'data-theme': 'light' | 'dark' | 'auto';
    'data-accent': string;
    'data-height': string;
  };
}

export interface LiveScoreSportConfig {
  id: string;
  label: string;
  description: string;
  embedType: EmbedType;
  src: string;
  minHeight: number;
  providerName: string;
  backgroundImage: string;
}

export const DEFAULT_LIVE_SCORE_SPORT_ID = 'football';

export const FOOTBALL_WIDGET_SCRIPT_URL = 'https://sportapi.ai/widget.js';

export const CRICKET_SCORES_API_ENDPOINT = '/api/cricket-scores';

export const FOOTBALL_WIDGETS: SportApiWidgetConfig[] = [
  {
    id: 'football-matches',
    label: 'Live Matches',
    shortLabel: 'Live Matches',
    description: 'Live kickoffs, scores, and daily matchday schedule.',
    placement: 'main',
    creditHref: 'https://sportapi.ai/',
    creditText: 'Football data by SportAPI',
    dataAttributes: {
      'data-type': 'matches',
      'data-league': '24',
      'data-theme': 'dark',
      'data-accent': '#1365A4',
      'data-height': '480',
    },
  },
  {
    id: 'football-standings',
    label: 'League Table',
    shortLabel: 'League Table',
    description: 'Live competition standings, points, and recent form.',
    placement: 'sidebar',
    creditHref: 'https://sportapi.ai/',
    creditText: 'Football data by SportAPI',
    dataAttributes: {
      'data-type': 'standings',
      'data-league': '24',
      'data-theme': 'dark',
      'data-accent': '#1365A4',
      'data-height': '480',
    },
  },
  {
    id: 'football-scorers',
    label: 'Top Scorers',
    shortLabel: 'Top Scorers',
    description: 'Leading goalscorers and penalties across the competition.',
    placement: 'sidebar',
    creditHref: 'https://sportapi.ai/',
    creditText: 'Football data by SportAPI',
    dataAttributes: {
      'data-type': 'scorers',
      'data-league': '24',
      'data-theme': 'dark',
      'data-accent': '#1365A4',
      'data-height': '480',
    },
  },
  {
    id: 'football-team',
    label: 'Featured Team',
    shortLabel: 'Featured Team',
    description: 'Upcoming fixtures and recent match results for featured club.',
    placement: 'main',
    creditHref: 'https://sportapi.ai/',
    creditText: 'Football data by SportAPI',
    dataAttributes: {
      'data-type': 'team',
      'data-team': '324',
      'data-theme': 'dark',
      'data-accent': '#1365A4',
      'data-height': '480',
    },
  },
];

/**
 * Centralized configuration for the /live-scores dashboard tabs.
 * Football is ordered first as the default active tab, followed by Cricket.
 */
export const LIVE_SCORES_SPORTS: LiveScoreSportConfig[] = [
  {
    id: 'football',
    label: 'Football',
    description:
      'Live matchday scoreboard, league standings, top scorers, and featured club fixtures.',
    embedType: 'script',
    src: FOOTBALL_WIDGET_SCRIPT_URL,
    minHeight: 480,
    providerName: 'SportAPI.ai',
    backgroundImage: '/images/live-scores/football-bg.jpg',
  },
  {
    id: 'cricket',
    label: 'Cricket',
    description:
      'Live cricket scores, international series, and upcoming fixtures from ESPNcricinfo.',
    embedType: 'api',
    src: CRICKET_SCORES_API_ENDPOINT,
    minHeight: 480,
    providerName: 'ESPNcricinfo',
    backgroundImage: '/images/live-scores/cricket-bg.jpg',
  },
];
