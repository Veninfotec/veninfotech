'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostData {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  status: 'draft' | 'pending_review' | 'published';
  author: string;
  views: number;
  is_breaking?: boolean;
  date?: string;
}

const CATEGORY_OPTIONS = [
  'WORLD',
  'NEWS',
  'POLITICS',
  'ECONOMY',
  'SCIENCE',
  'TECHNOLOGY',
  'CULTURE',
  'SPORTS',
  'ENVIRONMENT',
  'TECH',
  'AI & SOFTWARE',
  'REVIEWS',
];

const CURATED_PRESETS = [
  { label: 'Cyberpunk / Tech', url: '/images/hero/hero-bg.jpg' },
  { label: 'Smart City', url: '/images/hero/breaking-city.jpg' },
  { label: 'Crypto & Assets', url: '/images/hero/trending-bitcoin.jpg' },
  { label: 'Satellite Dish', url: '/images/hero/breaking-satellite.jpg' },
  { label: 'Ocean Ecosystem', url: '/images/hero/trending-ocean.jpg' },
];

export default function AdminNewsQueuePage() {
  const [drafts, setDrafts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingRss, setFetchingRss] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeed, setSelectedFeed] = useState('https://feeds.bbci.co.uk/news/world/rss.xml');
  const [fetchLimit, setFetchLimit] = useState(5);
  const [customApiKey, setCustomApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editor Modal State
  const [activeDraft, setActiveDraft] = useState<PostData | null>(null);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Form Fields for Active Draft
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editCategory, setEditCategory] = useState('NEWS');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState('/images/hero/hero-bg.jpg');
  const [editAuthor, setEditAuthor] = useState('VIT AI Editorial');
  const [editIsBreaking, setEditIsBreaking] = useState(false);

  // Load custom API key from localStorage if saved
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('vit_gemini_api_key');
      if (savedKey) setCustomApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = (val: string) => {
    setCustomApiKey(val);
    if (typeof window !== 'undefined') {
      if (val.trim()) {
        localStorage.setItem('vit_gemini_api_key', val.trim());
      } else {
        localStorage.removeItem('vit_gemini_api_key');
      }
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Load all draft posts
  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?status=all');
      const data = await res.json();
      if (data.success) {
        // Filter strictly to drafts and pending review
        const allPosts: PostData[] = data.posts || [];
        const filtered = allPosts.filter(
          (p) => p.status === 'draft' || p.status === 'pending_review',
        );
        setDrafts(filtered);
      } else {
        showNotification('error', data.error || 'Failed to load drafts');
      }
    } catch (err) {
      console.error('Failed to load drafts:', err);
      showNotification('error', 'Network error while loading drafts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  // Trigger automated AI RSS Curation pipeline
  const handleFetchTrendingNews = async () => {
    setFetchingRss(true);
    try {
      const res = await fetch('/api/news/fetch-trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: fetchLimit,
          feedUrl: selectedFeed,
          apiKey: customApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification(
          'success',
          `Curated ${data.createdCount} new AI draft articles from RSS feed!`,
        );
        loadDrafts();
      } else {
        showNotification('error', data.error || 'Failed to curate trending news.');
      }
    } catch (err) {
      console.error('RSS Curation failed:', err);
      showNotification('error', 'Error calling news curation API.');
    } finally {
      setFetchingRss(false);
    }
  };

  // Open Draft in Modal for Preview/Edit
  const handleOpenDraft = (draft: PostData) => {
    setActiveDraft(draft);
    setEditTitle(draft.title);
    setEditSlug(draft.slug);
    setEditCategory(draft.category || 'NEWS');
    setEditExcerpt(draft.excerpt || '');
    setEditContent(draft.content || '');
    setEditImage(draft.image || '/images/hero/hero-bg.jpg');
    setEditAuthor(draft.author || 'VIT AI Editorial');
    setEditIsBreaking(Boolean(draft.is_breaking));
    setEditorMode('edit');
  };

  // Save changes to draft
  const handleSaveDraftChanges = async () => {
    if (!activeDraft) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${activeDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          slug: editSlug.trim(),
          category: editCategory,
          excerpt: editExcerpt.trim(),
          content: editContent.trim(),
          image: editImage.trim(),
          author: editAuthor.trim(),
          is_breaking: editIsBreaking,
          post_type: 'news',
          status: 'draft',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Draft updated successfully.');
        setActiveDraft(null);
        loadDrafts();
      } else {
        showNotification('error', data.error || 'Failed to save changes.');
      }
    } catch (err) {
      console.error('Failed to update draft:', err);
      showNotification('error', 'Network error saving draft.');
    } finally {
      setSaving(false);
    }
  };

  // Generate dedicated AI photo for active draft and store to R2
  const handleGenerateAiImage = async () => {
    if (!editTitle) return;
    setGeneratingImage(true);
    try {
      const res = await fetch('/api/news/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          category: editCategory,
          slug: editSlug,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setEditImage(data.imageUrl);
        showNotification('success', 'Generated story-specific photo and uploaded to Cloudflare R2!');
      } else {
        showNotification('error', data.error || 'Failed to generate image');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Network error generating image');
    } finally {
      setGeneratingImage(false);
    }
  };

  // One-Click Action: Publish Draft Live
  const handlePublishDraft = async (draftId?: number) => {
    const idToPublish = draftId ?? activeDraft?.id;
    if (!idToPublish) return;

    setSaving(true);
    try {
      const targetDraft = drafts.find((d) => d.id === idToPublish) || activeDraft;
      const titleToPublish = activeDraft && activeDraft.id === idToPublish ? editTitle.trim() : (targetDraft?.title || '');
      const categoryToPublish = activeDraft && activeDraft.id === idToPublish ? editCategory : (targetDraft?.category || 'NEWS');
      let imageToPublish = activeDraft && activeDraft.id === idToPublish ? editImage.trim() : (targetDraft?.image || '');

      // Ensure every published news story has a unique related generated image (never the static placeholder)
      if (!imageToPublish || imageToPublish.includes('hero-bg.jpg')) {
        showNotification('success', 'Generating unique story photo and publishing live...');
        try {
          const imgRes = await fetch('/api/news/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: titleToPublish,
              category: categoryToPublish,
              slug: targetDraft?.slug,
            }),
          });
          const imgData = await imgRes.json();
          if (imgData.success && imgData.imageUrl) {
            imageToPublish = imgData.imageUrl;
            if (activeDraft && activeDraft.id === idToPublish) {
              setEditImage(imgData.imageUrl);
            }
          }
        } catch (imgErr) {
          console.warn('Auto image generation on publish failed:', imgErr);
        }
      }

      const payload = activeDraft && activeDraft.id === idToPublish
        ? {
            title: titleToPublish,
            slug: editSlug.trim(),
            category: categoryToPublish,
            excerpt: editExcerpt.trim(),
            content: editContent.trim(),
            image: imageToPublish,
            author: editAuthor.trim(),
            is_breaking: editIsBreaking,
            post_type: 'news',
            status: 'published',
          }
        : {
            image: imageToPublish,
            post_type: 'news',
            status: 'published',
          };

      const res = await fetch(`/api/posts/${idToPublish}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showNotification(
          'success',
          'Article published live with dedicated story image! Visible now on the public news feed.',
        );
        setActiveDraft(null);
        loadDrafts();
      } else {
        showNotification('error', data.error || 'Failed to publish article.');
      }
    } catch (err) {
      console.error('Failed to publish article:', err);
      showNotification('error', 'Network error during publish.');
    } finally {
      setSaving(false);
    }
  };

  // One-Click Action: Discard / Delete Draft
  const handleDiscardDraft = async (id: number) => {
    if (!confirm('Are you sure you want to discard this draft? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Draft discarded.');
        if (activeDraft?.id === id) {
          setActiveDraft(null);
        }
        loadDrafts();
      } else {
        showNotification('error', data.error || 'Failed to discard draft.');
      }
    } catch (err) {
      console.error('Failed to delete draft:', err);
      showNotification('error', 'Error discarding draft.');
    }
  };

  const filteredDrafts = drafts.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0d0f12] text-zinc-100 selection:bg-[#1365A4] selection:text-white">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-[#0d0f12]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="bg-[#1365A4] px-2.5 py-1 text-xs font-black tracking-widest text-white uppercase shadow-md">
                VIT
              </span>
              <span className="text-sm font-bold tracking-tight text-white hidden sm:inline">
                VENINFOTECH
              </span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/admin/blogs"
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Articles
              </Link>
              <Link
                href="/admin/new"
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                + New Post
              </Link>
              <Link
                href="/admin/news-queue"
                className="rounded-md bg-[#1365A4]/20 border border-[#1365A4]/50 px-3 py-1.5 text-xs font-bold text-[#70baff] transition-colors"
              >
                AI News Queue ({drafts.length})
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>API Settings</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              View Site ↗
            </Link>
          </div>
        </div>

        {/* Collapsible API & Feed Configuration Bar */}
        {showSettings && (
          <div className="border-t border-zinc-800 bg-zinc-900/95 px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Google Gemini API Key (Optional Override)
                  </label>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => handleSaveApiKey(e.target.value)}
                    placeholder="AIzaSy... (uses .env.local GEMINI_API_KEY if blank)"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-[#1365A4] focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Get a free key from Google AI Studio. If left blank, server defaults apply.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Source RSS Wire Feed
                  </label>
                  <select
                    value={selectedFeed}
                    onChange={(e) => setSelectedFeed(e.target.value)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-[#1365A4] focus:outline-none"
                  >
                    <optgroup label="🌍 World & Global News">
                      <option value="https://feeds.bbci.co.uk/news/world/rss.xml">BBC News (World News Wire)</option>
                      <option value="https://feeds.bbci.co.uk/news/rss.xml">BBC News (Top Global Headlines)</option>
                      <option value="https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en">Google News (International World)</option>
                      <option value="https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en">Google News (Top Headlines)</option>
                      <option value="https://feeds.npr.org/1001/rss.xml">NPR News (Top Stories)</option>
                      <option value="https://www.theguardian.com/world/rss">The Guardian (World)</option>
                      <option value="https://www.aljazeera.com/xml/rss/all.xml">Al Jazeera (Global Wire)</option>
                    </optgroup>
                    <optgroup label="📈 Economy & Markets">
                      <option value="https://www.cnbc.com/id/100727362/device/rss/rss.html">CNBC (International Markets)</option>
                      <option value="https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en">Google News (Business & Economy)</option>
                    </optgroup>
                    <optgroup label="🔬 Science & Environment">
                      <option value="https://www.sciencedaily.com/rss/top/science.xml">Science Daily (Top Science)</option>
                      <option value="https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en">Google News (Science & Space)</option>
                    </optgroup>
                    <optgroup label="💻 Technology & Innovation">
                      <option value="https://techcrunch.com/feed/">TechCrunch (Tech & Startups)</option>
                      <option value="https://feeds.arstechnica.com/arstechnica/index">Ars Technica (Hardware & Policy)</option>
                    </optgroup>
                  </select>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Curate from global world wires, economy, science, and tech.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Batch Import Size
                  </label>
                  <select
                    value={fetchLimit}
                    onChange={(e) => setFetchLimit(Number(e.target.value))}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-[#1365A4] focus:outline-none"
                  >
                    <option value={3}>3 Articles per run</option>
                    <option value={5}>5 Articles per run</option>
                    <option value={8}>8 Articles per run</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-xs font-semibold shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
              notification.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200'
                : 'border-red-500/40 bg-red-950/80 text-red-200'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Dashboard Header & Action Bar */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Automated AI News Pipeline
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI News Review Queue
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Fetch trending global wire stories via RSS, synthesize via Gemini AI into formatted markdown drafts, and review before publishing live.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleFetchTrendingNews}
              disabled={fetchingRss}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1365A4] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#1365A4]/20 hover:bg-[#0e4c7c] active:scale-95 transition-all disabled:opacity-50"
            >
              {fetchingRss ? (
                <>
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Curating via AI...</span>
                </>
              ) : (
                <>
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Fetch Trending News Now</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={loadDrafts}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
              title="Refresh Queue"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drafts by title, excerpt, or category..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#1365A4] focus:outline-none"
            />
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            Pending Drafts: <span className="font-bold text-white">{filteredDrafts.length}</span>
          </div>
        </div>

        {/* Review Queue Table */}
        {loading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <div className="inline-block size-6 animate-spin rounded-full border-2 border-[#1365A4] border-t-transparent mb-3" />
            <p className="text-xs text-zinc-400">Loading AI review queue...</p>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
            <span className="text-4xl">📰</span>
            <h3 className="mt-4 text-base font-bold text-white">Review Queue is Empty</h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              All curated news articles have been reviewed or published. Click &ldquo;Fetch Trending News Now&rdquo; above to automatically curate fresh global news from live RSS feeds.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleFetchTrendingNews}
                disabled={fetchingRss}
                className="rounded-lg bg-[#1365A4] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e4c7c] transition-colors"
              >
                Fetch Trending News Now
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-900 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">Article</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Flags</th>
                  <th className="px-4 py-3.5">Date Created</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredDrafts.map((draft) => (
                  <tr
                    key={draft.id}
                    className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDraft(draft)}
                  >
                    {/* Article Info */}
                    <td className="px-4 py-3.5 max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-zinc-800 border border-zinc-700">
                          <Image
                            src={draft.image || '/images/hero/hero-bg.jpg'}
                            alt={draft.title}
                            fill
                            sizes="56px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white line-clamp-1 group-hover:text-[#70baff] transition-colors">
                            {draft.title}
                          </h4>
                          <p className="mt-0.5 text-zinc-400 text-[11px] line-clamp-1">
                            {draft.excerpt || 'No excerpt provided.'}
                          </p>
                          <span className="font-mono text-[10px] text-zinc-500">
                            /{draft.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-300 border border-zinc-700">
                        {draft.category || 'NEWS'}
                      </span>
                    </td>

                    {/* Flags (Breaking / AI) */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {draft.is_breaking && (
                          <span className="rounded bg-orange-950/80 border border-orange-500/40 px-2 py-0.5 text-[10px] font-bold text-orange-400 uppercase">
                            ⚡ BREAKING
                          </span>
                        )}
                        <span className="rounded bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase">
                          AI DRAFT
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-zinc-400 text-[11px]">
                      {draft.date}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDraft(draft)}
                          className="rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
                        >
                          Review &amp; Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePublishDraft(draft.id)}
                          className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                        >
                          Publish Live
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscardDraft(draft.id)}
                          className="rounded-md border border-red-900/50 bg-red-950/40 px-2.5 py-1 text-xs font-semibold text-red-300 hover:bg-red-900/60 transition-colors"
                        >
                          Discard
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Real-Time Preview & Edit Modal */}
      {activeDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950">
              <div className="flex items-center gap-3">
                <span className="rounded bg-[#1365A4] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  EDITORIAL DRAFT
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {editTitle || 'Untitled Draft'}
                </h3>
              </div>

              {/* Edit vs Preview Tab Toggle */}
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg bg-zinc-800 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setEditorMode('edit')}
                    className={`rounded-md px-3 py-1 transition-colors ${
                      editorMode === 'edit'
                        ? 'bg-[#1365A4] text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Edit Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`rounded-md px-3 py-1 transition-colors ${
                      editorMode === 'preview'
                        ? 'bg-[#1365A4] text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Live Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveDraft(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {editorMode === 'edit' ? (
                <div className="space-y-5 text-xs">
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-zinc-300 mb-1.5">
                        Article Headline
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-[#1365A4] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-300 mb-1.5">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 font-mono text-xs text-white focus:border-[#1365A4] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category, Author, Breaking News Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-zinc-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-[#1365A4] focus:outline-none"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-300 mb-1.5">
                        Author Byline
                      </label>
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-[#1365A4] focus:outline-none"
                      />
                    </div>

                    {/* Breaking News Toggle */}
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 cursor-pointer hover:bg-zinc-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={editIsBreaking}
                          onChange={(e) => setEditIsBreaking(e.target.checked)}
                          className="size-4 rounded border-zinc-600 bg-zinc-900 text-orange-600 focus:ring-0"
                        />
                        <span className="font-bold text-zinc-200">
                          Mark as Breaking News ⚡
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block font-bold text-zinc-300 mb-1.5">
                      Executive Summary / Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={editExcerpt}
                      onChange={(e) => setEditExcerpt(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-zinc-200 focus:border-[#1365A4] focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Featured Cover Image */}
                  <div>
                    <label className="block font-bold text-zinc-300 mb-1.5">
                      Featured Cover Image URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="Image URL or generate via AI below..."
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 font-mono text-xs text-white focus:border-[#1365A4] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAiImage}
                        disabled={generatingImage}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 transition-all disabled:opacity-50 shrink-0"
                      >
                        {generatingImage ? (
                          <>
                            <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span>Generating &amp; Uploading to R2...</span>
                          </>
                        ) : (
                          <>
                            <span>✨ Generate AI Image</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-zinc-400">Presets:</span>
                      {CURATED_PRESETS.map((p) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() => setEditImage(p.url)}
                          className="rounded border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Live Image Preview Thumbnail in Edit Mode */}
                    {editImage && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-700/80 bg-zinc-950 p-2.5">
                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded border border-zinc-700 bg-zinc-900">
                          <Image
                            src={editImage}
                            alt="Cover Preview"
                            fill
                            sizes="112px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] font-bold text-zinc-300">Live Cover Preview</p>
                            <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-mono text-zinc-400">
                              16:9
                            </span>
                          </div>
                          <p className="truncate font-mono text-[10px] text-zinc-500 mt-0.5">{editImage}</p>
                          <span className={`inline-block mt-1 text-[10px] font-semibold ${
                            editImage.includes('r2.dev') ? 'text-emerald-400' : 'text-zinc-400'
                          }`}>
                            {editImage.includes('r2.dev') ? '✓ Permanent Cloudflare R2 CDN' : '• External Image Source'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Markdown Content Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-zinc-300">
                        Article Content (Markdown Format)
                      </label>
                      <span className="text-[11px] text-zinc-500">
                        Supports tables, headings, and lists
                      </span>
                    </div>
                    <textarea
                      rows={14}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full font-mono rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-xs text-zinc-200 focus:border-[#1365A4] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                /* Live Markdown Preview */
                <div className="rounded-xl border border-zinc-800 bg-white p-6 sm:p-10 text-zinc-900">
                  <div className="mb-6">
                    <span className="rounded bg-zinc-900 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
                      {editCategory}
                    </span>
                    {editIsBreaking && (
                      <span className="ml-2 rounded bg-orange-600 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
                        ⚡ BREAKING NEWS
                      </span>
                    )}
                    <h1 className="mt-3 text-2xl sm:text-3xl font-black text-zinc-900 leading-tight">
                      {editTitle}
                    </h1>
                    {editExcerpt && (
                      <p className="mt-2 text-sm italic text-zinc-600 border-l-2 border-zinc-900 pl-3">
                        {editExcerpt}
                      </p>
                    )}
                  </div>

                  {editImage && (
                    <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200">
                      <Image
                        src={editImage}
                        alt={editTitle}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="prose max-w-none text-zinc-800 text-sm leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6 border border-zinc-200 rounded-lg">
                            <table className="w-full border-collapse text-left text-xs sm:text-sm">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-zinc-100 font-bold border-b border-zinc-200 uppercase text-xs">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="divide-y divide-zinc-200 bg-white">
                            {children}
                          </tbody>
                        ),
                        th: ({ children }) => (
                          <th className="px-4 py-2.5 font-bold text-zinc-900">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-2.5 text-zinc-700">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {editContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 px-6 py-4">
              <button
                type="button"
                onClick={() => handleDiscardDraft(activeDraft.id)}
                className="rounded-lg border border-red-900/50 bg-red-950/40 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-900/60 transition-colors"
              >
                Discard Draft
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraftChanges}
                  disabled={saving}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  Save Draft Changes
                </button>
                <button
                  type="button"
                  onClick={() => handlePublishDraft()}
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 shadow-md transition-colors disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish Live Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
