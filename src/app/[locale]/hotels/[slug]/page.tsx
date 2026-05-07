import { getHotels, getHotelBySlug } from "@/services/hotelService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, CheckCircle, Phone, Mail, Map, BedDouble, PieChart, Info, HardHat, ArrowLeft, ExternalLink } from "lucide-react";
import { getLocalizedText } from "@/lib/localize";
import { getTranslations } from "next-intl/server";

export async function generateStaticParams() {
  const locales = ['en', 'tr', 'ar', 'hu', 'ro'];
  const params = [];
  const hotels = await getHotels();

  for (const locale of locales) {
    for (const hotel of hotels) {
      params.push({ locale, slug: hotel.slug });
      params.push({ locale, slug: hotel.slug + '/book' }); // This is handled by a separate page.tsx, but good for context
    }
  }
  return params;
}

export default async function HotelDetail({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Reservation' });
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  // Handle Under Construction state
  if ((hotel as any).underConstruction) {
    return (
      <main className="min-h-screen bg-black flex flex-col">
        <Navbar locale={locale} />
        <div className="flex-grow flex items-center justify-center relative overflow-hidden pt-24">
          <div className="absolute inset-0 z-0">
            <Image
              src={hotel.image}
              alt="Construction"
              fill
              className="object-cover opacity-30 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
            <div className="w-24 h-24 bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm animate-pulse">
              <HardHat className="w-12 h-12 text-[var(--gold)]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 uppercase tracking-widest">{hotel.name}</h1>
            <div className="inline-block px-6 py-2 bg-[var(--gold)] text-black font-bold text-sm uppercase tracking-[0.2em] mb-8 rounded-sm">
              {locale === 'tr' ? 'İnşaat Devam Ediyor' : 'Under Construction'}
            </div>
            <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed mb-12">
              {getLocalizedText(hotel.description, locale)}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href={`/${locale}`} 
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-serif uppercase tracking-widest hover:bg-[var(--gold)] hover:text-white transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
        <Footer locale={locale} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--off-white)]">
      <Navbar locale={locale} />

      {/* Hero Header */}
      <div className="relative h-[70vh] w-full">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-4xl px-4 mt-20">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif drop-shadow-2xl">{hotel.name}</h1>
            <p className="text-xl md:text-2xl text-white/90 font-light font-sans tracking-wide">{hotel.tagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-24">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3">

            {/* Main Content */}
            <div className="lg:col-span-2 p-8 md:p-12">
              <div className="flex items-center gap-2 text-[var(--gold)] mb-8">
                <MapPin className="w-6 h-6" />
                <span className="font-medium text-xl font-serif text-[var(--off-black)]">{hotel.location}</span>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 mb-10 border-y border-gray-100 py-6">
                <div className="text-center border-r border-gray-100">
                  <BedDouble className="w-6 h-6 text-[var(--gold)] mx-auto mb-2" />
                  <span className="block text-2xl font-bold text-[var(--off-black)] font-serif">{hotel.stats.totalRooms}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Oda Sayısı</span>
                </div>
                <div className="text-center border-r border-gray-100">
                  <PieChart className="w-6 h-6 text-[var(--gold)] mx-auto mb-2" />
                  <span className="block text-2xl font-bold text-[var(--off-black)] font-serif">%{hotel.stats.availability}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Müsaitlik</span>
                </div>
                <div className="text-center">
                  <Star className="w-6 h-6 text-[var(--gold)] mx-auto mb-2" />
                  <span className="block text-2xl font-bold text-[var(--off-black)] font-serif">{hotel.rating}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Puan</span>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-[var(--off-black)] font-serif">Otel Hakkında</h2>
              <p className="text-gray-600 leading-relaxed mb-10 text-lg font-sans">
                {getLocalizedText(hotel.description, locale)}
              </p>

              <h3 className="text-2xl font-bold mb-6 text-[var(--off-black)] font-serif">Öne Çıkan Özellikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {hotel.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-[var(--gold)] transition-colors">
                    <CheckCircle className="w-5 h-5 text-[var(--gold)]" />
                    <span className="font-sans">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Map Section */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-6 text-[var(--off-black)] font-serif flex items-center gap-2">
                  <Map className="w-6 h-6 text-[var(--gold)]" /> Lokasyon
                </h3>
                <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-100 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${hotel.coordinates.lat},${hotel.coordinates.lng}&hl=tr&z=14&amp;output=embed`}
                    className="filter grayscale hover:grayscale-0 transition-all duration-500"
                  >
                  </iframe>
                </div>
                <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Tam konum bilgisi Google Haritalar üzerinden sağlanmaktadır.
                </p>
              </div>

              {/* Contact Info */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-2xl font-bold mb-6 text-[var(--off-black)] font-serif">İletişim Bilgileri</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <Phone className="w-5 h-5 text-[var(--gold)]" />
                    <span className="font-sans">{hotel.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <Mail className="w-5 h-5 text-[var(--gold)]" />
                    <span className="font-sans">{hotel.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <Map className="w-5 h-5 text-[var(--gold)]" />
                    <span className="font-sans">{hotel.contact.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar / Booking Card */}
            <div className="bg-gray-50 p-8 md:p-12 border-l border-gray-100">
              <div className="sticky top-32 space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[var(--gold)]">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <span className="block text-xs text-gray-400 uppercase tracking-wider font-sans mb-1">Gecelik Başlangıç</span>
                      <span className="text-4xl font-bold text-[var(--off-black)] font-serif">€{hotel.pricePerNight.toLocaleString('en-US')}</span>
                    </div>
                  </div>

                  <Link
                    href={`/${locale}/hotels/${hotel.slug}/book`}
                    className="block w-full py-5 bg-[var(--gold)] text-white text-center font-bold text-lg rounded-sm hover:bg-[var(--off-black)] transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 duration-200 font-serif uppercase tracking-widest"
                  >
                    Hemen Rezervasyon Yap
                  </Link>
                  <p className="text-xs text-center text-gray-400 mt-6 font-sans leading-relaxed">
                    Rezervasyonunuzu şimdi yapın, ödemeyi otelde gerçekleştirin. Ücretsiz iptal seçeneği son 24 saate kadar geçerlidir.
                  </p>
                </div>

                {hotel.bookingLinks && Object.keys(hotel.bookingLinks).length > 0 && (
                  <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-[var(--gold)]">
                    <h4 className="font-serif font-bold text-xl mb-6 text-[var(--off-black)]">Online Kanallar</h4>
                    <div className="space-y-3">
                      {(hotel.bookingLinks as any).official && (
                        <a 
                          href={(hotel.bookingLinks as any).official} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-[var(--off-black)] text-white rounded-lg hover:bg-[var(--gold)] transition-all group"
                        >
                          <span className="font-bold">{t('officialWebsite')}</span>
                          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </a>
                      )}
                      {hotel.bookingLinks.expedia && (
                        <a 
                          href={hotel.bookingLinks.expedia} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-[var(--gold)] hover:text-white transition-all group"
                        >
                          <span className="font-bold">Expedia</span>
                          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </a>
                      )}
                      {hotel.bookingLinks.booking && (
                        <a 
                          href={hotel.bookingLinks.booking} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-[var(--gold)] hover:text-white transition-all group"
                        >
                          <span className="font-bold">Booking.com</span>
                          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </a>
                      )}
                      {hotel.bookingLinks.hotels_com && (
                        <a 
                          href={hotel.bookingLinks.hotels_com} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-[var(--gold)] hover:text-white transition-all group"
                        >
                          <span className="font-bold">Hotels.com</span>
                          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </a>
                      )}
                      {hotel.bookingLinks.agoda && (
                        <a 
                          href={hotel.bookingLinks.agoda} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-[var(--gold)] hover:text-white transition-all group"
                        >
                          <span className="font-bold">Agoda</span>
                          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-[var(--off-black)] text-white p-8 rounded-xl shadow-lg">
                  <h4 className="font-serif font-bold text-xl mb-4 text-[var(--gold)]">Özel Fırsat</h4>
                  <p className="text-gray-300 text-sm font-sans mb-6">
                    Bu otele yapacağınız 5 gece ve üzeri rezervasyonlarda ücretsiz havaalanı transferi ve Spa indirimi kazanın.
                  </p>
                  <Link href={`/${locale}/services`} className="text-white underline text-sm font-sans hover:text-[var(--gold)]">Detayları İncele</Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer locale={locale} />
    </main>
  );
}
