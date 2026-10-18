import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Precision in Technology & Engineering',
  description:
    'Discover Veninfotech (VIT). We are a dedicated team of software engineers, system architects, and tech enthusiasts delivering high-signal analysis on modern technology and engineering.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Apple-Style Minimalist Hero Header */}
        <header className="border-b border-zinc-200 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-700 mb-6 shadow-xs">
                <span className="size-2 rounded-full bg-[#1365A4]" />
                <span>About Veninfotech</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 leading-[1.15]">
                Veninfotech: Precision in Technology and Design
              </h1>

              <div className="mt-8 space-y-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
                <p>
                  Welcome to Veninfotech. We are a dedicated team of software engineers, UI/UX
                  designers, and tech enthusiasts here to bring you crisp, high-signal reporting on
                  the technologies you live with every day.
                </p>
                <p>
                  The digital world moves faster than ever, and Veninfotech cuts through the noise.
                  We believe in providing clear, unbiased insights, deep-dive development breakdowns,
                  and meticulous design evaluations without unnecessary jargon or clutter.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Our Mission */}
        <section className="py-16 sm:py-20 border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
            <div className="max-w-4xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1365A4] mb-2 block">
                Our Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-6">
                Our Mission
              </h2>

              <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-xs space-y-6">
                <p className="text-base sm:text-lg text-zinc-700 leading-relaxed">
                  We get up in the morning knowing that modern developers, creators, and tech
                  enthusiasts need accurate, reliable information to build better systems and choose
                  the right tools. Whether you are architecting full-stack web applications,
                  evaluating machine learning models, or exploring the bleeding edge of UI/UX design,
                  our goal is to serve as your trusted digital resource.
                </p>

                <div className="border-l-4 border-[#1365A4] bg-zinc-50/80 rounded-r-xl p-5 sm:p-6">
                  <p className="text-sm sm:text-base font-semibold text-zinc-900 leading-relaxed italic">
                    &ldquo;At a time when it has become harder than ever to find authentic technical
                    content online, you can trust Veninfotech to tell it like it is.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Cover */}
        <section className="py-16 sm:py-20 border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1365A4] mb-2 block">
                Editorial Scope
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
                What We Cover
              </h2>
              <p className="mt-3 text-base text-zinc-600 leading-relaxed">
                Veninfotech goes beyond simple surface-level news. Our core coverage spans:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Coverage Item 1 */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-7 sm:p-8 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-[#1365A4]">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="m9 8 3 3-3 3M15 14h-3" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1365A4] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    Architecture
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2">
                  Engineering &amp; Architecture
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Deep dives into modern web stacks, backend infrastructure, system design, and
                  performance optimization.
                </p>
              </div>

              {/* Coverage Item 2 */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-7 sm:p-8 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                    Intelligence
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2">
                  AI &amp; Machine Learning
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Practical evaluations of predictive models, decision-support systems, and
                  intelligent tooling.
                </p>
              </div>

              {/* Coverage Item 3 */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-7 sm:p-8 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-purple-50 border border-purple-200 text-purple-600">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">
                    Design
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2">
                  UI/UX &amp; Design Systems
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Exploring the intersection of aesthetics and functionality, inspired by clean
                  design pioneers like Apple.
                </p>
              </div>

              {/* Coverage Item 4 */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-7 sm:p-8 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M6 6h10M6 10h10" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                    Publishing
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2">
                  Digital Publishing
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Insights into modern content management architectures, static site generation, and
                  media asset pipelines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Publishing Standards */}
        <section className="py-16 sm:py-20 border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1365A4] mb-2 block">
                Ethos &amp; Integrity
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
                Our Publishing Standards
              </h2>
              <p className="mt-3 text-base text-zinc-600 leading-relaxed">
                We pride ourselves on technical accuracy, transparency, and a distraction-free
                reading experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Standard 1 */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1365A4] font-black text-sm mb-5">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Unbiased Analysis</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Our technical choices and reviews are driven by rigorous evaluation and
                    practical utility, never by external influence.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-[#1365A4]">
                  Rigorous &amp; Independent
                </div>
              </div>

              {/* Standard 2 */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-black text-sm mb-5">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">High-Signal Reporting</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    We focus on substance. Every article is crafted to give you actionable
                    takeaways and a deeper understanding of how modern technology works.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Substance Over Noise
                </div>
              </div>

              {/* Standard 3 */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-black text-sm mb-5">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Clean Aesthetic</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Designed with a signature high-contrast light theme, generous whitespace, and
                    precise typography, ensuring your reading experience is effortless and focused.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-purple-600">
                  Apple-Style Minimalist
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Technology Behind Veninfotech */}
        <section className="py-16 sm:py-20 border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1365A4] mb-2 block">
                Engineering Stack
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
                The Technology Behind Veninfotech
              </h2>
              <p className="mt-3 text-base text-zinc-600 leading-relaxed">
                We don&apos;t just write about technology—we build with it. Veninfotech is engineered
                using a modern, high-performance web stack:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Tech 1 */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-7 sm:p-8 hover:border-zinc-300 transition-colors shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-block rounded-md bg-zinc-900 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider mb-4">
                    Next.js + Tailwind
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Frontend &amp; Framework</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Built on Next.js and styled with Tailwind CSS for lightning-fast page
                    transitions and a pristine Apple Newsroom aesthetic.
                  </p>
                </div>
              </div>

              {/* Tech 2 */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-7 sm:p-8 hover:border-zinc-300 transition-colors shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-block rounded-md bg-zinc-900 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider mb-4">
                    Markdown Engine
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Data Management</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Powered by structured local Markdown workflows and robust database layers.
                  </p>
                </div>
              </div>

              {/* Tech 3 */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-7 sm:p-8 hover:border-zinc-300 transition-colors shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-block rounded-md bg-zinc-900 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider mb-4">
                    Cloud Storage
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Asset Storage</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Scaled using reliable cloud storage architecture to keep media delivery fast
                    and seamless.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Get in Touch */}
        <section className="py-16 sm:py-24 bg-zinc-50">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 lg:p-16 shadow-sm">
              <div className="max-w-2xl mb-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1365A4] mb-2 block">
                  Connect With Us
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
                  Get in Touch
                </h2>
                <p className="mt-4 text-base text-zinc-600 leading-relaxed">
                  We love hearing from fellow developers, designers, and tech enthusiasts. Whether
                  you have a project pitch, a technical question, or feedback on our coverage, feel
                  free to reach out to our editorial desk.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-200">
                {/* Email Channel */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                      <svg className="size-4 text-[#1365A4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      Direct Inquiries
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-1">Email</h3>
                    <p className="text-xs text-zinc-500 mb-4">
                      Reach our editors, writers, and technical reviewers directly.
                    </p>
                  </div>
                  <a
                    href="mailto:vendoraglobalsolutions@gmail.com"
                    className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-[#1365A4] hover:text-[#0e4c7c] hover:underline"
                  >
                    <span>vendoraglobalsolutions@gmail.com</span>
                    <span>&rarr;</span>
                  </a>
                </div>

                {/* Community & Updates Channel */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                      <svg className="size-4 text-[#1365A4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
                        <circle cx="5" cy="19" r="1" />
                      </svg>
                      Stay Informed
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-1">Community &amp; Updates</h3>
                    <p className="text-xs text-zinc-500 mb-4">
                      Follow our latest publishing feed right here on the site.
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 hover:underline"
                  >
                    <span>Browse Publishing Feed</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
