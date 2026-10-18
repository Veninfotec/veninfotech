import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import BreakingPopularSection from '@/components/BreakingPopularSection';
import ProductCommunitySection from '@/components/ProductCommunitySection';
import SponsorBar from '@/components/SponsorBar';
import LatestGamesGrid from '@/components/LatestGamesGrid';
import NewsList from '@/components/NewsList';
import SidebarTopRated from '@/components/SidebarTopRated';
import SidebarFeatured from '@/components/SidebarFeatured';
import BlogSection from '@/components/BlogSection';
import ForumSection from '@/components/ForumSection';
import Footer from '@/components/Footer';
import Skeleton from '@/components/ui/Skeleton';
import {
  getFeaturedGame,
  getForumThreads,
  getLatestGames,
  getSponsors,
  getTopReviewers,
} from '@/lib/cms';

import { redirect } from 'next/navigation';
import { getAllPosts } from '@/lib/posts';

export const instant = false; // Allows dynamic database queries on the homepage

/*
 * Loaders keep the presentational components prop-driven. The await lives here,
 * inside <Suspense>, so a future CMS/API fetch streams in instead of blocking
 * the static shell (required by cacheComponents).
 */
async function SponsorsLoader() {
  return <SponsorBar sponsors={await getSponsors()} />;
}
async function GamesLoader() {
  return <LatestGamesGrid title="Latest games" games={await getLatestGames()} />;
}
async function TopRatedLoader() {
  return <SidebarTopRated reviewers={await getTopReviewers()} />;
}
async function FeaturedLoader() {
  return <SidebarFeatured game={await getFeaturedGame()} />;
}
async function ForumLoader() {
  return <ForumSection threads={await getForumThreads()} />;
}

interface HomePageProps {
  searchParams?: Promise<{ category?: string; search?: string }>;
}

export default async function HomePage(props: HomePageProps) {
  const searchParams = await props.searchParams;
  if (searchParams?.category) {
    redirect(`/category/${encodeURIComponent(searchParams.category.toLowerCase())}`);
  }

  const allPosts = await getAllPosts('published');
  const extraPosts = allPosts.slice(5);

  const breakingPost = extraPosts[0]
    ? {
        id: String(extraPosts[0].id ?? extraPosts[0].slug),
        badge: 'ARCHIVE',
        category: (extraPosts[0].category || 'NEWS').toUpperCase(),
        title: extraPosts[0].title,
        date: extraPosts[0].date,
        image: extraPosts[0].image || '/images/hero/hero-bg.jpg',
        href: `/posts/${extraPosts[0].slug}`,
      }
    : undefined;

  const popularPosts = extraPosts.slice(1, 5).map((p) => ({
    id: String(p.id ?? p.slug),
    categories: [(p.category || 'NEWS').toUpperCase()],
    title: p.title,
    excerpt: p.excerpt,
    image: p.image || '/images/hero/hero-bg.jpg',
    href: `/posts/${p.slug}`,
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

        {/* More Stories & Archive Feed (Only renders if real published posts exist beyond the 5 Hero stories) */}
        {breakingPost && (
          <BreakingPopularSection breaking={breakingPost} popular={popularPosts} />
        )}

        {/* Product Reviews & Community Q&A Section */}
        {/* <ProductCommunitySection /> */}
      </main>

      <Footer />
    </>
  );
}