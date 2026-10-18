import Link from 'next/link';
import Cover from '@/components/ui/Cover';
import { getLatestPosts } from '@/lib/posts';
import ShareButton from '@/components/ShareButton';

export default async function BlogSection({ count = 3 }: { count?: number }) {
  const posts = await getLatestPosts(count);

  return (
    <section aria-labelledby="blog-heading">
      <h2 id="blog-heading" className="text-lg font-bold text-white">From our blog</h2>
      <div className="mt-1 h-0.5 w-12 bg-brand" />
      <p className="mt-2 text-xs text-neutral-500">The latest stories, straight from the editors.</p>

      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">No posts yet.</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {posts.map((post) => (
            <li key={post.slug} className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={`/posts/${post.slug}`}
                tabIndex={-1}
                aria-hidden
                className="relative h-40 w-full shrink-0 overflow-hidden bg-night-2 sm:h-36 sm:w-60"
              >
                <Cover src={post.image} seed={post.slug} sizes="240px" />
              </Link>
              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold leading-snug text-white">
                    <Link href={`/posts/${post.slug}`} className="hover:text-brand">{post.title}</Link>
                  </h3>
                  <p className="mt-1 text-[11px] text-brand">
                    {post.date} · {post.views.toLocaleString('en-US')} views
                  </p>
                  <p className="mt-2 line-clamp-3 text-xs text-neutral-400">{post.excerpt}</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 pt-2">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand hover:underline"
                  >
                    Read post →
                  </Link>
                  <ShareButton
                    title={post.title}
                    url={`/posts/${post.slug}`}
                    variant="compact"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
