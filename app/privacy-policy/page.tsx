import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy & Cookie Disclosures | Veninfotech',
  description:
    'Read the Veninfotech Privacy Policy. Learn how we collect, protect, and handle user data, cookies, Google AdSense advertising, and analytics across veninfotech.net.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy & Cookie Disclosures | Veninfotech',
    description:
      'Learn how Veninfotech collects, uses, and protects your personal data, cookies, and third-party advertising identifiers.',
    url: 'https://veninfotech.net/privacy-policy',
    siteName: 'Veninfotech',
    type: 'website',
  },
};

const POLICY_SECTIONS = [
  { id: 'overview', title: '1. Overview & Scope' },
  { id: 'information-collected', title: '2. Information We Collect' },
  { id: 'log-files', title: '3. Log Files & Analytics' },
  { id: 'cookies-and-beacons', title: '4. Cookies & Web Beacons' },
  { id: 'google-adsense', title: '5. Google AdSense & DART Cookie' },
  { id: 'third-party-policies', title: '6. Third-Party Privacy Policies' },
  { id: 'data-protection-rights', title: '7. GDPR & CCPA Data Rights' },
  { id: 'childrens-information', title: "8. Children's Information" },
  { id: 'contact', title: '9. Contact Our Privacy Desk' },
];

export default function PrivacyPolicyPage() {
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
              <span className="text-[#1365A4] font-semibold">Privacy Policy</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-700 mb-5 shadow-xs">
                <span className="size-2 rounded-full bg-[#1365A4]" />
                <span>Legal &amp; Compliance</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 leading-[1.15]">
                Privacy Policy
              </h1>

              <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
                At Veninfotech (<span className="font-mono text-sm text-zinc-800">veninfotech.net</span>), accessible from{' '}
                <span className="font-mono text-sm text-zinc-800">https://veninfotech.net</span>, one of our main priorities is the privacy and security of our visitors. This Privacy Policy document outlines the types of information that are collected and recorded by Veninfotech and how we use them.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
                  Effective Date: January 1, 2026
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
                  Last Reviewed: November 2, 2026
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
                  Contents
                </h2>
                <nav aria-label="Privacy policy sections">
                  <ul className="space-y-2 text-xs sm:text-sm">
                    {POLICY_SECTIONS.map((sec) => (
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

                <div className="mt-6 pt-6 border-t border-zinc-200">
                  <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                    Need to reach our editorial or compliance team regarding data privacy?
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1365A4] hover:underline"
                  >
                    <span>Go to Contact Page</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </aside>

              {/* Policy Clauses */}
              <div className="lg:col-span-8 space-y-8">
                {/* 1. Overview */}
                <article id="overview" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    1. Overview &amp; Scope
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in Veninfotech. This policy is not applicable to any information collected offline or via channels other than this website.
                  </p>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    By using our website, you hereby consent to our Privacy Policy and agree to its{' '}
                    <Link href="/terms" className="text-[#1365A4] font-medium hover:underline">
                      Terms and Conditions
                    </Link>
                    .
                  </p>
                </article>

                {/* 2. Information We Collect */}
                <article id="information-collected" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    2. Information We Collect
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
                    <li>
                      <strong className="text-zinc-900">Newsletter Subscriptions:</strong> When you subscribe to our editorial newsletter, we collect your email address solely to deliver technology briefings, news dispatches, and site updates. You may unsubscribe at any time.
                    </li>
                    <li>
                      <strong className="text-zinc-900">Direct Contact Inquiries:</strong> If you contact us directly via email or through our contact form, we may receive additional information about you such as your name, email address, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
                    </li>
                    <li>
                      <strong className="text-zinc-900">Usage &amp; Engagement Metrics:</strong> We record aggregate article view counts to identify popular reporting and improve editorial quality.
                    </li>
                  </ul>
                </article>

                {/* 3. Log Files */}
                <article id="log-files" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    3. Log Files &amp; Analytics
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    Veninfotech follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as a part of hosting services&apos; analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
                  </p>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, preventing automated abuse, and gathering demographic information.
                  </p>
                </article>

                {/* 4. Cookies & Web Beacons */}
                <article id="cookies-and-beacons" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    4. Cookies &amp; Web Beacons
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    Like any other modern website, Veninfotech uses &ldquo;cookies&rdquo;. These cookies are used to store information including visitors&apos; preferences, session security tokens, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
                  </p>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers&apos; respective websites.
                  </p>
                </article>

                {/* 5. Google AdSense & DoubleClick DART Cookie */}
                <article id="google-adsense" className="scroll-mt-24 rounded-2xl border border-blue-200 bg-blue-50/30 p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="inline-flex items-center gap-2 rounded bg-[#1365A4] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Advertising Disclosure
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    5. Google AdSense &amp; DoubleClick DART Cookie
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                    Google is a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to{' '}
                    <span className="font-mono text-xs text-zinc-900">www.veninfotech.net</span> and other sites on the internet.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-zinc-700 leading-relaxed">
                    <li>
                      Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to our website or other websites.
                    </li>
                    <li>
                      Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
                    </li>
                    <li>
                      Users may opt out of personalized advertising and the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy at:{' '}
                      <a
                        href="https://policies.google.com/technologies/ads"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1365A4] font-semibold underline break-all"
                      >
                        https://policies.google.com/technologies/ads
                      </a>
                    </li>
                  </ul>
                </article>

                {/* 6. Third-Party Privacy Policies */}
                <article id="third-party-policies" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    6. Third-Party Privacy Policies
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Veninfotech, which are sent directly to users&apos; browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                  </p>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    Note that Veninfotech has no access to or control over these cookies that are used by third-party advertisers. Veninfotech&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information, including their practices and instructions about how to opt out of certain options.
                  </p>
                </article>

                {/* 7. GDPR & CCPA Data Rights */}
                <article id="data-protection-rights" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    7. GDPR &amp; CCPA Data Protection Rights
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    We would like to make sure you are fully aware of all of your data protection rights under the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Every user is entitled to the following:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
                    <li>
                      <strong className="text-zinc-900">The right to access:</strong> You have the right to request copies of your personal data.
                    </li>
                    <li>
                      <strong className="text-zinc-900">The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.
                    </li>
                    <li>
                      <strong className="text-zinc-900">The right to erasure:</strong> You have the right to request that we erase your personal data (such as removing your email from our newsletter list), under certain conditions.
                    </li>
                    <li>
                      <strong className="text-zinc-900">The right to restrict or object to processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.
                    </li>
                  </ul>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
                  </p>
                </article>

                {/* 8. Children's Information */}
                <article id="childrens-information" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    8. Children&apos;s Information
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
                  </p>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    Veninfotech does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
                  </p>
                </article>

                {/* 9. Contact Us */}
                <article id="contact" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                    9. Contact Our Privacy Desk
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    If you have any questions, concerns, or requests regarding this Privacy Policy, our data practices, or your personal information, please contact us directly:
                  </p>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Editorial &amp; Compliance Desk
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

