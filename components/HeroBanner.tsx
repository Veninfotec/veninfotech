import { getLatestPosts } from '@/lib/posts';
import HeroBannerClient, { HeroItem } from './HeroBannerClient';
import Link from 'next/link';

export default async function HeroBanner() {
  const posts = await getLatestPosts(5);

  // If real published blogs exist, display strictly the dynamic uploaded blogs (up to 5 recent)
  if (posts && posts.length > 0) {
    const items: HeroItem[] = posts.slice(0, 5).map((post, index) => ({
      id: String(post.id ?? post.slug ?? `post-${index}`),
      badge: index === 0 ? 'LATEST STORY' : 'FEATURED',
      category: (post.category || 'BLOG').toUpperCase(),
      date: post.date,
      title: post.title,
      excerpt: post.excerpt,
      image: post.image || '/images/hero/hero-bg.jpg',
      href: `/posts/${post.slug}`,
    }));

    return <HeroBannerClient items={items} />;
  }

  // Clean Welcome Hero when 0 blogs are uploaded yet (no fake blogs, no admin links)
  return (
    <section
      aria-label="Welcome Hero"
      className="relative flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] w-full flex-col justify-center overflow-hidden bg-neutral-950 text-white shadow-2xl"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/40 via-neutral-950/90 to-neutral-950" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1170px] flex-col justify-center px-4 py-16 sm:px-6">
        <div className="max-w-2xl animate-hero-fade">
          <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-[#70baff] backdrop-blur-md">
            <span className="size-2 rounded-full bg-[#1365A4] animate-pulse" />
            <span>VIT EDITORIAL DESK</span>
          </div>

          <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Independent News &amp; Technology Publication
          </h1>

          <p className="mt-4 text-base text-neutral-300 leading-relaxed">
            Welcome to the live platform. Verified stories, analysis, and breaking articles will appear here automatically as our editorial team publishes them.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link
              href="#latest-games"
              className="inline-flex items-center gap-2 bg-[#1365A4] hover:bg-[#0e4c7c] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 transition-all shadow-lg shadow-[#1365A4]/30"
            >
              <span>Explore Portal Feeds</span>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
