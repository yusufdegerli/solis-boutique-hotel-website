import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'gjgiykewaxmylnwdvikz.supabase.co',
      },
    ],
    // Optimize image loading
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache for 7 days
    formats: ['image/avif', 'image/webp'], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/tr/admin',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/tr/login',
        permanent: true,
      },
      {
        source: '/:locale/reservation',
        destination: 'https://tr.hotels.com/ho3406787680/?semcid=HCOM-TR.UB.GOOGLE.PT-DSA-c-TR.HOTEL&semdtl=a113476951092.b1124944680393.g1aud-2141179518447:dsa-977487782636.e1c.m1EAIaIQobChMI9pqz7faalAMVMJGDBx0OuSHeEAAYASAAEgIKmfD_BwE.r1.c1.j19199051.k19199120.d1660336623510.h1.i1290283925904.l1.n1.o1.p1.q1.s1.t1.x1.f1.u1.v1.w1&gad_source=1&gad_campaignid=13476951092&gbraid=0AAAAACTxZ9aqJKDc7BRD1l2afq77K6U9T&gclid=EAIaIQobChMI9pqz7faalAMVMJGDBx0OuSHeEAAYASAAEgIKmfD_BwE',
        permanent: false,
      }
    ];
  },
};

export default withNextIntl(nextConfig);
