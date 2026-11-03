import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import BreakingPopularSection from '@/components/BreakingPopularSection';
import EditorialFeedSection, { FeedPostItem } from '@/components/EditorialFeedSection';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';
import { getAllPosts, getNewsPosts, isNewsArticle } from '@/lib/posts';

export const instant = false; // Allows dynamic database queries on the homepage

interface HomePageProps {
  searchParams?: Promise<{ category?: string; search?: string }>;
}

function estimateReadMinutes(content?: string, excerpt?: string): number {
  const text = `${content || ''} ${excerpt || ''}`.trim();
  if (!text) return 3;
  const wordCount = text.split(/\s+/).length;
  return Math.max(2, Math.min(15, Math.ceil(wordCount / 180)));
}

export default async function HomePage(props: HomePageProps) {
  const searchParams = await props.searchParams;
  if (searchParams?.category) {
    redirect(`/category/${encodeURIComponent(searchParams.category.toLowerCase())}`);
  }

  // Fetch dedicated News articles for the Breaking & Recent News section
  const [{ breaking: newsBreaking, recent: newsRecent }, allPublishedPosts] = await Promise.all([
    getNewsPosts(),
    getAllPosts('published'),
  ]);

  const breakingPost = newsBreaking
    ? {
        id: String(newsBreaking.id ?? newsBreaking.slug),
        badge: newsBreaking.is_breaking ? '⚡ BREAKING NEWS' : 'LATEST STORY',
        category: (newsBreaking.category || 'NEWS').toUpperCase(),
        title: newsBreaking.title,
        date: newsBreaking.date,
        image: newsBreaking.image || '/images/hero/hero-bg.jpg',
        href: `/posts/${newsBreaking.slug}`,
        is_breaking: Boolean(newsBreaking.is_breaking),
      }
    : undefined;

  const popularPosts = newsRecent.map((p) => ({
    id: String(p.id ?? p.slug),
    categories: [(p.category || 'NEWS').toUpperCase()],
    title: p.title,
    excerpt: p.excerpt,
    image: p.image || '/images/hero/hero-bg.jpg',
    href: `/posts/${p.slug}`,
    date: p.date,
  }));

  // Strictly filter to regular BLOG posts only (never news articles)
  const publishedBlogs = (allPublishedPosts || []).filter((p) => !isNewsArticle(p));

  const feedPosts: FeedPostItem[] = publishedBlogs.map((p) => ({
    id: String(p.id ?? p.slug),
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: (p.category || 'TECHNOLOGY').toUpperCase(),
    image: p.image || '/images/hero/hero-bg.jpg',
    date: p.date,
    timestamp: p.timestamp,
    author: p.author || 'Editorial Team',
    views: Number(p.views || 0),
    readTimeMinutes: estimateReadMinutes(p.content, p.excerpt),
    post_type: p.post_type,
    is_breaking: p.is_breaking,
  }));

  return (
    <>
      <Navbar />

      <main>
        {/* Full-width Hero Section with background spanning entire screen */}
        <Suspense
          fallback={
            <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-full bg-neutral-950 animate-pulse" />
          }
        >
          <HeroBanner />
        </Suspense>

        {/* Breaking News Spotlight & Recent News Section */}
        {breakingPost && (
          <BreakingPopularSection breaking={breakingPost} popular={popularPosts} />
        )}

        {/* Featured Editorial Feed, Most Popular Widget, Category Filters & Latest Wire */}
        <EditorialFeedSection
          posts={feedPosts}
          initialSearch={searchParams?.search || ''}
        />
      </main>

      <Footer />
    </>
  );
}
