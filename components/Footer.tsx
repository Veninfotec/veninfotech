'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavColumn {
  title: string;
  links: { label: string; href: string }[];
}

const FOOTER_COLUMNS: NavColumn[] = [
  {
    title: 'Coverage',
    links: [
      { label: 'Technology', href: '/category/technology' },
      { label: 'Science', href: '/category/science' },
      { label: 'Economy', href: '/category/economy' },
      { label: 'Culture', href: '/category/culture' },
    ],
  },
  {
    title: 'Global Desk',
    links: [
      { label: 'World News', href: '/category/world' },
      { label: 'Politics', href: '/category/politics' },
      { label: 'Travel', href: '/category/travel' },
      { label: 'Latest Feed', href: '/news' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Frontpage', href: '/' },
      { label: 'About Veninfotech', href: '/about' },
      { label: 'News Archive', href: '/news' },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_subscribed' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    // Client-side quick check
    const simpleRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!simpleRegex.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Thank you for subscribing! You are all set.');
        setEmail('');
      } else if (res.status === 409 || data.status === 'already_subscribed') {
        setStatus('already_subscribed');
        setMessage(data.message || 'This email is already subscribed to our newsletter.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Unable to subscribe. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <footer className="bg-night text-neutral-400">
      <div className="mx-auto grid w-full max-w-[1170px] gap-8 border-t border-white/10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              {col.title}
            </h2>
            <ul className="mt-4 space-y-2 text-xs">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Newsletter Subscription Column */}
        <div className="flex flex-col">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            Stay Informed
          </h2>
          <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
            Get curated technology briefings, software engineering deep-dives, and world reporting delivered directly to your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="mt-4" noValidate>
            {/* Hidden honeypot field for bot deterrence */}
            <input
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              className="sr-only"
              aria-hidden="true"
            />

            <div className="flex overflow-hidden rounded-full bg-night-2 border border-white/10 focus-within:border-brand/70 transition-colors">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== 'idle' && status !== 'loading') {
                    setStatus('idle');
                    setMessage('');
                  }
                }}
                disabled={status === 'loading'}
                placeholder="Enter your email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                aria-label={status === 'loading' ? 'Subscribing...' : 'Subscribe to newsletter'}
                className="m-1 grid size-8 place-items-center rounded-full bg-brand text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-2.5 flex items-start gap-1.5 text-xs leading-snug ${
                  status === 'success'
                    ? 'text-emerald-400'
                    : status === 'already_subscribed'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                <span className="font-semibold text-sm leading-none mt-0.5">
                  {status === 'success' ? '✓' : status === 'already_subscribed' ? 'ℹ' : '⚠'}
                </span>
                <span>{message}</span>
              </div>
            )}

            <p className="mt-2 text-[11px] text-neutral-500">
              No spam. Unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 px-4">
        <div className="mx-auto flex w-full max-w-[1170px] flex-col items-center justify-between gap-2 text-center text-[11px] text-neutral-500 sm:flex-row">
          <p>© 2026 Veninfotech. All rights reserved.</p>
          <p className="text-neutral-600">
            Authoritative reporting & engineering insights
          </p>
        </div>
      </div>
    </footer>
  );
}
