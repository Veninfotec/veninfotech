'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface HeroItem {
  id: string;
  badge: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
}

interface HeroBannerClientProps {
  items: HeroItem[];
}

const CYCLE_DURATION = 7000; // 7 seconds per slide

export default function HeroBannerClient({ items }: HeroBannerClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const total = items.length;

  const selectSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgressKey((prev) => prev + 1);
  }, []);

  // Continuous auto-rotation timer (automatic animation without manual skip buttons)
  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
      setProgressKey((prev) => prev + 1);
    }, CYCLE_DURATION);

    return () => clearInterval(timer);
  }, [total, progressKey]);

  if (!items || items.length === 0) return null;

  const activeItem = items[currentIndex] || items[0];

  return (
    <section
      aria-label="Hero Spotlight & Trending Feed"
      className="relative flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] w-full flex-col justify-between overflow-hidden bg-neutral-950 text-white shadow-2xl"
    >
      {/* Dynamic Background Images with Smooth Cinematic Cross-Fade */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {items.map((item, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={item.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                className={`object-cover object-center brightness-[0.94] contrast-[1.06] transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* Cinematic Balanced Lighting: Darkened to preserve rich depth without washing out */}
        {/* Ambient subtle vignette */}
        <div className="absolute inset-0 z-[1] bg-neutral-950/25 pointer-events-none" />

        {/* Directional left shadow ensuring high text contrast while letting scene background show */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 via-45% to-neutral-950/20 pointer-events-none" />

        {/* Bottom vignette blending seamlessly into dark page backdrop */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-neutral-950/85 via-neutral-950/35 to-transparent pointer-events-none" />

        {/* Top vignette for clean navbar visibility */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-neutral-950/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Main Content Area: Left Spotlight & Right Trending Column */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1170px] flex-1 flex-col justify-center px-4 py-8 sm:py-10 md:py-12 lg:py-14">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {/* Left Column: Spotlight Hot Story (Animates with active slide) */}
          <div className="flex flex-col justify-center lg:col-span-7 xl:col-span-7">
            <div key={`${activeItem.id}-${progressKey}`} className="animate-hero-fade">
              {/* Badge & Meta Information */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-[#1365A4] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-[#1365A4]/35">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-white" />
                  </span>
                  {activeItem.badge}
                </span>

                <span className="bg-white/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-300 backdrop-blur-sm">
                  {activeItem.category}
                </span>

                <span className="size-1 rounded-full bg-neutral-400" aria-hidden="true" />

                <span className="text-xs font-medium uppercase tracking-wider text-neutral-300">
                  {activeItem.date}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-4 text-2xl font-black leading-[1.14] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl">
                <Link
                  href={activeItem.href}
                  className=""
                >
                  {activeItem.title}
                </Link>
              </h1>

              {/* Excerpt Summary */}
              <p className="mt-3.5 max-w-xl text-xs leading-relaxed text-neutral-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:text-sm md:text-base">
                {activeItem.excerpt}
              </p>

              {/* Call to Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
                <Link
                  href={activeItem.href}
                  className="group inline-flex items-center gap-2 bg-[#1365A4] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-[#0e4c7c] active:scale-95"
                >
                  <span>Read Full Article</span>
                  <svg
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>

                <Link
                  href="#editorial-feed"
                  onClick={(e) => {
                    const target = document.getElementById('editorial-feed');
                    if (target) {
                      e.preventDefault();
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-black"
                >
                  Explore Feed
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Trending Section (Animates continuously one by one) */}
          <div className="lg:col-span-5 xl:col-span-5">
            <aside
              aria-label="Trending Stories"
              className="relative overflow-hidden border border-white/10 bg-neutral-950/30 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl ring-1 ring-white/10 sm:p-5 lg:translate-y-2"
            >
              {/* Header with Title and Counter */}
              <div className="mb-3.5 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1365A4] opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-[#1365A4]" />
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                    {total === 1 ? 'Latest Story' : 'Latest Stories'}
                  </h2>
                </div>
              </div>

              {/* Trending Stories List */}
              <div className="flex flex-col gap-2.5">
                {items.map((item, index) => {
                  const isActive = index === currentIndex;

                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectSlide(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          selectSlide(index);
                        }
                      }}
                      className={`group relative flex cursor-pointer items-center gap-3 overflow-hidden p-2.5 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[#1365A4] ${
                        isActive
                          ? 'bg-white/[0.12] ring-1 ring-white/20 shadow-md translate-x-1 border-l-4 border-l-[#1365A4]'
                          : 'bg-white/[0.03] hover:bg-white/[0.07] hover:translate-x-0.5 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Active Progress Bar (Fills continuously when total > 1) */}
                      {isActive && total > 1 && (
                        <div
                          key={`prog-${progressKey}`}
                          className="absolute bottom-0 left-0 h-[2.5px] bg-[#1365A4]"
                          style={{
                            animation: `heroProgress ${CYCLE_DURATION}ms linear forwards`,
                          }}
                        />
                      )}

                      {/* Thumbnail Image */}
                      <div
                        className={`relative size-14 shrink-0 overflow-hidden rounded-lg transition-all duration-300 sm:size-16 ${
                          isActive
                            ? ' scale-105'
                            : 'border-white/10 group-hover:border-white/25'
                        }`}
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover brightness-95 contrast-[1.04] transition-transform duration-300 group-hover:scale-110"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-[#1365A4]/20 mix-blend-overlay" />
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-neutral-300 sm:text-[11px]">
                          <span
                            className={`font-semibold transition-colors ${
                              isActive ? 'text-[#70baff]' : 'text-[#1365A4]'
                            }`}
                          >
                            {item.category}
                          </span>
                          <span className="size-0.5 rounded-full bg-neutral-400" aria-hidden="true" />
                          <span>{item.date}</span>
                        </div>

                        <h3
                          className={`mt-0.5 line-clamp-2 text-xs font-bold leading-snug transition-colors sm:text-[13px] ${
                            isActive
                              ? 'text-white'
                              : 'text-neutral-200 group-hover:text-white'
                          }`}
                        >
                          {item.title}
                        </h3>
                      </div>

                      {/* Active Story Arrow Indicator */}
                      {isActive && (
                        <div className="shrink-0 pr-1 text-[#70baff] animate-pulse">
                          <svg
                            className="size-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Indicator at Bottom */}
      <div className="relative z-10 flex w-full justify-center pb-4 sm:pb-5">
        <Link
          href="#latest-games"
          aria-label="Scroll down to content"
          className="group flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-300 transition-colors hover:text-white"
        >
          <span>Scroll Down</span>
          <svg
            className="size-3.5 animate-bounce text-neutral-300 group-hover:text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
