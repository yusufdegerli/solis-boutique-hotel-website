import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getTranslations } from 'next-intl/server';

export default async function IstanbulHistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'History' });

  return (
    <main className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Cinematic Header */}
      <div className="relative h-[80vh] w-full flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1920&q=80"
          alt="Istanbul Skyline"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[var(--gold)] font-sans uppercase tracking-[0.3em] mb-4 text-sm bg-black/50 px-4 py-2 backdrop-blur-md">{t('tag')}</span>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-white drop-shadow-2xl">{t('title')}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="prose prose-lg mx-auto font-sans text-gray-600">
          <p className="text-2xl font-serif text-[var(--off-black)] font-bold italic leading-relaxed text-center mb-12 border-b-2 border-[var(--gold)] pb-12">
            {t('quote')}
          </p>

          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-[var(--off-black)] mb-6">{t('section1Title')}</h2>
            <p className="mb-6">
              {t('section1Desc')}
            </p>
            <div className="grid grid-cols-2 gap-4 my-8">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80" alt="Sultanahmet" fill className="object-cover" />
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80" alt="Bosphorus" fill className="object-cover" />
              </div>
            </div>
            <p>
              {t('section1Extra')}
            </p>
          </div>

          <div className="space-y-16">
            <section>
              <h2 className="text-3xl font-serif font-bold text-[var(--off-black)] mb-6">Sultanahmet'ten Kapalıçarşı'ya: Yaya Turu Rehberi</h2>
              <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
                <Image src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80" alt="Old City Walk" fill className="object-cover" />
              </div>
              <p>Tarihi yarımadayı keşfetmek için hazırladığımız yürüyüş rotası, sizi yüzyıllar öncesine götürecek. Ayasofya'dan başlayıp dar sokaklardan geçerek Kapalıçarşı'nın mistik atmosferine ulaşacağınız bu yolculukta her köşe başında bir hikaye bulacaksınız.</p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-bold text-[var(--off-black)] mb-6">Boğaz'da Gün Batımı: Unutulmaz Tekne Turu Deneyimi</h2>
              <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
                <Image src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80" alt="Bosphorus Sunset" fill className="object-cover" />
              </div>
              <p>Boğaz'ın iki yakasını birbirine bağlayan bu eşsiz suda, gün batımının pembe ve altın rengi tonlarını izleyin. İstanbul'un siluetini denizden seyretmek, şehre bambaşka bir perspektiften bakmanızı sağlayacak.</p>
            </section>
          </div>

          <div className="bg-[var(--off-white)] p-10 rounded-2xl border-l-4 border-[var(--gold)] my-16">
            <h3 className="text-2xl font-serif font-bold text-[var(--off-black)] mb-4">{t('section2Title')}</h3>
            <p className="mb-0">
              {t('section2Desc')}
            </p>
          </div>
        </div>
      </div>
      <Footer locale={locale} />
    </main>
  );
}
