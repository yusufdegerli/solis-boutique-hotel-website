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

export const metadata = {
  title: "Solis Hotels | Modern Luxury",
  description: "Experience the future of hospitality at Solis City and Solis Resort.",
};

export default async function RootLayout({
  children,
  params
}) {
  const { locale } = await params;
  
  if (!['en', 'tr', 'ar', 'hu', 'ro'].includes(locale)) {
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
