import { getAbsoluteUrl } from '@/lib/site';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/', // This is intentional to hide from search engines; this is only an example site
      },
    ],
    sitemap: getAbsoluteUrl('/sitemap.xml'),
  };
}
