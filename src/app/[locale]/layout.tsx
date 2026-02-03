import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import WhatsAppButton from "@/components/WhatsAppButton";
import LiveChat from "@/components/LiveChat";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Solis Hotels | İstanbul'da Lüks Konaklama",
    template: "%s | Solis Hotels",
  },
  description: "İstanbul'un kalbinde eşsiz bir konaklama deneyimi. Solis Hotels ile lüks, konfor ve Türk misafirperverliğini keşfedin.",
  keywords: ["otel", "istanbul", "konaklama", "lüks otel", "boutique hotel", "solis hotels", "sultanahmet", "taksim"],
  authors: [{ name: "Solis Hotels" }],
  creator: "Solis Hotels",
  publisher: "Solis Hotels",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://solis-hotels.com'),
  alternates: {
    canonical: '/',
    languages: {
      'tr': '/tr',
      'en': '/en',
      'ru': '/ru',
      'ar': '/ar',
      'ro': '/ro',
      'hu': '/hu',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    siteName: 'Solis Hotels',
    title: "Solis Hotels | İstanbul'da Lüks Konaklama",
    description: "İstanbul'un kalbinde eşsiz bir konaklama deneyimi. Solis Hotels ile lüks, konfor ve Türk misafirperverliğini keşfedin.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Solis Hotels - İstanbul',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Solis Hotels | İstanbul'da Lüks Konaklama",
    description: "İstanbul'un kalbinde eşsiz bir konaklama deneyimi.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    // Google Search Console doğrulama kodu (opsiyonel)
    // google: 'your-google-verification-code',
  },
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!['tr', 'en', 'ru', 'ar', 'ro', 'hu'].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="scroll-smooth">
      <body
        className={`${outfit.variable} ${jakarta.variable} antialiased font-body`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <WhatsAppButton />
          <LiveChat locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}