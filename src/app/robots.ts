import { MetadataRoute } from 'next';

const baseUrl = 'https://zarwinto.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/store/*/manage/*',
          '/account/*',
          '/cart',
          '/checkout',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/*', '/admin/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
