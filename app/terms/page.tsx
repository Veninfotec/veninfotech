import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms & Conditions and Editorial Disclaimer | Veninfotech',
  description:
    'Read the Terms and Conditions and Editorial Disclaimer for Veninfotech (veninfotech.net). Covers intellectual property, acceptable use, and content disclaimers.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms & Conditions and Editorial Disclaimer | Veninfotech',
    description:
      'Official Terms of Use, Intellectual Property policies, and Editorial Disclaimers for Veninfotech.',
    url: 'https://veninfotech.net/terms',
    siteName: 'Veninfotech',
    type: 'website',
  },
};

const TERMS_SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'intellectual-property', title: '2. Intellectual Property & License' },
  { id: 'editorial-disclaimer', title: '3. Editorial & Technical Disclaimer' },
  { id: 'external-links', title: '4. External Links & Third-Party Content' },
  { id: 'user-conduct', title: '5. Acceptable Use & Conduct' },
  { id: 'limitation-of-liability', title: '6. Limitation of Liability' },
  { id: 'modifications', title: '7. Revisions & Modifications' },
  { id: 'contact', title: '8. Contact & Legal Inquiries' },
];

export default function TermsPage() {
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
              <span className="text-[#1365A4] font-semibold">Terms &amp; Disclaimer</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-700 mb-5 shadow-xs">
                <span className="size-2 rounded-full bg-[#1365A4]" />
                <span>Terms of Service &amp; Disclaimer</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 leading-[1.15]">
                Terms &amp; Conditions and Disclaimer
              </h1>

              <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
                Welcome to Veninfotech. These Terms and Conditions and Editorial Disclaimers outline the rules, guidelines, and legal boundaries for the use of Veninfotech&apos;s website, located at{' '}
                <span className="font-mono text-sm text-zinc-800">https://veninfotech.net</span>.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
                  Effective Date: January 1, 2026
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
                  Last Updated: November 2, 2026
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Sidebar Navigation */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1365A4] mb-4">
                  Sections
                </h2>
                <nav aria-label="Terms and disclaimer sections">
                  <ul className="space-y-2 text-xs sm:text-sm">
                    {TERMS_SECTIONS.map((sec) => (
                      <li key={sec.id}>
                        <a
                          href={`#${sec.id}`}
                          className="block rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-[#1365A4] font-medium transition-colors"
                        >
                          {sec.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-6 pt-6 border-t border-zinc-200 space-y-2">
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Also review our data handling practices:
                  </p>
                  <Link
                    href="/privacy-policy"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1365A4] hover:underline"
                  >
                    <span>Privacy Policy</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </aside>

              {/* Clauses */}
              <div className="lg:col-span-8 space-y-8">
                {/* 1. Acceptance */}
                <article id="acceptance" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    By accessing this website, we assume you accept these Terms and Conditions in full. Do not continue to use Veninfotech if you do not agree to take all of the terms and conditions stated on this page. Your continued use of the site constitutes your agreement to follow and be bound by these terms as well as our{' '}
                    <Link href="/privacy-policy" className="text-[#1365A4] font-medium hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </article>

                {/* 2. Intellectual Property */}
                <article id="intellectual-property" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    2. Intellectual Property &amp; License
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    Unless otherwise stated, Veninfotech and/or its licensors own the intellectual property rights for all original editorial material, software analyses, graphics, and design elements on Veninfotech. All intellectual property rights are reserved. You may view and/or print pages from{' '}
                    <span className="font-mono text-xs text-zinc-800">https://veninfotech.net</span> for your own personal, non-commercial use subject to restrictions set in these terms and conditions.
                  </p>
                  <p className="text-sm font-semibold text-zinc-900">You must not:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
                    <li>Republish material from Veninfotech verbatim without clear attribution and prior written consent.</li>
                    <li>Sell, rent, or sub-license content from Veninfotech.</li>
                    <li>Reproduce, duplicate, or copy material from Veninfotech for commercial redistribution.</li>
                  </ul>
                </article>

                {/* 3. Editorial & Technical Disclaimer */}
                <article id="editorial-disclaimer" className="scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50/40 p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="inline-flex items-center gap-2 rounded bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Important Notice
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    3. Editorial, Technical &amp; Financial Disclaimer
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                    All information, news reports, technology reviews, and engineering guides published on Veninfotech are provided in good faith and for general informational and educational purposes only.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-zinc-700 leading-relaxed">
                    <li>
                      <strong className="text-zinc-900">No Professional Advice:</strong> Articles covering economy, markets, legal developments, science, or cybersecurity do not constitute professional financial, investment, legal, or medical advice. Always consult with a qualified professional before making financial or business decisions.
                    </li>
                    <li>
                      <strong className="text-zinc-900">Technical &amp; Code Guides:</strong> Software engineering tutorials, architectural patterns, and hardware benchmarks are shared &ldquo;as-is&rdquo;. Always test configurations and code in a staging environment before deploying to production systems.
                    </li>
                    <li>
                      <strong className="text-zinc-900">Accuracy &amp; Timeliness:</strong> While our editorial desk strives to verify facts from reputable wire sources and primary documentation, Veninfotech makes no warranties about the completeness, reliability, and accuracy of this information. Any action you take upon the information you find on this website is strictly at your own risk.
                    </li>
                  </ul>
                </article>

                {/* 4. External Links */}
                <article id="external-links" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    4. External Links &amp; Third-Party Content
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    From our website, you can visit other external websites by following hyperlinks to such external sites (including primary news sources, documentation, and partner platforms). While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these external sites.
                  </p>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    These links to other websites do not imply a blanket endorsement for all the content found on these sites. Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone &ldquo;bad&rdquo;.
                  </p>
                </article>

                {/* 5. Acceptable Use */}
                <article id="user-conduct" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    5. Acceptable Use &amp; Conduct
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    When accessing Veninfotech, you agree not to engage in automated scraping that degrades server performance, attempt unauthorized access to administrative endpoints, or submit spam or malicious payloads through our newsletter or contact forms.
                  </p>
                </article>

                {/* 6. Limitation of Liability */}
                <article id="limitation-of-liability" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    6. Limitation of Liability
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    In no event shall Veninfotech, nor any of its editors, authors, contributors, or affiliates, be held liable for anything arising out of or in any way connected with your use of this website, whether such liability is under contract, tort, or otherwise, including any indirect, consequential, or special liability arising out of or in any way related to your use of this website.
                  </p>
                </article>

                {/* 7. Revisions */}
                <article id="modifications" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    7. Revisions &amp; Modifications
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    Veninfotech is permitted to revise these Terms and Disclaimers at any time as it sees fit, and by using this website you are expected to review these Terms on a regular basis to stay informed of any updates.
                  </p>
                </article>

                {/* 8. Contact */}
                <article id="contact" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    8. Contact &amp; Legal Inquiries
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    If you require any more information or have any questions about our site&apos;s disclaimer or terms of service, please feel free to contact us by email or through our dedicated contact page:
                  </p>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Editorial &amp; Legal Desk
                      </p>
                      <a
                        href="mailto:vendoraglobalsolutions@gmail.com"
                        className="mt-1 inline-block font-mono text-sm font-semibold text-[#1365A4] hover:underline"
                      >
                        vendoraglobalsolutions@gmail.com
                      </a>
                    </div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-lg bg-[#1365A4] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0e4c7c] transition-colors"
                    >
                      Contact Us Page &rarr;
                    </Link>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

