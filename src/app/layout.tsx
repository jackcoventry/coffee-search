import { META_DESCRIPTION, META_TITLE, SKIP_LABEL } from '@/consts/label';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: META_TITLE,
    template: '%s | ' + META_TITLE,
  },
  description: META_DESCRIPTION,
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: SITE_URL,
    siteName: META_TITLE,
    locale: 'en_GB',
    type: 'website',
    images: [{ url: '/og-default.webp', width: 1200, height: 630, alt: 'Coffee Search' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-default.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/DMMono-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SpecialGothicCondensedOne-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SpecialGothicExpandedOne-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a
          href="#content"
          className="skip-to-content | font-body absolute top-2 left-2 z-70 -m-px h-px w-px overflow-hidden border-0 bg-white p-0 whitespace-nowrap focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:p-5 focus:whitespace-normal"
        >
          {SKIP_LABEL}
        </a>
        <Header />
        <main id="content">{children}</main>
        <Footer />
        {process.env.VERCEL_ENV === 'production' ? <Analytics /> : null}
      </body>
    </html>
  );
}
