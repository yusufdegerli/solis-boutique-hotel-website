import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://solis-hotels.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',           // API endpoint'lerini indexleme
                    '/admin/',         // Admin sayfaları (varsa)
                    '/_next/',         // Next.js internal dosyaları
                    '/reservation/manage/', // Özel rezervasyon yönetim linkleri
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
