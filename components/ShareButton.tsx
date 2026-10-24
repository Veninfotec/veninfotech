'use client';

import { useState, useEffect } from 'react';

interface ShareButtonProps {
  title: string;
  url?: string;
  excerpt?: string;
  variant?: 'bottom-bar' | 'compact' | 'inline';
  className?: string;
}

export default function ShareButton({
  title,
  url,
  excerpt = '',
  variant = 'bottom-bar',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(url || '');
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    let computedUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const siteDomain = 'https://veninfotech.net';

    if (computedUrl.startsWith('/')) {
      const origin = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')
        ? window.location.origin
        : siteDomain;
      computedUrl = `${origin}${computedUrl}`;
    } else if (computedUrl.includes('localhost') || computedUrl.includes('127.0.0.1')) {
      computedUrl = computedUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, siteDomain);
    }

    setFullUrl(computedUrl);

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, [url]);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        // Fallback for older contexts
        const textarea = document.createElement('textarea');
        textarea.value = fullUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url: fullUrl,
        });
      } catch (err) {
        // User aborted or canceled share sheet
        if ((err as Error).name !== 'AbortError') {
          console.error('Native share failed:', err);
        }
      }
    } else {
      handleCopy();
    }
  };

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  // 1. Compact Variant (For blog cards / lists)
  if (variant === 'compact') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canNativeShare) {
              handleNativeShare();
            } else {
              handleCopy();
            }
          }}
          title={copied ? 'Link copied!' : 'Share article'}
          aria-label="Share article"
          className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600 transition-all hover:border-[#1365A4] hover:bg-neutral-50 hover:text-[#1365A4] active:scale-95 shadow-2xs"
        >
          {copied ? (
            <>
              <svg className="size-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-600 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <svg className="size-3 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // 2. Full Bottom Bar Variant (For bottom of blog article)
  return (
    <section
      aria-label="Share article"
      className={`rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6 shadow-xs backdrop-blur-xs transition-colors ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Header / Call to Action */}
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </span>
            <h3 className="text-sm font-bold tracking-tight text-zinc-900">
              Share This Article
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500 leading-normal">
            Share these engineering insights and technical analysis with your network.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Copy Link Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 shadow-xs ${
              copied
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Copy link to clipboard"
            aria-label="Copy article link"
          >
            {copied ? (
              <>
                <svg className="size-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <svg className="size-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Native System Share (Mobile / Supported Browsers) */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition-all hover:border-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 shadow-xs"
              title="Share via device apps"
              aria-label="Share via device apps"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span>Share...</span>
            </button>
          )}

          {/* Social Channels Divider */}
          <span className="hidden sm:inline-block h-4 w-px bg-zinc-300 mx-0.5" />

          {/* X / Twitter */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition-all hover:border-black hover:bg-black hover:text-white active:scale-95 shadow-xs"
            title="Share on X (Twitter)"
            aria-label="Share on X (Twitter)"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition-all hover:border-[#0a66c2] hover:bg-[#0a66c2] hover:text-white active:scale-95 shadow-xs"
            title="Share on LinkedIn"
            aria-label="Share on LinkedIn"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition-all hover:border-[#25D366] hover:bg-[#25D366] hover:text-white active:scale-95 shadow-xs"
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.42 1.01 2.59c.13.17 1.75 2.67 4.24 3.75.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31z" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition-all hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white active:scale-95 shadow-xs"
            title="Share on Facebook"
            aria-label="Share on Facebook"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
