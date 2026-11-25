'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import Skeleton from '@/components/ui/Skeleton';
import type { CricketMatchItem } from '@/app/api/cricket-scores/route';
import {
  CRICKET_SCORES_API_ENDPOINT,
  DEFAULT_LIVE_SCORE_SPORT_ID,
  FOOTBALL_WIDGETS,
  FOOTBALL_WIDGET_SCRIPT_URL,
  LIVE_SCORES_SPORTS,
  SportApiWidgetConfig,
} from '@/lib/live-scores-config';

declare global {
  interface Window {
    SportAPIWidget?: {
      version?: string;
      mount?: (el: Element) => void;
      scan?: () => void;
    };
  }
}

const CRICKET_POLL_INTERVAL_MS = 30_000;

type CricketFilter = 'international' | 'all';

function SportIcon({ sportId }: { sportId: string }) {
  if (sportId === 'cricket') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0"
        aria-hidden="true"
      >
        <path d="m14.5 4.5 5 5-9.8 9.8a2.1 2.1 0 0 1-3 0l-2-2a2.1 2.1 0 0 1 0-3L14.5 4.5Z" />
        <path d="m17 7 2.5-2.5" />
        <circle cx="6.5" cy="6.5" r="2.5" />
      </svg>
    );
  }

  if (sportId === 'football') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9.5" />
        <polygon points="12 7.5 16.2 10.5 14.6 15.5 9.4 15.5 7.8 10.5" />
        <path d="M12 2.5v5M21 9.5l-4.8 1M17.5 19.5l-2.9-4M6.5 19.5l2.9-4M3 9.5l4.8 1" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function WidgetSkeleton({ height = 480 }: { height?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading live scoreboard widget"
      className="w-full border border-neutral-800 bg-[#111827] p-4 space-y-3"
      style={{ minHeight: `${height}px` }}
    >
      <div className="flex items-center gap-3 border-b-2 border-neutral-800 pb-3">
        <Skeleton className="size-7 rounded-none bg-neutral-800" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36 rounded-none bg-neutral-800" />
          <Skeleton className="h-3 w-24 rounded-none bg-neutral-900" />
        </div>
      </div>
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <div
          key={idx}
          className="flex items-center justify-between border-b border-neutral-800/80 py-3 last:border-b-0"
        >
          <Skeleton className="h-3.5 w-16 rounded-none bg-neutral-900" />
          <Skeleton className="h-3.5 w-40 rounded-none bg-neutral-800" />
          <Skeleton className="h-3.5 w-12 rounded-none bg-neutral-800" />
        </div>
      ))}
    </div>
  );
}

function CricketCardsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading live cricket scores"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <div
          key={idx}
          className="border border-neutral-800 bg-[#111318] p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-none bg-neutral-800" />
            <Skeleton className="h-3.5 w-20 rounded-none bg-neutral-900" />
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-40 rounded-none bg-neutral-800" />
              <Skeleton className="h-4 w-16 rounded-none bg-neutral-800" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-36 rounded-none bg-neutral-800" />
              <Skeleton className="h-4 w-16 rounded-none bg-neutral-900" />
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-3 flex items-center justify-between">
            <Skeleton className="h-3 w-28 rounded-none bg-neutral-900" />
            <Skeleton className="h-3 w-24 rounded-none bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SportApiWidgetContainer({
  widget,
  scriptReady,
  scriptError,
}: {
  widget: SportApiWidgetConfig;
  scriptReady: boolean;
  scriptError: boolean;
}) {
  const heightValue = Number.parseInt(widget.dataAttributes['data-height'], 10) || 480;

  if (scriptError) {
    return (
      <div className="border border-neutral-800 bg-[#0a0a0c] p-6 text-center">
        <p className="text-sm font-bold text-white">
          Unable to load {widget.label}
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Please check your network connection or temporarily disable content blockers for{' '}
          <code className="font-mono text-neutral-200">sportapi.ai</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {!scriptReady && <WidgetSkeleton height={Math.min(heightValue, 340)} />}
      <div
        key={widget.id}
        className={`sportapi-widget w-full ${scriptReady ? '' : 'opacity-0 pointer-events-none'}`}
        {...widget.dataAttributes}
      >
        <a href={widget.creditHref}>{widget.creditText}</a>
      </div>
    </div>
  );
}

function CricketScoresPanel({ isActive }: { isActive: boolean }) {
  const [matches, setMatches] = useState<CricketMatchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CricketFilter>('international');

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;
    const controller = new AbortController();

    async function loadCricketScores() {
      try {
        const res = await fetch(CRICKET_SCORES_API_ENDPOINT, {
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          matches?: CricketMatchItem[];
          error?: string;
        };

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error || 'Live cricket scores are temporarily unavailable.');
          return;
        }

        setMatches(Array.isArray(data.matches) ? data.matches : []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Live cricket scores are temporarily unavailable. Please try again shortly.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCricketScores();
    const intervalId = window.setInterval(loadCricketScores, CRICKET_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [isActive]);

  const internationalMatches = useMemo(
    () => matches.filter((m) => m.isInternational),
    [matches]
  );

  const displayedMatches = useMemo(() => {
    if (filter === 'international') {
      return internationalMatches;
    }
    return matches;
  }, [filter, internationalMatches, matches]);

  const liveCount = useMemo(
    () => displayedMatches.filter((m) => m.status === 'LIVE').length,
    [displayedMatches]
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div
          role="group"
          aria-label="Filter cricket matches"
          className="inline-flex flex-nowrap items-center gap-1 border border-white/15 bg-[#0a0a0c]/80 p-1 w-fit backdrop-blur-xs"
        >
          <button
            type="button"
            onClick={() => setFilter('international')}
            aria-pressed={filter === 'international'}
            className={`relative px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1365A4] ${
              filter === 'international'
                ? 'bg-[#1365A4] text-white'
                : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            <span>International</span>
            {filter === 'international' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-[#70baff]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            className={`relative px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1365A4] ${
              filter === 'all'
                ? 'bg-[#1365A4] text-white'
                : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            <span>All Matches</span>
            {filter === 'all' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-[#70baff]"
              />
            )}
          </button>
        </div>

        {!loading && !error && (
          <div className="flex items-center gap-3 text-xs font-medium text-neutral-400">
            {liveCount > 0 && (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="size-1.5 bg-emerald-400" aria-hidden="true" />
                <span>{liveCount} Live</span>
              </span>
            )}
            <span>
              {displayedMatches.length}{' '}
              {displayedMatches.length === 1 ? 'Match' : 'Matches'}
            </span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && matches.length === 0 ? (
        <CricketCardsSkeleton />
      ) : error && matches.length === 0 ? (
        <div className="border border-neutral-800 bg-[#111318] p-8 sm:p-10 text-center">
          <p className="text-sm font-bold text-white">{error}</p>
          <p className="mt-1 text-xs text-neutral-400">
            Scores will retry automatically when the connection stabilizes.
          </p>
        </div>
      ) : displayedMatches.length === 0 ? (
        <div className="border border-neutral-800 bg-[#111318] p-8 sm:p-10 text-center space-y-3">
          <p className="text-sm font-bold text-white">
            {filter === 'international'
              ? 'No active or upcoming international matches listed right now.'
              : 'No cricket matches available right now.'}
          </p>
          {filter === 'international' && matches.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="inline-flex items-center bg-[#1365A4] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0e4c7c] transition-colors cursor-pointer"
            >
              View All {matches.length} Matches
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedMatches.map((match) => {
            const isLive = match.status === 'LIVE';
            return (
              <a
                key={match.id}
                href={match.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between border border-white/10 bg-[#111318]/88 p-5 backdrop-blur-sm transition-colors hover:border-[#1365A4] hover:bg-[#14171f]/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1365A4]"
              >
                <div>
                  {/* Card Top Status Row */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {isLive ? (
                      <span className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        <span className="relative flex size-2" aria-hidden="true">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                        </span>
                        <span>LIVE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center border border-neutral-700 bg-neutral-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        UPCOMING
                      </span>
                    )}

                    {match.isInternational && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#70baff]">
                        International
                      </span>
                    )}
                  </div>

                  {/* Teams & Scores */}
                  <div className="divide-y divide-neutral-800/80">
                    {[match.teamA, match.teamB].map((team, idx) => (
                      <div
                        key={`${match.id}-team-${idx}`}
                        className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`truncate text-sm ${
                              team.isBatting
                                ? 'font-bold text-white'
                                : isLive
                                ? 'font-medium text-neutral-300'
                                : 'font-semibold text-neutral-100'
                            }`}
                          >
                            {team.name}
                          </span>
                          {team.isBatting && (
                            <span
                              title="Currently batting"
                              className="shrink-0 bg-[#1365A4] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                            >
                              *
                            </span>
                          )}
                        </div>

                        <span
                          className={`shrink-0 font-mono text-sm tabular-nums ${
                            team.isBatting
                              ? 'font-bold text-white'
                              : team.score
                              ? 'font-semibold text-neutral-300'
                              : 'font-medium text-neutral-500'
                          }`}
                        >
                          {team.score ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="mt-4 border-t border-neutral-800/80 pt-3 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-neutral-500">
                    ESPNcricinfo
                  </span>
                  <span className="font-bold text-[#70baff] group-hover:text-white transition-colors">
                    Full Scorecard &#8599;
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FootballMatchCenter({
  scriptReady,
  scriptError,
  activeSidebarId,
  visitedSidebarIds,
  onSelectSidebarTab,
}: {
  scriptReady: boolean;
  scriptError: boolean;
  activeSidebarId: string;
  visitedSidebarIds: string[];
  onSelectSidebarTab: (widgetId: string) => void;
}) {
  const matchesWidget = FOOTBALL_WIDGETS.find(
    (w) => w.dataAttributes['data-type'] === 'matches'
  );
  const teamWidget = FOOTBALL_WIDGETS.find(
    (w) => w.dataAttributes['data-type'] === 'team'
  );
  const sidebarWidgets = FOOTBALL_WIDGETS.filter((w) => w.placement === 'sidebar');
  const sidebarTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleSidebarKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    const total = sidebarWidgets.length;
    if (total <= 1) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % total;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + total) % total;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = total - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetWidget = sidebarWidgets[nextIndex];
      if (targetWidget) {
        onSelectSidebarTab(targetWidget.id);
        sidebarTabRefs.current[targetWidget.id]?.focus();
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Main Column: Live Matches + Featured Team */}
        <div className="lg:col-span-2 space-y-6">
          {matchesWidget && (
            <div className="border border-white/10 bg-[#111318]/88 p-4 sm:p-5 backdrop-blur-sm">
              <div className="mb-3.5 border-b border-white/10 pb-2.5">
                <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                  {matchesWidget.label}
                </h2>
              </div>

              <SportApiWidgetContainer
                widget={matchesWidget}
                scriptReady={scriptReady}
                scriptError={scriptError}
              />
            </div>
          )}

          {teamWidget && (
            <div className="border border-white/10 bg-[#111318]/88 p-4 sm:p-5 backdrop-blur-sm">
              <div className="mb-3.5 border-b border-white/10 pb-2.5">
                <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                  {teamWidget.label}
                </h2>
              </div>

              <SportApiWidgetContainer
                widget={teamWidget}
                scriptReady={scriptReady}
                scriptError={scriptError}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar: League Table / Top Scorers Sub-Tabs */}
        <aside
          aria-label="Football League Table and Top Scorers"
          className="lg:col-span-1 border border-white/10 bg-[#111318]/88 backdrop-blur-sm overflow-hidden"
        >
          {/* Sub-Tab Header */}
          <div className="border-b border-neutral-800 bg-[#0a0a0c]/80 p-3 sm:p-4">
            <div
              role="tablist"
              aria-label="Competition statistics views"
              className="flex flex-nowrap items-center gap-1 overflow-x-auto border border-neutral-800 bg-[#0a0a0c] p-1"
            >
              {sidebarWidgets.map((widget, index) => {
                const isSelected = widget.id === activeSidebarId;
                return (
                  <button
                    key={widget.id}
                    ref={(el) => {
                      sidebarTabRefs.current[widget.id] = el;
                    }}
                    id={`football-sidebar-tab-${widget.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => onSelectSidebarTab(widget.id)}
                    onKeyDown={(e) => handleSidebarKeyDown(e, index)}
                    className={`relative flex-1 shrink-0 whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1365A4] ${
                      isSelected
                        ? 'bg-[#1365A4] text-white'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <span>{widget.shortLabel}</span>
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-[2px] bg-[#70baff]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Tab Panels */}
          <div className="p-4">
            {sidebarWidgets.map((widget) => {
              const isSelected = widget.id === activeSidebarId;
              const isVisited = visitedSidebarIds.includes(widget.id);

              if (!isVisited) {
                return null;
              }

              return (
                <div
                  key={widget.id}
                  role="tabpanel"
                  aria-labelledby={`football-sidebar-tab-${widget.id}`}
                  hidden={!isSelected}
                >
                  <SportApiWidgetContainer
                    widget={widget}
                    scriptReady={scriptReady}
                    scriptError={scriptError}
                  />
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function LiveScoresDashboard() {
  const defaultSportId =
    LIVE_SCORES_SPORTS.find((s) => s.id === DEFAULT_LIVE_SCORE_SPORT_ID)?.id ??
    LIVE_SCORES_SPORTS[0]?.id ??
    'football';

  const defaultSidebarWidgetId =
    FOOTBALL_WIDGETS.find((w) => w.placement === 'sidebar')?.id ?? 'football-standings';

  const [activeSportId, setActiveSportId] = useState<string>(defaultSportId);
  const [visitedSportIds, setVisitedSportIds] = useState<string[]>([defaultSportId]);
  const [activeSidebarId, setActiveSidebarId] = useState<string>(defaultSidebarWidgetId);
  const [visitedSidebarIds, setVisitedSidebarIds] = useState<string[]>([
    defaultSidebarWidgetId,
  ]);

  const [sportApiReady, setSportApiReady] = useState<boolean>(false);
  const [sportApiError, setSportApiError] = useState<boolean>(false);

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeSport =
    LIVE_SCORES_SPORTS.find((sport) => sport.id === activeSportId) ??
    LIVE_SCORES_SPORTS[0];

  const isFootballVisited = visitedSportIds.includes('football');

  const scanSportApiWidgets = useCallback(() => {
    if (typeof window !== 'undefined' && typeof window.SportAPIWidget?.scan === 'function') {
      window.SportAPIWidget.scan();
    }
  }, []);

  // Re-initialize any newly mounted .sportapi-widget divs whenever tabs or sidebar sub-tabs change
  useEffect(() => {
    if (!isFootballVisited) return;
    const rafId = window.requestAnimationFrame(() => {
      scanSportApiWidgets();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [
    isFootballVisited,
    activeSportId,
    activeSidebarId,
    visitedSidebarIds,
    sportApiReady,
    scanSportApiWidgets,
  ]);

  const handleSportApiReady = useCallback(() => {
    setSportApiReady(true);
    setSportApiError(false);
    scanSportApiWidgets();
  }, [scanSportApiWidgets]);

  const handleSportApiError = useCallback(() => {
    setSportApiError(true);
  }, []);

  const handleSelectSport = useCallback((sportId: string) => {
    setActiveSportId(sportId);
    setVisitedSportIds((prev) => (prev.includes(sportId) ? prev : [...prev, sportId]));
  }, []);

  const handleSelectSidebarTab = useCallback((widgetId: string) => {
    setActiveSidebarId(widgetId);
    setVisitedSidebarIds((prev) => (prev.includes(widgetId) ? prev : [...prev, widgetId]));
  }, []);

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    const total = LIVE_SCORES_SPORTS.length;
    if (total <= 1) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % total;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + total) % total;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = total - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetSport = LIVE_SCORES_SPORTS[nextIndex];
      if (targetSport) {
        handleSelectSport(targetSport.id);
        tabRefs.current[targetSport.id]?.focus();
      }
    }
  };

  if (!activeSport) return null;

  return (
    <div className="relative flex-1 overflow-x-clip bg-[#0a0a0c]">
      <h1 className="sr-only">Live Scores</h1>

      {/* Dynamic Faded Sport Backdrop (Cross-fades between Football & Cricket) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-x-clip"
      >
        <div className="sticky top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-full overflow-hidden">
          {LIVE_SCORES_SPORTS.map((sport) => {
            const isActive = sport.id === activeSport.id;
            return (
              <div
                key={sport.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={sport.backgroundImage}
                  alt=""
                  fill
                  unoptimized
                  priority={sport.id === defaultSportId}
                  sizes="100vw"
                  className="object-cover object-center brightness-[0.95] contrast-[1.05]"
                />
              </div>
            );
          })}

          {/* Balanced Dark Vignette & Edge Fade Overlays */}
          <div className="absolute inset-0 bg-[#0a0a0c]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/70 via-transparent to-[#0a0a0c]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c]/70 via-transparent to-[#0a0a0c]/70" />
        </div>
      </div>

      {/* Shared SportAPI widget script loaded exactly once */}
      {isFootballVisited && (
        <Script
          id="sportapi-widget-script"
          src={FOOTBALL_WIDGET_SCRIPT_URL}
          strategy="lazyOnload"
          onLoad={handleSportApiReady}
          onReady={handleSportApiReady}
          onError={handleSportApiError}
        />
      )}

      {/* Centered Dashboard Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1170px] px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Top Sport Tab Switcher Only (Football | Cricket) */}
        <div className="flex items-center">
          <div
            role="tablist"
            aria-label="Select sport live scoreboard"
            className="inline-flex flex-nowrap items-center gap-1 overflow-x-auto border border-white/15 bg-[#111318]/85 p-1 backdrop-blur-md"
          >
            {LIVE_SCORES_SPORTS.map((sport, index) => {
              const isSelected = sport.id === activeSport.id;
              return (
                <button
                  key={sport.id}
                  ref={(el) => {
                    tabRefs.current[sport.id] = el;
                  }}
                  id={`sport-tab-${sport.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => handleSelectSport(sport.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className={`relative inline-flex shrink-0 items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1365A4] ${
                    isSelected
                      ? 'bg-[#1365A4] text-white'
                      : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <SportIcon sportId={sport.id} />
                  <span>{sport.label}</span>
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[2.5px] bg-[#70baff]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Widget Container */}
        <section
          aria-label={`${activeSport.label} Scoreboard Panel`}
          className="w-full overflow-hidden border border-white/15 bg-neutral-950/35 backdrop-blur-[2px]"
        >
          {/* Tab Panels (Only visited tabs mount; inactive tabs remain cleanly hidden) */}
          {LIVE_SCORES_SPORTS.map((sport) => {
            const isActive = sport.id === activeSport.id;
            const isVisited = visitedSportIds.includes(sport.id);

            if (!isVisited) {
              return null;
            }

            return (
              <div
                key={sport.id}
                role="tabpanel"
                aria-labelledby={`sport-tab-${sport.id}`}
                hidden={!isActive}
              >
                {sport.id === 'football' ? (
                  <FootballMatchCenter
                    scriptReady={sportApiReady}
                    scriptError={sportApiError}
                    activeSidebarId={activeSidebarId}
                    visitedSidebarIds={visitedSidebarIds}
                    onSelectSidebarTab={handleSelectSidebarTab}
                  />
                ) : (
                  <CricketScoresPanel isActive={isActive} />
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
