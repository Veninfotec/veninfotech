'use client';

import { useState } from 'react';

const INQUIRY_TOPICS = [
  'Editorial & News Tip',
  'Article Correction or Feedback',
  'Advertising & Sponsorships',
  'Technical / Architecture Question',
  'Privacy & Data Request',
  'General Inquiry',
];

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(INQUIRY_TOPICS[0]);
  const [message, setMessage] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState(''); // Honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const syncAriaInvalid = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> | React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const el = e.currentTarget;
    try {
      const isUserInvalid = el.matches(':user-invalid');
      el.setAttribute('aria-invalid', isUserInvalid ? 'true' : 'false');
    } catch {
      // Fallback for older browsers
      el.setAttribute('aria-invalid', !el.checkValidity() ? 'true' : 'false');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setStatus('error');
      setStatusMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !simpleEmailRegex.test(trimmedEmail)) {
      setStatus('error');
      setStatusMessage('Please enter a valid email address.');
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      setStatus('error');
      setStatusMessage('Please write a message of at least 10 characters.');
      return;
    }

    setStatus('loading');
    setStatusMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject,
          message: trimmedMessage,
          company_website: companyWebsite,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('success');
        setStatusMessage(
          data.message ||
            'Thank you for reaching out! Our editorial team has received your message and will reply soon.'
        );
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Could not send message. Please try again.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network error. Please check your connection or email us directly.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Hidden Honeypot Field */}
      <input
        type="text"
        name="company_website"
        value={companyWebsite}
        onChange={(e) => setCompanyWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="flex flex-col">
          <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-zinc-800">
            Your Name <span className="text-rose-600">*</span>
          </label>
          <span id="contact-name-hint" className="text-[11px] text-zinc-500 mt-0.5 mb-1.5">
            Minimum 2 characters
          </span>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (status !== 'idle' && status !== 'loading') {
                setStatus('idle');
                setStatusMessage('');
              }
            }}
            onBlur={syncAriaInvalid}
            onInput={syncAriaInvalid}
            disabled={status === 'loading'}
            placeholder="Jane Doe"
            aria-describedby="contact-name-hint"
            aria-errormessage="contact-name-error"
            className="peer rounded-xl border border-zinc-300 bg-zinc-50/60 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1365A4] focus:bg-white focus:outline-none transition-colors user-invalid:border-rose-600 user-invalid:bg-rose-50/50 user-valid:border-emerald-600 disabled:opacity-60"
          />
          <p
            id="contact-name-error"
            className="mt-1.5 hidden text-xs font-medium text-rose-600 peer-user-invalid:block"
          >
            <span aria-hidden="true">⚠ </span>Please enter your name (at least 2 characters).
          </p>
        </div>

        {/* Email Address */}
        <div className="flex flex-col">
          <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-zinc-800">
            Email Address <span className="text-rose-600">*</span>
          </label>
          <span id="contact-email-hint" className="text-[11px] text-zinc-500 mt-0.5 mb-1.5">
            Format: name@example.com
          </span>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== 'idle' && status !== 'loading') {
                setStatus('idle');
                setStatusMessage('');
              }
            }}
            onBlur={syncAriaInvalid}
            onInput={syncAriaInvalid}
            disabled={status === 'loading'}
            placeholder="you@example.com"
            aria-describedby="contact-email-hint"
            aria-errormessage="contact-email-error"
            className="peer rounded-xl border border-zinc-300 bg-zinc-50/60 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1365A4] focus:bg-white focus:outline-none transition-colors user-invalid:border-rose-600 user-invalid:bg-rose-50/50 user-valid:border-emerald-600 disabled:opacity-60"
          />
          <p
            id="contact-email-error"
            className="mt-1.5 hidden text-xs font-medium text-rose-600 peer-user-invalid:block"
          >
            <span aria-hidden="true">⚠ </span>Please enter a valid email address.
          </p>
        </div>
      </div>

      {/* Inquiry Department / Subject */}
      <div className="flex flex-col">
        <label htmlFor="contact-subject" className="text-xs font-bold uppercase tracking-wider text-zinc-800">
          Inquiry Topic
        </label>
        <span id="contact-subject-hint" className="text-[11px] text-zinc-500 mt-0.5 mb-1.5">
          Select the desk best suited to assist you
        </span>
        <select
          id="contact-subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={status === 'loading'}
          aria-describedby="contact-subject-hint"
          className="rounded-xl border border-zinc-300 bg-zinc-50/60 px-4 py-2.5 text-sm text-zinc-900 focus:border-[#1365A4] focus:bg-white focus:outline-none transition-colors disabled:opacity-60"
        >
          {INQUIRY_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {/* Message Body */}
      <div className="flex flex-col">
        <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wider text-zinc-800">
          Message <span className="text-rose-600">*</span>
        </label>
        <span id="contact-message-hint" className="text-[11px] text-zinc-500 mt-0.5 mb-1.5">
          Include relevant article links or details (10–5,000 characters)
        </span>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (status !== 'idle' && status !== 'loading') {
              setStatus('idle');
              setStatusMessage('');
            }
          }}
          onBlur={syncAriaInvalid}
          onInput={syncAriaInvalid}
          disabled={status === 'loading'}
          placeholder="How can our editorial or engineering team help you?"
          aria-describedby="contact-message-hint"
          aria-errormessage="contact-message-error"
          className="peer rounded-xl border border-zinc-300 bg-zinc-50/60 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1365A4] focus:bg-white focus:outline-none transition-colors user-invalid:border-rose-600 user-invalid:bg-rose-50/50 user-valid:border-emerald-600 disabled:opacity-60 resize-y"
        />
        <p
          id="contact-message-error"
          className="mt-1.5 hidden text-xs font-medium text-rose-600 peer-user-invalid:block"
        >
          <span aria-hidden="true">⚠ </span>Please enter a detailed message (at least 10 characters).
        </p>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-xl border p-4 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 ${
            status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          <span className="font-bold text-base leading-none mt-0.5">
            {status === 'success' ? '✓' : '⚠'}
          </span>
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-[11px] text-zinc-500">
          Your information is handled in accordance with our{' '}
          <a href="/privacy-policy" className="text-[#1365A4] font-semibold hover:underline">
            Privacy Policy
          </a>
          .
        </p>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1365A4] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#0e4c7c] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <>
              <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Sending Inquiry...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <span aria-hidden="true">&rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

