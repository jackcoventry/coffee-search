import { META_DESCRIPTION, META_TITLE, SKIP_LABEL } from '@/consts/label';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();

  return (
    <html lang="en">
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
        {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
      </body>
    </html>
  );
}
