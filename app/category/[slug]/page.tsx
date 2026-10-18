import { getPostsByCategory } from '@/lib/posts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  culture: 'Culture',
  economy: 'Economy',
  politics: 'Politics',
  science: 'Science',
  technology: 'Technology',
  tech: 'Technology',
  travel: 'Travel',
  world: 'World',
  gaming: 'Gaming',
  'ai-software': 'AI & Software',
  reviews: 'Reviews',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug).toLowerCase();
  const title = CATEGORY_NAMES[decoded] || decoded.charAt(0).toUpperCase() + decoded.slice(1);
  return {
    title: `${title} Articles`,
    description: `Explore the latest articles, reporting, and engineering updates in ${title} on Veninfotech.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const categoryDisplayName =
    CATEGORY_NAMES[decodedSlug] ||
    decodedSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const posts = await getPostsByCategory(decodedSlug);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Category Header Hero */}
        <header className="bg-[#0a0a0c] text-white border-b border-neutral-800 py-12 sm:py-16">
          <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-6">
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-neutral-500">Categories</span>
              <span>/</span>
              <span className="text-[#70baff] font-semibold">{categoryDisplayName}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-block bg-[#1365A4] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white mb-2.5">
                  Category Archive
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                  {categoryDisplayName}
                </h1>
                <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-2xl">
                  Curated stories, deep-dives, and verified reporting in {categoryDisplayName}.
                </p>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-300">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span>{posts.length} {posts.length === 1 ? 'Article' : 'Articles'}</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Category Articles Feed */}
        <section className="py-10 sm:py-14">
          <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-6">
            {posts.length === 0 ? (
              <div className="rounded border border-neutral-200 bg-white p-12 sm:p-16 text-center shadow-sm">
                <span className="text-4xl">📂</span>
                <h2 className="mt-4 text-xl font-bold text-neutral-900">
                  No articles published in {categoryDisplayName} yet
                </h2>
                <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto">
                  New stories in this category will appear here as soon as our editorial desk publishes them.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link
                    href="/"
                    className="bg-[#1365A4] hover:bg-[#0e4c7c] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-colors"
                  >
                    &larr; Back to Home Feed
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="group flex flex-col bg-white border border-neutral-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Link href={`/posts/${post.slug}`} className="flex flex-col h-full">
                      {/* Thumbnail with overlay badge */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-neutral-600">
                            📰
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="bg-black/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
                            {post.category || categoryDisplayName}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.author || 'Editorial'}</span>
                          </div>

                          <h3 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-[#1365A4] transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p className="mt-2 text-xs sm:text-sm text-neutral-500 line-clamp-3 leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-400">
                          <span className="text-[#1365A4] group-hover:underline">Read article &rarr;</span>
                          <span className="font-mono text-[11px]">
                            {(post.views || 0).toLocaleString('en-US')} views
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
