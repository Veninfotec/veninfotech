import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getDayGroupedNews } from '@/lib/posts';

export const instant = false;

export const metadata: Metadata = {
  title: 'News Desk • Verified Dispatches & Real-Time Wire | VIT',
  description:
    'Real-time verified reporting, breaking news developments, and global coverage from the Veninfotech newsroom.',
  alternates: {
    canonical: '/news',
  },
  openGraph: {
    title: 'News Desk • Verified Dispatches & Real-Time Wire | VIT',
    description:
      'Real-time verified reporting, breaking news developments, and global coverage from the Veninfotech newsroom.',
    url: 'https://veninfotech.net/news',
    siteName: 'Veninfotech',
    type: 'website',
  },
};

export default async function NewsPage() {
  const dayGroups = await getDayGroupedNews();

  const recentGroup = dayGroups.length > 0 ? dayGroups[0] : null;
  const previousGroups = dayGroups.length > 1 ? dayGroups.slice(1) : [];

  const totalStories = dayGroups.reduce((acc, g) => acc + g.posts.length, 0);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col selection:bg-[#1365A4] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Newsroom Hero Header */}
        <header className="bg-[#0a0a0c] text-white border-b border-neutral-800 py-10 sm:py-14">
          <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-6">
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#70baff] font-semibold">News Desk</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#1365A4] border border-[#1365A4]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-3">
                  <span>Real-Time News Wire</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                  Global News &amp; Field Reports
                </h1>

                <p className="mt-2.5 text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
                  Verified reporting, breaking developments, and analytical journalism from the Veninfotech editorial desk.
                </p>
              </div>

              {/* Status Pill & Live Metrics */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-2 border border-neutral-800 bg-[#12161f] px-3.5 py-2 text-xs font-semibold text-neutral-300 shadow-sm">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span>{totalStories} {totalStories === 1 ? 'Live Story' : 'Live Stories'}</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Feeds */}
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-6 py-8 sm:py-12">
          {dayGroups.length === 0 ? (
            /* Empty State */
            <div className="rounded-xl border border-neutral-200 bg-white p-12 sm:p-16 text-center shadow-sm">
              <span className="text-5xl">📰</span>
              <h2 className="mt-4 text-xl sm:text-2xl font-bold text-neutral-900">
                No News Articles Published Yet
              </h2>
              <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                Our news wire is currently being prepped. Check back shortly for real-time verified reporting and global updates.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/"
                  className="bg-[#1365A4] hover:bg-[#0e4c7c] text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-colors shadow-sm rounded"
                >
                  &larr; Back to Home Feed
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {/* SECTION 1: RECENT DAY NEWS (CARDS VIEW) */}
              {recentGroup && (
                <section aria-labelledby="recent-day-heading" className="space-y-6">
                  {/* Recent Day Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-neutral-300">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block size-2.5 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-red-600">
                          {recentGroup.relativeLabel === 'Today' ? 'Live Today' : 'Most Recent Day'}
                        </span>
                      </div>
                      <h2
                        id="recent-day-heading"
                        className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mt-0.5"
                      >
                        {recentGroup.formattedDate}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                          <path d="M4 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4Zm3 2h6v4H7V5Zm8 0h1v4h-1V5ZM4 5h1v4H4V5Zm0 6h12v4H4v-4Z" />
                        </svg>
                        <span>Cards View</span>
                      </span>
                      <span className="text-xs font-semibold text-neutral-500">
                        {recentGroup.posts.length} {recentGroup.posts.length === 1 ? 'story' : 'stories'}
                      </span>
                    </div>
                  </div>

                  {/* CARDS VIEW GRID: Modern Responsive Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                    {recentGroup.posts.map((post, idx) => (
                      <article
                        key={post.slug || post.id || idx}
                        className="group flex flex-col bg-white border border-neutral-200/90 rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                      >
                        <Link href={`/posts/${post.slug}`} className="flex flex-col h-full">
                          {/* Card Thumbnail */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
                            {post.image ? (
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                priority={idx === 0}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-neutral-600 bg-neutral-900 text-3xl">
                                📰
                              </div>
                            )}

                            {/* Overlaid Badges */}
                            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                              {post.is_breaking && (
                                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-md">
                                  <span className="size-1.5 rounded-full bg-white animate-ping" />
                                  <span>Breaking</span>
                                </span>
                              )}
                              <span className="bg-black/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm backdrop-blur-[2px]">
                                {post.category || 'NEWS'}
                              </span>
                            </div>

                            {/* Views badge bottom right */}
                            <div className="absolute bottom-2.5 right-2.5 z-10">
                              <span className="bg-black/75 text-neutral-200 text-[10px] font-mono px-2 py-0.5 shadow-sm backdrop-blur-[2px]">
                                {(post.views || 0).toLocaleString('en-US')} views
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 flex flex-1 flex-col justify-between">
                            <div>
                              {/* Metadata line */}
                              <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                                <span>{post.date}</span>
                                <span>•</span>
                                <span>{post.author || 'Newsroom'}</span>
                              </div>

                              {/* Title */}
                              <h3 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-[#1365A4] transition-colors line-clamp-3">
                                {post.title}
                              </h3>

                              {/* Excerpt */}
                              {post.excerpt && (
                                <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>

                            {/* Read More Link */}
                            <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#1365A4] uppercase tracking-wider">
                              <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                <span>Read Full Report</span>
                                <span>&rarr;</span>
                              </span>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION 2: PREVIOUS DAYS (LIST VIEW WITH CLEAR DAY SEPARATION) */}
              {previousGroups.length > 0 && (
                <section aria-labelledby="previous-days-heading" className="space-y-10 pt-4">
                  {/* Previous Coverage Section Title */}
                  <div className="border-t border-neutral-300 pt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                          News Archive by Day
                        </span>
                        <h2
                          id="previous-days-heading"
                          className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900"
                        >
                          Previous Coverage
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500">
                        Grouped chronologically in detailed list view
                      </span>
                    </div>
                  </div>

                  {/* Day-by-Day Separation */}
                  {previousGroups.map((dayGroup) => (
                    <div key={dayGroup.dateKey} className="space-y-4">
                      {/* Prominent Day Separation Header */}
                      <div className="flex items-center justify-between bg-neutral-900 text-white px-4 sm:px-6 py-3 rounded-none shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-base sm:text-lg">🗓️</span>
                          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide">
                            <span className="text-[#70baff] font-extrabold mr-2">
                              {dayGroup.relativeLabel}:
                            </span>
                            <span>{dayGroup.formattedDate}</span>
                          </h3>
                        </div>

                        <span className="bg-neutral-800 text-neutral-300 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded">
                          {dayGroup.posts.length} {dayGroup.posts.length === 1 ? 'Article' : 'Articles'}
                        </span>
                      </div>

                      {/* LIST VIEW: Clean horizontal rows clearly highlighting what each news is about */}
                      <div className="space-y-3.5">
                        {dayGroup.posts.map((post, idx) => (
                          <article
                            key={post.slug || post.id || idx}
                            className="group bg-white border border-neutral-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5"
                          >
                            <Link
                              href={`/posts/${post.slug}`}
                              className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
                            >
                              {/* Left Thumbnail (Desktop horizontal, mobile top) */}
                              <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full sm:w-52 md:w-60 shrink-0 overflow-hidden bg-neutral-950">
                                {post.image ? (
                                  <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 240px"
                                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center text-neutral-600 bg-neutral-900">
                                    📰
                                  </div>
                                )}

                                {/* Category Badge */}
                                <div className="absolute top-2.5 left-2.5">
                                  <span className="bg-black/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
                                    {post.category || 'NEWS'}
                                  </span>
                                </div>
                              </div>

                              {/* Right Content: Clearly showing what the news is about */}
                              <div className="flex-1 flex flex-col justify-between min-w-0 w-full">
                                <div>
                                  {/* Byline / Date line */}
                                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                                    <span className="text-[#1365A4] font-bold">
                                      {post.category || 'NEWS'}
                                    </span>
                                    <span>•</span>
                                    <span>{post.date}</span>
                                    <span>•</span>
                                    <span>By {post.author || 'Newsroom'}</span>
                                    {post.is_breaking && (
                                      <>
                                        <span>•</span>
                                        <span className="text-red-600 font-bold">⚡ BREAKING</span>
                                      </>
                                    )}
                                  </div>

                                  {/* Headline */}
                                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 leading-snug group-hover:text-[#1365A4] transition-colors">
                                    {post.title}
                                  </h4>

                                  {/* What the news is about: Clear, generous summary */}
                                  {post.excerpt && (
                                    <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
                                      {post.excerpt}
                                    </p>
                                  )}
                                </div>

                                {/* Read More & Stats */}
                                <div className="mt-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                                  <span className="font-bold text-[#1365A4] group-hover:underline uppercase tracking-wider inline-flex items-center gap-1">
                                    <span>Read Full Coverage</span>
                                    <span>&rarr;</span>
                                  </span>

                                  <span className="text-neutral-400 font-mono text-[11px]">
                                    {(post.views || 0).toLocaleString('en-US')} views
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
