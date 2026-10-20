'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostData {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  status: 'draft' | 'published';
  author: string;
  views?: number;
  date?: string;
}

const CATEGORY_OPTIONS = [
  'TECH',
  'GAMING',
  'AI & SOFTWARE',
  'HARDWARE',
  'REVIEWS',
  'WORLD NEWS',
  'ECONOMY',
  'SCIENCE',
];

const CURATED_PRESETS = [
  { label: 'Cyberpunk / Tech', url: '/images/hero/hero-bg.jpg' },
  { label: 'Crypto & Assets', url: '/images/hero/trending-bitcoin.jpg' },
  { label: 'Ocean Ecosystem', url: '/images/hero/trending-ocean.jpg' },
  { label: 'Smart City', url: '/images/hero/breaking-city.jpg' },
  { label: 'Backcountry Trails', url: '/images/hero/trending-hikers.jpg' },
];

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState('TECH');
  const [author, setAuthor] = useState('Editorial Team');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('/images/hero/hero-bg.jpg');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Load all posts (including drafts)
  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts?status=all');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/posts?status=all');
        const data = await res.json();
        if (!ignore && data.success) {
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Failed to fetch initial posts:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Auto-generate slug when title changes (unless user manually customized slug)
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

  // Open editor for a new post
  const openNewPostEditor = () => {
    setEditingPostId(null);
    setTitle('');
    setSlug('');
    setSlugTouched(false);
    setCategory('TECH');
    setAuthor('Editorial Team');
    setExcerpt('');
    setContent('# New Article\n\nWrite your blog story here in markdown...');
    setImage('/images/hero/hero-bg.jpg');
    setStatus('published');
    setEditorMode('write');
    setIsEditorOpen(true);
  };

  // Open editor for an existing post
  const openEditPostEditor = (p: PostData) => {
    setEditingPostId(p.id ?? null);
    setTitle(p.title);
    setSlug(p.slug);
    setSlugTouched(true);
    setCategory(p.category || 'TECH');
    setAuthor(p.author || 'Editorial Team');
    setExcerpt(p.excerpt || '');
    setContent(p.content || '');
    setImage(p.image || '/images/hero/hero-bg.jpg');
    setStatus(p.status || 'published');
    setEditorMode('write');
    setIsEditorOpen(true);
  };

  // Show notification helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle Cover Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImage(data.url);
        showNotification('success', 'Image uploaded successfully!');
      } else {
        showNotification('error', data.error || 'Failed to upload image');
      }
    } catch {
      showNotification('error', 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Post (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showNotification('error', 'Please enter a title');
      return;
    }
    if (!content.trim()) {
      showNotification('error', 'Please write some content');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        category,
        author: author.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        image: image.trim(),
        status,
      };

      if (editingPostId) {
        // Update existing
        const res = await fetch(`/api/posts/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', 'Blog post updated successfully!');
          setIsEditorOpen(false);
          await loadPosts();
        } else {
          showNotification('error', data.error || 'Failed to update post');
        }
      } else {
        // Create new
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', 'New blog post published successfully!');
          setIsEditorOpen(false);
          await loadPosts();
        } else {
          showNotification('error', data.error || 'Failed to create post');
        }
      }
    } catch {
      showNotification('error', 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Status (Publish / Draft)
  const handleToggleStatus = async (post: PostData) => {
    if (!post.id) return;
    const newStatus = post.status === 'published' ? 'draft' : 'published';

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(
          'success',
          `Post is now ${newStatus === 'published' ? 'Live on Feed' : 'Saved as Draft'}`,
        );
        await loadPosts();
      }
    } catch {
      showNotification('error', 'Failed to toggle status');
    }
  };

  // Delete Post
  const handleDeletePost = async (post: PostData) => {
    if (!post.id) return;
    const confirm = window.confirm(
      `Are you sure you want to permanently delete "${post.title}"?`,
    );
    if (!confirm) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Blog post removed permanently');
        await loadPosts();
      }
    } catch {
      showNotification('error', 'Failed to delete post');
    }
  };

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    const matchesFilter =
      filter === 'all' ? true : filter === 'published' ? p.status === 'published' : p.status === 'draft';
    const matchesSearch =
      searchQuery === ''
        ? true
        : p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d0f14] text-neutral-100 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-md px-4 py-3 shadow-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-950/50'
              : 'bg-rose-600 text-white shadow-rose-950/50'
          }`}
        >
          <span>{notification.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Studio Navbar */}
      <header className="border-b border-neutral-800 bg-[#12161f] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs uppercase tracking-wider font-semibold"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5m7 7-7-7 7-7" />
              </svg>
              <span>Live Website</span>
            </Link>

            <span className="text-neutral-700">|</span>

            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#1365A4] animate-pulse" />
              <h1 className="text-base font-bold tracking-tight text-white uppercase">
                Editorial Blog Studio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-2 bg-[#1365A4] hover:bg-[#0e4c7c] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-none shadow-md transition-all active:scale-95"
            >
              {/* <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 5v14M5 12h14" />
              </svg> */}
              <span>Create New Article</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                await fetch('/api/admin/auth', { method: 'DELETE' });
                window.location.href = '/admin/login';
              }}
              className="border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-rose-300 text-xs font-semibold uppercase tracking-wider px-3 py-2 transition-colors"
              title="Log out of admin portal"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141923] border border-neutral-800 p-4 rounded-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Total Posts
            </span>
            <p className="mt-1 text-2xl font-black text-white">{posts.length}</p>
          </div>

          <div className="bg-[#141923] border border-neutral-800 p-4 rounded-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Published on Feed
            </span>
            <p className="mt-1 text-2xl font-black text-white">{publishedCount}</p>
          </div>

          <div className="bg-[#141923] border border-neutral-800 p-4 rounded-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Drafts / Review
            </span>
            <p className="mt-1 text-2xl font-black text-white">{draftCount}</p>
          </div>

          <div className="bg-[#141923] border border-neutral-800 p-4 rounded-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#70baff]">
              Total Live Views
            </span>
            <p className="mt-1 text-2xl font-black text-white">{totalViews.toLocaleString('en-US')}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#141923] border border-neutral-800 p-4 rounded-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === 'all' ? 'bg-[#1365A4] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === 'published' ? 'bg-[#1365A4] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Live on Feed ({publishedCount})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === 'draft' ? 'bg-[#1365A4] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, tag, slug..."
              className="w-full bg-[#0d0f14] border border-neutral-700 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Posts Table / Grid */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 text-sm">
            <div className="inline-block size-6 border-2 border-[#1365A4] border-t-transparent rounded-full animate-spin mb-3" />
            <p>Loading your blog repository from Neon Database...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-[#141923] border border-neutral-800 rounded-sm p-12 text-center">
            <span className="text-4xl">✍️</span>
            <h3 className="text-lg font-bold text-white mt-4">No blog posts found</h3>
            <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
              {posts.length === 0
                ? 'Your website currently has no uploaded blogs. Create your first blog now and it will appear on the Hero Section and live feeds!'
                : 'No posts match your current filter or search criteria.'}
            </p>
            <button
              type="button"
              onClick={openNewPostEditor}
              className="mt-6 inline-flex items-center gap-2 bg-[#1365A4] hover:bg-[#0e4c7c] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-colors"
            >
              + Create First Blog
            </button>
          </div>
        ) : (
          <div className="bg-[#141923] border border-neutral-800 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1118] text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Article</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Author</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Views</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredPosts.map((post) => (
                    <tr key={post.slug} className="hover:bg-[#1a2130] transition-colors">
                      {/* Title & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 bg-neutral-900 border border-neutral-800 overflow-hidden rounded">
                            {post.image ? (
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-neutral-600">
                                📷
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-md">
                            <h4 className="font-bold text-white text-sm truncate">{post.title}</h4>
                            <p className="text-neutral-400 text-[11px] font-mono truncate">
                              /posts/{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="bg-neutral-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
                          {post.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4 text-neutral-300">
                        {post.author || 'Editorial'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(post)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-opacity hover:opacity-80 ${
                            post.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              post.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          <span>{post.status === 'published' ? 'Live' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Views */}
                      <td className="py-3 px-4 font-mono text-neutral-400">
                        {(post.views || 0).toLocaleString('en-US')}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                            title="Preview on Live Site"
                          >
                            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Link>

                          <button
                            type="button"
                            onClick={() => openEditPostEditor(post)}
                            className="p-1.5 text-sky-400 hover:text-sky-300 transition-colors"
                            title="Edit Blog"
                          >
                            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePost(post)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Delete Blog"
                          >
                            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Editor Modal Drawer */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#141923] border border-neutral-700 shadow-2xl rounded-sm my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-[#0f1219]">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-white">
                  {editingPostId ? 'Edit Blog Article' : 'Write & Publish New Blog'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Published articles appear automatically in the spotlight Hero Section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-neutral-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Blog Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Next-Gen GPU Architecture Revealed"
                    className="w-full bg-[#0d0f14] border border-neutral-700 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="bg-neutral-800 px-2.5 py-2 text-xs text-neutral-400 border border-r-0 border-neutral-700 font-mono">
                      /posts/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setSlugTouched(true);
                      }}
                      placeholder="custom-slug"
                      className="w-full bg-[#0d0f14] border border-neutral-700 px-3 py-2 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#1365A4]"
                    />
                  </div>
                </div>
              </div>

              {/* Category, Author, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0d0f14] border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1365A4]"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    className="w-full bg-[#0d0f14] border border-neutral-700 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Publication Status
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                        className="text-[#1365A4]"
                      />
                      <span className="text-emerald-400 font-semibold">Publish Live</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer ml-3">
                      <input
                        type="radio"
                        name="status"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                        className="text-[#1365A4]"
                      />
                      <span className="text-amber-400 font-semibold">Save Draft</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Excerpt / Summary */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Summary / Excerpt (Shown in Hero Section &amp; Card previews)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise summary highlighting the key points of the article..."
                  className="w-full bg-[#0d0f14] border border-neutral-700 p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4]"
                />
              </div>

              {/* Cover Image Upload / Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Featured Cover Image
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Paste image URL (https://... or /images/...)"
                    className="flex-1 bg-[#0d0f14] border border-neutral-700 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4]"
                  />

                  <label className="inline-flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-200 cursor-pointer transition-colors shrink-0">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                {/* Preset suggestions */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Presets:</span>
                  {CURATED_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setImage(p.url)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        image === p.url
                          ? 'border-[#1365A4] bg-[#1365A4]/20 text-[#70baff]'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Image Preview */}
                {image && (
                  <div className="mt-3 relative h-28 w-full max-w-sm rounded border border-neutral-800 overflow-hidden bg-neutral-900">
                    <Image
                      src={image}
                      alt="Cover preview"
                      fill
                      sizes="384px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Markdown Content & Live Preview Tabs */}
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditorMode('write')}
                      className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        editorMode === 'write'
                          ? 'bg-[#1365A4] text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Write (Markdown)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('preview')}
                      className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        editorMode === 'preview'
                          ? 'bg-[#1365A4] text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Preview Formatted
                    </button>
                  </div>

                  <span className="text-[11px] text-neutral-500 font-mono">
                    {content.length} characters
                  </span>
                </div>

                {editorMode === 'write' ? (
                  <textarea
                    rows={12}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write article content using standard Markdown (## Headings, **bold**, - lists, quotes)..."
                    className="w-full bg-[#0d0f14] border border-neutral-700 p-4 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4] leading-relaxed"
                  />
                ) : (
                  <div className="bg-[#0d0f14] border border-neutral-700 p-6 min-h-[300px] max-h-[500px] overflow-y-auto">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-800 pb-2 mb-4">
                      Live Preview Display:
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{title || 'Untitled Post'}</h2>
                    <div className="text-neutral-300 text-sm leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-6 mb-3 border-b border-neutral-800 pb-1">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-bold text-white mt-5 mb-2.5">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-bold text-neutral-200 mt-4 mb-2">{children}</h3>,
                          p: ({ children }) => <p className="mb-3 leading-relaxed text-neutral-300">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 my-3 space-y-1 text-neutral-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 my-3 space-y-1 text-neutral-300">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          hr: () => <hr className="my-6 border-neutral-800" />,
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-4 border border-neutral-800 rounded bg-[#0a0c10]">
                              <table className="w-full text-left text-xs border-collapse min-w-[400px]">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-neutral-800/80 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-800">{children}</thead>,
                          tbody: ({ children }) => <tbody className="divide-y divide-neutral-800/70">{children}</tbody>,
                          tr: ({ children }) => <tr className="hover:bg-neutral-800/30 even:bg-neutral-900/30">{children}</tr>,
                          th: ({ children }) => <th className="px-3 py-2 text-white font-semibold">{children}</th>,
                          td: ({ children }) => <td className="px-3 py-2 text-neutral-300 align-middle">{children}</td>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-[#1365A4] pl-3 my-3 italic text-neutral-400 bg-neutral-900/40 py-1.5 rounded-r">{children}</blockquote>,
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-[#1365A4] hover:bg-[#0e4c7c] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 shadow-lg shadow-[#1365A4]/25 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPostId ? 'Update Article' : 'Publish Article Now'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
