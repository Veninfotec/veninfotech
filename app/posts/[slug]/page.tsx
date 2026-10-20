import { getPostBySlug } from '@/lib/posts';
import { sql } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ShareButton from '@/components/ShareButton';

export const instant = false; // Prevents Next.js prerender blocking errors on dynamic DB calls

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch post from database (with fallback to markdown)
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <span className="text-4xl">📰</span>
          <h1 className="text-3xl font-bold mt-4 mb-2 text-zinc-900">Post not found</h1>
          <p className="text-zinc-500 mb-6 text-sm">
            The article you are looking for does not exist or may have been unpublished.
          </p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 transition-colors"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Increment view count in Neon DB
  let currentViews = post.views || 0;
  try {
    const updated = await sql`
      INSERT INTO post_views (slug, view_count) 
      VALUES (${slug}, 1) 
      ON CONFLICT (slug) 
      DO UPDATE SET view_count = post_views.view_count + 1
      RETURNING view_count;
    `;
    if (updated && updated.length > 0) {
      currentViews = Number(updated[0].view_count);
    }
  } catch (err) {
    console.error('Failed to increment view count:', err);
  }

  const contentToRender = post.content || post.excerpt || '';

  return (
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <span>&larr; Back to Home</span>
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
            <span className="bg-zinc-900 text-white px-2.5 py-0.5 text-[11px] font-bold">
              {post.category || 'BLOG'}
            </span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>By {post.author || 'Editorial Team'}</span>
            <span>•</span>
            <span className="font-mono text-zinc-500">{currentViews.toLocaleString('en-US')} views</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal border-l-2 border-zinc-900 pl-4 italic">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Featured Cover Image */}
        {post.image && (
          <div className="relative w-full h-[260px] sm:h-[420px] md:h-[480px] overflow-hidden rounded-lg mb-10 bg-zinc-100 shadow-md border border-zinc-200">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Article Body using ReactMarkdown with Custom Component Spacing */}
        <div className="max-w-none text-zinc-700 text-base sm:text-lg leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-6 leading-relaxed">{children}</p>,
              h2: ({ children }) => (
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-10 mb-4 pb-2 border-b border-zinc-100">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold text-zinc-900 mt-8 mb-3">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-bold text-zinc-900 mt-6 mb-2">{children}</h4>
              ),
              ul: ({ children }) => <ul className="list-disc pl-6 my-6 space-y-2.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 my-6 space-y-2.5">{children}</ol>,
              li: ({ children }) => <li className="my-1.5 leading-relaxed text-zinc-700">{children}</li>,
              strong: ({ children }) => <strong className="font-bold text-zinc-900">{children}</strong>,
              hr: () => <hr className="my-10 border-zinc-200" />,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#1365A4] bg-zinc-50/70 pl-4 py-2 my-6 italic text-zinc-700 rounded-r">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-8 border border-zinc-200 rounded-xl shadow-sm bg-white">
                  <table className="w-full min-w-[500px] border-collapse text-left text-sm sm:text-base">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-zinc-100/90 text-zinc-900 font-bold border-b border-zinc-200 uppercase text-xs tracking-wider">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-zinc-50/80 transition-colors even:bg-zinc-50/40">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 sm:px-6 sm:py-3.5 font-bold text-zinc-900 text-xs sm:text-sm">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 sm:px-6 sm:py-3.5 text-zinc-700 text-xs sm:text-sm align-middle leading-normal">
                  {children}
                </td>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1365A4] hover:underline underline-offset-2 font-medium"
                >
                  {children}
                </a>
              ),
            }}
          >
            {contentToRender}
          </ReactMarkdown>
        </div>

        {/* Share Section at the bottom of the blog */}
        <div className="mt-12">
          <ShareButton
            title={post.title}
            excerpt={post.excerpt}
            url={`/posts/${post.slug}`}
          />
        </div>

        {/* Footer / Author Bar */}
        <div className="mt-10 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-white text-sm">
              {(post.author || 'E').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{post.author || 'Editorial Team'}</p>
              <p className="text-xs text-zinc-500">Published on {post.date}</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900"
          >
            <span>&larr; More stories on feed</span>
          </Link>
        </div>
      </article>
    </main>
  );
}