import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = 'https://veninfotech.net';

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Veninfotech | Modern Technology Publication & Engineering Insights',
    template: '%s | Veninfotech',
  },
  description:
    'Veninfotech (VIT) is a leading technology publication delivering authoritative reporting, software engineering deep dives, artificial intelligence breakdowns, cloud infrastructure architecture, and digital transformation analysis.',
  applicationName: 'Veninfotech',
  keywords: [
    'Veninfotech',
    'VIT',
    'Technology News',
    'Software Engineering',
    'Artificial Intelligence',
    'Cloud Computing',
    'Cybersecurity',
    'Hardware Architecture',
    'Enterprise IT',
    'Tech Publication',
  ],
  authors: [{ name: 'Veninfotech Editorial Team', url: SITE_URL }],
  creator: 'Veninfotech',
  publisher: 'Veninfotech',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: {
      default: 'Veninfotech | Modern Technology Publication & Engineering Insights',
      template: '%s | Veninfotech',
    },
    description:
      'Veninfotech (VIT) is a leading technology publication delivering authoritative reporting, software engineering deep dives, artificial intelligence breakdowns, and digital transformation analysis.',
    url: SITE_URL,
    siteName: 'Veninfotech',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Veninfotech - Modern Technology Publication & Engineering Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'Veninfotech | Modern Technology Publication & Engineering Insights',
      template: '%s | Veninfotech',
    },
    description:
      'Veninfotech (VIT) is a leading technology publication delivering authoritative reporting, software engineering deep dives, and artificial intelligence breakdowns.',
    images: ['/images/og-default.jpg'],
    creator: '@veninfotech',
    site: '@veninfotech',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://veninfotech.net/#website',
      'url': 'https://veninfotech.net',
      'name': 'Veninfotech',
      'alternateName': ['VIT', 'Veninfotech Publication'],
      'description':
        'Veninfotech (VIT) is a leading technology publication delivering authoritative reporting, software engineering deep dives, artificial intelligence breakdowns, and digital transformation analysis.',
      'inLanguage': 'en-US',
      'publisher': {
        '@id': 'https://veninfotech.net/#organization',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://veninfotech.net/#organization',
      'name': 'Veninfotech',
      'alternateName': 'VIT',
      'url': 'https://veninfotech.net',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://veninfotech.net/android-chrome-512x512.png',
        'width': 512,
        'height': 512,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
