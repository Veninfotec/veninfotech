import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/lib/posts';

interface RelatedPostsProps {
  posts: Post[];
  category?: string;
}

export default function RelatedPosts({ posts, category }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-posts-heading"
      className="max-w-4xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20"
    >
      <div className="border-t-2 border-[#111827] pt-8 sm:pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            {category && (
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1365A4] block mb-1">
                More in {category} &amp; Latest Coverage
              </span>
            )}
            <h2
              id="related-posts-heading"
              className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827]"
            >
              Related Articles
            </h2>
          </div>

          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-[#111827] transition-colors"
          >
            Browse All Stories &rarr;
          </Link>
        </div>

        <ol className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
          {posts.map((post, index) => {
            const rankLabel = String(index + 1).padStart(2, '0');
            const imageSrc = post.image || '/images/hero/hero-bg.jpg';

            return (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1365A4]"
                >
                  {/* Order Number */}
                  <div className="hidden sm:flex shrink-0 items-center justify-center w-9">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-1 ${
                        index === 0
                          ? 'bg-[#111827] text-white'
                          : 'bg-zinc-100 text-zinc-700 group-hover:bg-[#111827] group-hover:text-white transition-colors'
                      }`}
                    >
                      {rankLabel}
                    </span>
                  </div>

                  {/* Fixed Aspect Ratio Thumbnail */}
                  <div className="relative aspect-[16/10] w-full sm:w-44 md:w-48 shrink-0 overflow-hidden bg-zinc-100 border border-zinc-200">
                    <Image
                      src={imageSrc}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 192px"
                      className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Content Details */}
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="sm:hidden font-mono text-[10px] font-bold bg-[#111827] text-white px-1.5 py-0.5">
                          {rankLabel}
                        </span>
                        <span className="inline-block bg-[#111827] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {post.category || 'ARTICLE'}
                        </span>
                        <time
                          dateTime={post.date}
                          className="text-xs font-medium text-zinc-500"
                        >
                          {post.date}
                        </time>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold leading-snug text-[#111827] group-hover:text-[#1365A4] transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-medium">
                        {post.author || 'Editorial Team'}
                      </span>
                      <span className="font-bold uppercase tracking-wider text-[#111827] group-hover:text-[#1365A4] transition-colors">
                        Read &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
