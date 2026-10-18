'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter the admin access password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to new blog editor or admin desk
        router.push('/admin/new');
        router.refresh();
      } else {
        setError(data.error || 'Access denied. Incorrect password.');
      }
    } catch {
      setError('A connection error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden select-none font-sans">
      {/* Background Subtle Gradient & Grid Accent */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1365A4]/25 via-transparent to-transparent" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />

      {/* Centered Access Card */}
      <div className="relative z-10 w-full max-w-md bg-[#12161f]/95 border border-neutral-800/90 shadow-2xl backdrop-blur-xl p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-[#1365A4]/15 border border-[#1365A4]/40 text-[#70baff] mb-4 shadow-[0_0_15px_rgba(19,101,164,0.3)]">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Admin Portal Gateway
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Editorial Access
          </h1>

          <p className="mt-2 text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
            Please enter your defined administrator key to access internal publishing and editorial tools.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 border border-rose-500/40 bg-rose-950/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
            <span className="text-rose-400 text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2"
            >
              Admin Access Key
            </label>

            <div className="relative flex items-center">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-[#0a0a0c] border border-neutral-700 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1365A4] transition-colors pr-10 disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-neutral-400 hover:text-white text-xs transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#1365A4] hover:bg-[#0e4c7c] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider py-3.5 shadow-lg shadow-[#1365A4]/30 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Access Key...</span>
              </>
            ) : (
              <>
                <span>Unlock Admin Portal</span>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer Back Link */}
        <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <span>&larr; Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
