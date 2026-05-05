import { getHotelBySlug } from "@/services/hotelService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Globe, MessageCircle } from "lucide-react";
import { getTranslations } from 'next-intl/server';

export default async function HotelBookingSelection({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Reservation' });
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  const bookingPlatforms = [
    {
      id: 'booking',
      name: 'Booking.com',
      url: hotel.bookingLinks?.booking || "https://www.booking.com/Share-eSoBspi",
      logo: 'https://www.logo.wine/a/logo/Booking.com/Booking.com-Logo.wine.svg'
    },
    {
      id: 'expedia',
      name: 'Expedia',
      url: hotel.bookingLinks?.expedia || "https://expe.onelink.me/hnLd/qaoed69m",
      logo: 'https://www.logo.wine/a/logo/Expedia/Expedia-Logo.wine.svg'
    },
    {
      id: 'hotels_com',
      name: 'Hotels.com',
      url: hotel.bookingLinks?.hotels_com || "https://tr.hotels.com/ho3406787680/",
      logo: 'https://www.logo.wine/a/logo/Hotels.com/Hotels.com-Logo.wine.svg'
    }
  ];

  const whatsappNumber = hotel.contact.phone.replace(/[^0-9]/g, '');

  return (
    <main className="min-h-screen bg-[var(--off-white)] flex flex-col">
      <Navbar locale={locale} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}} />
      
      <div className="flex-grow flex items-center justify-center py-20 px-4 md:py-32">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
            
            {/* Left Side: Hotel Info */}
            <div className="md:w-5/12 relative min-h-[350px] md:min-h-[500px] m-4 md:m-6 rounded-2xl overflow-hidden shadow-inner">
              <Image 
                src={hotel.image} 
                alt={hotel.name} 
                fill 
                className="object-cover transform hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8">
                <h1 className="text-3xl font-serif font-bold text-white mb-2">{hotel.name}</h1>
                <p className="text-white/80 text-xs font-sans flex items-center gap-2 tracking-widest uppercase">
                  <Globe className="w-3.5 h-3.5 text-[var(--gold)]" />
                  {hotel.location}
                </p>
              </div>
            </div>

            {/* Right Side: Booking Options */}
            <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white">
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--off-black)] mb-2">{t('selectionTitle')}</h2>
                <p className="text-gray-400 text-sm font-sans leading-relaxed italic">{t('selectionSubtitle')}</p>
              </div>

              <div className="grid gap-3">
                {bookingPlatforms.map((platform) => (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center p-1 h-16 rounded-xl border border-gray-100 hover:border-[var(--gold)] hover:shadow-lg transition-all duration-300 group bg-white shadow-sm overflow-hidden"
                  >
                    <div className="relative w-full h-full flex items-center justify-center z-10 px-2">
                      <img 
                        src={platform.logo} 
                        alt={platform.name}
                        className="h-full w-auto object-contain transition-all duration-500 scale-[1.5] group-hover:scale-[1.6]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Shimmer Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/20 to-transparent -translate-x-full group-hover:animate-shimmer z-0" />
                  </a>
                ))}

                {/* WhatsApp Option */}
                <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col items-center">
                  <a 
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] transition-all duration-300 w-full group shadow-md hover:shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-6 h-6 text-white fill-current" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">WhatsApp</span>
                      <span className="text-xs md:text-sm text-white font-medium leading-tight">
                        {t('whatsappMessage')}
                      </span>
                    </div>
                  </a>
                </div>

                <Link
                  href={`/${locale}/hotels/${hotel.slug}`}
                  className="flex items-center justify-center gap-2 text-gray-400 hover:text-[var(--gold)] text-xs font-medium pt-8 transition-colors group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> {t('backToHotel')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer locale={locale} />
    </main>
  );
}
