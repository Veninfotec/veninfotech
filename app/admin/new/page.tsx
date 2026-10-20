'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CATEGORY_OPTIONS = [
  'Technology',
  'Culture',
  'Economy',
  'Politics',
  'Science',
  'Travel',
  'World',
  'Gaming',
  'AI & Software',
  'Reviews',
];

const PRESET_IMAGES = [
  { label: 'Cyberpunk / Tech', url: '/images/hero/hero-bg.jpg' },
  { label: 'Crypto & Assets', url: '/images/hero/trending-bitcoin.jpg' },
  { label: 'Ocean Ecosystem', url: '/images/hero/trending-ocean.jpg' },
  { label: 'Smart City', url: '/images/hero/breaking-city.jpg' },
  { label: 'Backcountry Trails', url: '/images/hero/trending-hikers.jpg' },
];

export default function NewPostAdminPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState('Technology');
  const [customCategory, setCustomCategory] = useState('');
  const [author, setAuthor] = useState('Editorial Team');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('/images/hero/hero-bg.jpg');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Form Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    slug: string;
    path: string;
    file: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-generate URL slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugTouched) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleReset = () => {
    setTitle('');
    setSlug('');
    setSlugTouched(false);
    setCategory('Technology');
    setCustomCategory('');
    setAuthor('Editorial Team');
    setExcerpt('');
    setContent('');
    setImage('/images/hero/hero-bg.jpg');
    setStatus('published');
    setSuccessInfo(null);
    setErrorMessage(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (!title.trim()) {
      setErrorMessage('Please enter an Article Title.');
      return;
    }

    if (!content.trim()) {
      setErrorMessage('Please provide Article Content in Markdown.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCategory =
        category === 'Other' && customCategory.trim()
          ? customCategory.trim()
          : category;

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        category: finalCategory,
        author: author.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        image: image.trim(),
        status,
      };

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessInfo({
          slug: data.slug,
          path: data.path,
          file: data.file,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.error || 'Failed to publish article. Please check input.');
      }
    } catch {
      setErrorMessage('An unexpected network error occurred while communicating with the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 font-sans selection:bg-[#1365A4] selection:text-white flex flex-col">
      {/* Top Internal Admin Navigation Bar */}
      <header className="border-b border-neutral-800 bg-[#0f1219]/95 backdrop-blur-md sticky top-0 z-30 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-[#1365A4] shadow-[0_0_8px_#1365A4]" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              VIT Admin Desk
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            <Link
              href="/admin/blogs"
              className="text-neutral-400 hover:text-white font-semibold transition-colors"
            >
              All Articles
            </Link>
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-neutral-400 hover:text-white font-semibold transition-colors"
            >
              <span>Live Site ↗</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-rose-400 hover:text-rose-300 font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </button>
          </div>
        </div>
      </header>

      {/* Centered Main Document Canvas */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-3xl">
          {/* Centered Document Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1365A4]/40 bg-[#1365A4]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#70baff] mb-3">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Article Publishing Template</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              New Publication Template
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
              Compose and submit your article below. It will automatically generate formatted Markdown with frontmatter and update live feeds.
            </p>
          </div>

          {/* Success Alert Banner */}
          {successInfo && (
            <div className="mb-8 border border-emerald-500/40 bg-emerald-950/30 p-5 rounded-lg shadow-xl animate-hero-fade">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 text-xl font-bold">✓</span>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                      Article Successfully Published!
                    </h3>
                    <p className="mt-1 text-xs text-neutral-300">
                      Article successfully saved to database and live at{' '}
                      <code className="text-emerald-400 font-mono font-bold">{successInfo.path}</code>.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Link
                        href={successInfo.path}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors shadow-md"
                      >
                        <span>View Live Article &rarr;</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded transition-colors"
                      >
                        Create Another Article
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSuccessInfo(null)}
                  className="text-neutral-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Error Alert Banner */}
          {errorMessage && (
            <div className="mb-8 border border-rose-500/40 bg-rose-950/30 p-4 rounded-lg shadow-xl flex items-center justify-between gap-3 animate-hero-fade">
              <div className="flex items-center gap-3 text-rose-300 text-xs font-semibold">
                <span className="text-rose-400 text-base">⚠️</span>
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Center-Aligned Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#12161f] border border-neutral-800 rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 space-y-7"
          >
            {/* Title & URL Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label
                  htmlFor="article-title"
                  className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2"
                >
                  Article Title <span className="text-rose-400">*</span>
                </label>
                <input
                  id="article-title"
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Next-Generation AI Silicon"
                  className="w-full bg-[#0a0a0c] border border-neutral-700 rounded-md px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4] transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="article-slug"
                  className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2"
                >
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="bg-[#0a0a0c] px-3 py-2.5 text-xs text-neutral-400 border border-r-0 border-neutral-700 rounded-l-md font-mono select-none">
                    /posts/
                  </span>
                  <input
                    id="article-slug"
                    type="text"
                    disabled={isSubmitting}
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugTouched(true);
                    }}
                    placeholder="custom-slug"
                    className="w-full bg-[#0a0a0c] border border-neutral-700 rounded-r-md px-3 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#1365A4] transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Category & Author & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              <div>
                <label
                  htmlFor="article-category"
                  className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2"
                >
                  Category
                </label>
                <select
                  id="article-category"
                  disabled={isSubmitting}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-neutral-700 rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#1365A4] transition-colors disabled:opacity-50"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Other">Custom Category...</option>
                </select>

                {category === 'Other' && (
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="mt-2 w-full bg-[#0a0a0c] border border-neutral-700 rounded-md px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4]"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="article-author"
                  className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2"
                >
                  Author / Desk
                </label>
                <input
                  id="article-author"
                  type="text"
                  disabled={isSubmitting}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Editorial Team"
                  className="w-full bg-[#0a0a0c] border border-neutral-700 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4] transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Publication Status
                </span>
                <div className="flex items-center gap-4 pt-2">
                  <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      disabled={isSubmitting}
                      checked={status === 'published'}
                      onChange={() => setStatus('published')}
                      className="accent-[#1365A4]"
                    />
                    <span className="text-emerald-400 font-semibold">Live Feed</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      disabled={isSubmitting}
                      checked={status === 'draft'}
                      onChange={() => setStatus('draft')}
                      className="accent-[#1365A4]"
                    />
                    <span className="text-amber-400 font-semibold">Draft</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Excerpt / Summary */}
            <div>
              <label
                htmlFor="article-excerpt"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2"
              >
                Article Excerpt / Teaser
              </label>
              <textarea
                id="article-excerpt"
                rows={2}
                disabled={isSubmitting}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A concise summary highlighting the key points of the story..."
                className="w-full bg-[#0a0a0c] border border-neutral-700 rounded-md p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4] transition-colors disabled:opacity-50 leading-relaxed"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label
                htmlFor="article-image"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2"
              >
                Featured Cover Image URL
              </label>
              <input
                id="article-image"
                type="text"
                disabled={isSubmitting}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="e.g. /images/hero/hero-bg.jpg or https://..."
                className="w-full bg-[#0a0a0c] border border-neutral-700 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4] transition-colors disabled:opacity-50"
              />

              {/* Presets */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                  Presets:
                </span>
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                      image === preset.url
                        ? 'border-[#1365A4] bg-[#1365A4]/20 text-[#70baff] font-bold'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Markdown Content Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="article-content"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-300"
                >
                  Article Markdown Content <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {content.length} chars • {content.trim() ? content.trim().split(/\s+/).length : 0} words
                </span>
              </div>

              <textarea
                id="article-content"
                rows={14}
                required
                disabled={isSubmitting}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`# Headline

Write your report in Markdown format...

## Subheading

- Bullet point
- Another point

> Insight or notable quote

Detailed paragraph...`}
                className="w-full bg-[#0a0a0c] border border-neutral-700 rounded-md p-4 font-mono text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#1365A4] transition-colors disabled:opacity-50 leading-relaxed resize-y"
              />
            </div>

            {/* Center-Aligned Action Buttons */}
            <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
              >
                Reset Template
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1365A4] hover:bg-[#0e4c7c] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded shadow-lg shadow-[#1365A4]/30 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Writing Markdown &amp; Publishing...</span>
                  </>
                ) : (
                  <>
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span>Publish Article</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
