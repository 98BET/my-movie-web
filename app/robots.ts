import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://yourdomain.com'; // เปลี่ยนเป็นโดเมนจริงในอนาคต

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'], // ห้ามบอตเข้าหน้าหลังบ้านและ API routes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}