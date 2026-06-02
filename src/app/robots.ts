import { getAbsoluteUrl } from '@/lib/site';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '*',
      },
    ],
    sitemap: getAbsoluteUrl('/sitemap.xml'),
  };
}
