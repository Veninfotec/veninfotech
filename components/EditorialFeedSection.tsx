'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ShareButton from '@/components/ShareButton';

export interface FeedPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentPreview?: string;
  category: string;
  image: string;
  date: string;
  timestamp: number;
  author: string;
  views: number;
  readTimeMinutes: number;
  post_type?: 'blog' | 'news';
  is_breaking?: boolean;
}

interface EditorialFeedSectionProps {
  posts: FeedPostItem[];
  initialSearch?: string;
}

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'technology', label: 'Tech' },
  { id: 'science', label: 'Science' },
  { id: 'economy', label: 'Economy' },
  { id: 'culture', label: 'Culture' },
  { id: 'world', label: 'World' },
  { id: 'politics', label: 'Politics' },
];

function formatViewsCount(views: number): string {
  if (!views || views <= 0) return 'New';
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1).replace(/\.0$/, '')}k views`;
  }
  return `${views.toLocaleString('en-US')} ${views === 1 ? 'view' : 'views'}`;
}

function matchesCategoryFilter(postCategory: string, filterId: string): boolean {
  if (filterId === 'all') return true;
  const cat = (postCategory || '').toLowerCase().trim();
  if (filterId === 'technology') {
    return (
      cat === 'tech' ||
      cat === 'technology' ||
      cat.includes('tech') ||
      cat.includes('software') ||
      cat.includes('ai')
    );
  }
  if (filterId === 'world') {
    return cat === 'world' || cat === 'world news' || cat === 'news';
  }
  return cat === filterId || cat.includes(filterId);
}

export default function EditorialFeedSection({
  posts,
  initialSearch = '',
}: EditorialFeedSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Strictly enforce BLOG posts only (never news articles)
  const blogPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    return posts.filter((p) => {
      if (p.post_type === 'news' || p.is_breaking) return false;
      const cat = (p.category || '').trim().toUpperCase();
      if (
        cat === 'NEWS' ||
        cat === 'WORLD NEWS' ||
        cat === 'BREAKING NEWS' ||
        cat === 'BREAKING'
      ) {
        return false;
      }
      return true;
    });
  }, [posts]);

  // 1. Top Featured Blog Story
  const featuredPost = useMemo(() => {
    if (blogPosts.length === 0) return null;
    return blogPosts[0];
  }, [blogPosts]);

  // 2. Most Popular Blogs List (Top 5 sorted by views desc, then newest)
  const mostPopularPosts = useMemo(() => {
    if (blogPosts.length === 0) return [];
    return [...blogPosts]
      .sort((a, b) => {
        if (b.views !== a.views) return b.views - a.views;
        return b.timestamp - a.timestamp;
      })
      .slice(0, 5);
  }, [blogPosts]);

  // 3. Editor's Choice / Curated Blog Deep Dives (Up to 4 distinct highlights across categories)
  const editorsChoicePosts = useMemo(() => {
    if (blogPosts.length === 0) return [];
    const pool = blogPosts.filter((p) => !featuredPost || p.slug !== featuredPost.slug);
    const source = pool.length > 0 ? pool : blogPosts;

    const seenCategories = new Set<string>();
    const diverse: FeedPostItem[] = [];
    for (const item of source) {
      const catKey = item.category.toUpperCase();
      if (!seenCategories.has(catKey)) {
        seenCategories.add(catKey);
        diverse.push(item);
      }
      if (diverse.length >= 4) break;
    }

    if (diverse.length < 4) {
      for (const item of source) {
        if (!diverse.some((d) => d.slug === item.slug)) {
          diverse.push(item);
        }
        if (diverse.length >= 4) break;
      }
    }

    return diverse;
  }, [blogPosts, featuredPost]);

  // 4. Filtered Blog Posts for the 2-Column Latest Blogs Grid
  const filteredWirePosts = useMemo(() => {
    if (blogPosts.length === 0) return [];
    const q = searchTerm.trim().toLowerCase();

    return blogPosts.filter((post) => {
      const categoryOk = matchesCategoryFilter(post.category, selectedCategory);
      if (!categoryOk) return false;

      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q)
      );
    });
  }, [blogPosts, selectedCategory, searchTerm]);

  const displayedWirePosts = filteredWirePosts.slice(0, visibleCount);

  if (blogPosts.length === 0) {
    return (
      <section
        id="editorial-feed"
        aria-label="Editorial Feed"
        className="scroll-mt-16 w-full bg-[#0a0a0c] py-14 sm:py-20 border-b border-neutral-800"
      >
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-6">
          <div className="border border-neutral-800 bg-[#111318] p-10 sm:p-14 text-center">
            <span className="inline-block bg-[#1365A4]/20 border border-[#1365A4]/40 text-[#70baff] px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-3">
              Editorial Feed
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              No Blog Articles Published Yet
            </h2>
            <p className="mt-2 text-sm text-neutral-400 max-w-md mx-auto">
              Publish your first blog post in the Admin Studio to populate the featured story, trending leaderboard, and category feed.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="editorial-feed"
      aria-label="Featured Blogs and Editorial Feed"
      className="scroll-mt-16 w-full"
    >
      {/* =====================================================================
          UPPER DARK-MODE SHOWCASE:
          Header + Featured Lead Story + Most Popular + Category Filter Bar
         ===================================================================== */}
      <div className="w-full bg-[#0a0a0c] text-white py-12 sm:py-16 border-b border-neutral-800">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-6 space-y-8 sm:space-y-10">
          {/* Section Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#70baff] mb-1.5">
                <span className="size-1.5 rounded-full bg-[#1365A4]" />
                <span>Veninfotech Editorial Blogs</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                Featured Blogs &amp; Deep Dives
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span className="inline-flex items-center gap-2 border border-neutral-800 bg-[#111318] px-3.5 py-1.5 text-[11px] font-semibold text-neutral-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>
                  {blogPosts.length} {blogPosts.length === 1 ? 'Published Blog' : 'Published Blogs'}
                </span>
              </span>
            </div>
          </div>

          {/* BLOCK 1: MAIN FEATURED / TOP STORY (Left) + MOST POPULAR WIDGET (Right) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
            {/* LEFT: MAIN FEATURED / TOP STORY (Hero Card) */}
            {featuredPost && (
              <div className="lg:col-span-8 flex flex-col">
                <article className="group flex flex-1 flex-col overflow-hidden bg-[#111318] border border-neutral-800/90 transition-all duration-300 hover:border-neutral-700">
                  {/* High-Res 16:9 Image */}
                  <Link
                    href={`/posts/${featuredPost.slug}`}
                    className="relative aspect-video w-full overflow-hidden bg-neutral-950 block"
                  >
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Top-Left Featured Badge */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-[#1365A4] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                        <span>Featured Story</span>
                      </span>
                    </div>
                  </Link>

                  {/* Story Details */}
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                    <div>
                      {/* Category Tag */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-3">
                        <Link
                          href={`/category/${encodeURIComponent(featuredPost.category.toLowerCase())}`}
                          className="inline-block bg-[#1365A4]/20 border border-[#1365A4]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#70baff] hover:bg-[#1365A4] hover:text-white transition-colors"
                        >
                          {featuredPost.category}
                        </Link>
                        <span className="inline-block border border-neutral-800 bg-neutral-900/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                          Editorial Analysis
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight text-white group-hover:text-[#70baff] transition-colors">
                        <Link href={`/posts/${featuredPost.slug}`}>
                          {featuredPost.title}
                        </Link>
                      </h3>

                      {/* Excerpt Preview */}
                      <p className="mt-3 text-sm sm:text-base leading-relaxed text-neutral-400 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    {/* Meta Footer: Date, Read Time, Author, Share */}
                    <div className="mt-6 pt-4 border-t border-neutral-800/90 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
                      <div className="flex flex-wrap items-center gap-2.5 font-medium">
                        <time dateTime={featuredPost.date} className="text-neutral-300 font-semibold">
                          {featuredPost.date}
                        </time>
                        <span className="text-neutral-600">•</span>
                        <span>{featuredPost.readTimeMinutes} min read</span>
                        <span className="text-neutral-600">•</span>
                        <span>By {featuredPost.author}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <Link
                          href={`/posts/${featuredPost.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#70baff] hover:text-white transition-colors"
                        >
                          <span>Read Article</span>
                          <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            )}

            {/* RIGHT: MOST POPULAR (Trending Ranked Widget) */}
            <aside
              aria-label="Most Popular Blogs"
              className="lg:col-span-4 flex flex-col bg-[#111318] border border-neutral-800/90"
            >
              {/* Widget Header */}
              <div className="border-b border-neutral-800 bg-neutral-950/60 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-[#1365A4]" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                    Most Popular
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#70baff]">
                  Top Read
                </span>
              </div>

              {/* Ranked List */}
              <div className="flex-1 divide-y divide-neutral-800/80 px-6 py-2 flex flex-col justify-between">
                {mostPopularPosts.map((item, idx) => (
                  <article key={item.slug} className="py-4 first:pt-4 last:pb-4 group">
                    <Link
                      href={`/posts/${item.slug}`}
                      className="flex items-start gap-3.5 focus-visible:outline-none"
                    >
                      {/* Number Badge */}
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center text-xs font-black tracking-tight transition-colors ${
                          idx === 0
                            ? 'bg-[#1365A4] text-white'
                            : idx === 1
                            ? 'bg-neutral-800 text-white border border-neutral-700'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800 group-hover:border-[#1365A4] group-hover:text-white'
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#70baff] block mb-0.5">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold leading-snug text-neutral-100 group-hover:text-[#70baff] transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 font-medium">
                          <span>{formatViewsCount(item.views)}</span>
                          <span>•</span>
                          <span>{item.readTimeMinutes}m read</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Widget Footer */}
              <div className="border-t border-neutral-800 bg-neutral-950/40 px-6 py-3.5 text-right">
                <Link
                  href="/category/technology"
                  className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 hover:text-[#70baff] transition-colors"
                >
                  Explore Tech Blogs &rarr;
                </Link>
              </div>
            </aside>
          </div>

          {/* BLOCK 2: INTERACTIVE CATEGORY FILTERS BAR + INSTANT SEARCH */}
          <div className="bg-[#111318] border border-neutral-800 p-4 sm:px-6 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400 mr-2">
                Category Filters:
              </span>

              {DEFAULT_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setVisibleCount(6);
                    }}
                    aria-pressed={isActive}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1365A4] text-white shadow-sm'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Filter Input */}
            <div className="relative w-full md:w-64 shrink-0">
              <label htmlFor="feed-filter-input" className="sr-only">
                Filter blogs by keyword
              </label>
              <input
                id="feed-filter-input"
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(6);
                }}
                placeholder="Search blog articles..."
                className="w-full border border-neutral-800 bg-neutral-950 pl-3.5 pr-8 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:border-[#1365A4] focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search filter"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          LOWER EDITORIAL GRID:
          LATEST BLOGS (2-Column Grid) + EDITOR'S CHOICE SIDEBAR
         ===================================================================== */}
      <div className="w-full bg-[#f4f5f7] py-12 sm:py-16 border-b border-neutral-200/80">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* LEFT: LATEST BLOGS (2-Column Grid) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-[#1365A4]" />
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-900">
                    Latest Blogs
                  </h3>
                  {selectedCategory !== 'all' && (
                    <span className="bg-[#1365A4]/10 text-[#1365A4] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {selectedCategory}
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-neutral-500">
                  Showing {displayedWirePosts.length} of {filteredWirePosts.length}
                </span>
              </div>

              {displayedWirePosts.length === 0 ? (
                <div className="bg-white border border-neutral-200 p-10 text-center">
                  <p className="text-sm font-bold text-neutral-800">
                    No blog articles match this filter yet.
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Try switching back to &ldquo;All&rdquo; categories or clearing your search query.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchTerm('');
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 bg-[#1365A4] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0e4c7c] transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {displayedWirePosts.map((post) => (
                      <article
                        key={post.slug}
                        className="group flex flex-col bg-white border border-neutral-200/90 shadow-xs transition-all duration-300 hover:shadow-md overflow-hidden"
                      >
                        {/* Thumbnail */}
                        <Link
                          href={`/posts/${post.slug}`}
                          className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 block"
                        >
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                          />

                          {/* Category Badge */}
                          <div className="absolute bottom-3 left-3 z-10">
                            <span className="inline-block bg-black/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-xs">
                              {post.category}
                            </span>
                          </div>
                        </Link>

                        {/* Card Body */}
                        <div className="flex flex-1 flex-col justify-between p-5">
                          <div>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium mb-2">
                              <time dateTime={post.date}>{post.date}</time>
                              <span>•</span>
                              <span>{post.readTimeMinutes}m read</span>
                            </div>

                            <h4 className="text-base sm:text-[17px] font-bold leading-snug text-neutral-900 group-hover:text-[#1365A4] transition-colors line-clamp-2">
                              <Link href={`/posts/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h4>

                            <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-neutral-600 line-clamp-2">
                              {post.excerpt}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-neutral-500 truncate">
                              By {post.author}
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <ShareButton
                                title={post.title}
                                url={`/posts/${post.slug}`}
                                variant="compact"
                              />
                              <Link
                                href={`/posts/${post.slug}`}
                                className="text-[11px] font-bold uppercase tracking-wider text-[#1365A4] hover:underline"
                              >
                                Read &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {visibleCount < filteredWirePosts.length && (
                    <div className="pt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                        className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-900 shadow-xs hover:border-[#1365A4] hover:text-[#1365A4] transition-colors cursor-pointer"
                      >
                        <span>Load More Blogs</span>
                        <span>({filteredWirePosts.length - visibleCount} remaining)</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT: EDITOR'S CHOICE / TOP CATEGORIES */}
            <aside
              aria-label="Editor's Choice and Top Categories"
              className="lg:col-span-4 space-y-6"
            >
              {/* Editor's Choice Box */}
              <div className="bg-white border border-neutral-200/90 shadow-xs p-6">
                <div className="flex items-center gap-2 border-b-2 border-neutral-900 pb-3 mb-4">
                  <span className="size-2 rounded-full bg-[#1365A4]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                    Editor&apos;s Choice
                  </h3>
                </div>

                <div className="space-y-3.5">
                  {editorsChoicePosts.map((pick) => (
                    <Link
                      key={pick.slug}
                      href={`/posts/${pick.slug}`}
                      className="group block border border-neutral-200 bg-neutral-50/70 p-4 transition-all hover:border-[#1365A4] hover:bg-white hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1365A4]">
                          {pick.category}
                        </span>
                        <span className="text-[10px] font-medium text-neutral-400">
                          {pick.readTimeMinutes}m read
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold leading-snug text-neutral-900 group-hover:text-[#1365A4] transition-colors line-clamp-2">
                        {pick.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top Categories Directory Box */}
              <div className="bg-[#0a0a0c] border border-neutral-800 text-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#70baff]">
                    Top Categories
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    Archive
                  </span>
                </div>

                <ul className="divide-y divide-neutral-800/80 text-xs">
                  {DEFAULT_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                    const count = blogPosts.filter((p) =>
                      matchesCategoryFilter(p.category, cat.id)
                    ).length;
                    return (
                      <li key={cat.id}>
                        <Link
                          href={`/category/${cat.id}`}
                          className="flex items-center justify-between py-2.5 text-neutral-300 hover:text-white transition-colors group"
                        >
                          <span className="font-semibold group-hover:translate-x-0.5 transition-transform">
                            {cat.label}
                          </span>
                          <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-300 group-hover:border-[#1365A4] group-hover:bg-[#1365A4] group-hover:text-white transition-colors">
                            {count}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
