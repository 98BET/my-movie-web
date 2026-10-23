import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://14kmovie.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'], // ห้ามบอตเข้าหน้าหลังบ้านและ API routes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}