import { MetadataRoute } from 'next';
import { getHotels } from '@/services/hotelService';

// Site base URL - production'da gerçek domain ile değiştirin
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://solis-hotels.com';

// Desteklenen diller
const LOCALES = ['tr', 'en', 'ru', 'ar', 'ro', 'hu'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Statik sayfalar
    const staticPages = [
        '',           // Ana sayfa
        '/rooms',
        '/services',
        '/blog',
        '/contact',
        '/reservation',
        '/reservation-status',
        '/pages/istanbul-history',
    ];

    // Her dil için statik sayfaları oluştur
    const staticRoutes: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
        staticPages.map((page) => ({
            url: `${BASE_URL}/${locale}${page}`,
            lastModified: new Date(),
            changeFrequency: page === '' ? 'daily' : 'weekly' as const,
            priority: page === '' ? 1.0 : 0.8,
        }))
    );

    // Dinamik otel sayfaları
    let hotelRoutes: MetadataRoute.Sitemap = [];
    try {
        const hotels = await getHotels();
        hotelRoutes = LOCALES.flatMap((locale) =>
            hotels.map((hotel) => ({
                url: `${BASE_URL}/${locale}/hotels/${hotel.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            }))
        );
    } catch (error) {
        console.error('Error generating hotel sitemap:', error);
    }

    return [...staticRoutes, ...hotelRoutes];
}
