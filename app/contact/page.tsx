import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us • Editorial & Inquiries Desk | Veninfotech',
  description:
    'Get in touch with the Veninfotech editorial and engineering team. Submit news tips, article corrections, advertising inquiries, or general questions.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us • Editorial & Inquiries Desk | Veninfotech',
    description:
      'Connect with the Veninfotech newsroom and engineering team for inquiries, feedback, and partnerships.',
    url: 'https://veninfotech.net/contact',
    siteName: 'Veninfotech',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-[#1365A4] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Header */}
        <header className="border-b border-zinc-200 bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
              <Link href="/" className="hover:text-zinc-900 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#1365A4] font-semibold">Contact Us</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-700 mb-5 shadow-xs">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>Editorial &amp; Support Desk</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 leading-[1.15]">
                Contact Veninfotech
              </h1>

              <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
                Have a story tip, a technical question, a correction request, or a partnership inquiry? Our editors and engineers read every message and typically respond within 24 to 48 business hours.
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Contact Form */}
              <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-xs">
                <div className="mb-6 pb-5 border-b border-zinc-200">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1365A4] block mb-1">
                    Direct Dispatch
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    Send Us a Message
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-500">
                    Fill out the form below and our team will get back to you via email.
                  </p>
                </div>

                <ContactForm />
              </div>

              {/* Right Column: Direct Contact Channels & Info */}
              <aside className="lg:col-span-5 space-y-6">
                {/* Direct Email Card */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-[#1365A4]">
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1365A4] block">
                        Official Email
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                        Editorial &amp; Press Inquiries
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Prefer to write from your own email client? Reach our editorial desk, technical reviewers, and management directly at:
                  </p>

                  <a
                    href="mailto:vendoraglobalsolutions@gmail.com"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs sm:text-sm font-semibold text-[#1365A4] hover:border-[#1365A4] hover:bg-blue-50/40 transition-colors w-full justify-between"
                  >
                    <span className="truncate">vendoraglobalsolutions@gmail.com</span>
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>

                {/* Editorial Standards & Corrections */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Accuracy &amp; Accountability
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                    Article Corrections &amp; Fact-Checking
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Veninfotech is committed to accurate, verifiable reporting. If you spot a factual or technical error in any of our published articles, please select{' '}
                    <strong className="text-zinc-900">&ldquo;Article Correction or Feedback&rdquo;</strong> in the form and include the article URL.
                  </p>
                </div>

                {/* Quick Compliance Links */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-900 text-white p-6 sm:p-8 shadow-xs space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#70baff] block">
                    Company &amp; Policies
                  </span>
                  <h3 className="text-base sm:text-lg font-bold">
                    Helpful Resources
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
                    <li>
                      <Link href="/about" className="flex items-center justify-between hover:text-white transition-colors py-1 border-b border-white/10">
                        <span>About Veninfotech &amp; Our Mission</span>
                        <span>&rarr;</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" className="flex items-center justify-between hover:text-white transition-colors py-1 border-b border-white/10">
                        <span>Privacy Policy &amp; AdSense Cookies</span>
                        <span>&rarr;</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="flex items-center justify-between hover:text-white transition-colors py-1">
                        <span>Terms of Service &amp; Disclaimer</span>
                        <span>&rarr;</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

