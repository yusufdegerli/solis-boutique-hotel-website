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

  const isSolisBoutique = slug === 'solis-hotel-istanbul';

  const bookingPlatforms = isSolisBoutique ? [
    {
      id: 'official',
      name: t('officialWebsite'),
      url: "https://solisboutiquehotel.com",
      logo: '/logo3.png'
    },
    {
      id: 'booking',
      name: 'Booking.com',
      url: "https://www.booking.com/Share-eSoBspi",
      logo: 'https://www.logo.wine/a/logo/Booking.com/Booking.com-Logo.wine.svg'
    },
    {
      id: 'expedia',
      name: 'Expedia',
      url: "https://expe.onelink.me/hnLd/qaoed69m",
      logo: 'https://www.logo.wine/a/logo/Expedia/Expedia-Logo.wine.svg'
    },
    {
      id: 'hotels_com',
      name: 'Hotels.com',
      url: "https://tr.hotels.com/ho3406787680/?chkin=2026-05-19&chkout=2026-05-20&x_pwa=1&rfrr=HSR&pwa_ts=1778009180659&referrerUrl=aHR0cHM6Ly90ci5ob3RlbHMuY29tL0hvdGVsLVNlYXJjaA%3D%3D&useRewards=false&rm1=a2&regionId=1639&destination=İstanbul%2C+Istanbul%2C+Türkiye&destType=MARKET&neighborhoodId=6272783&selected=106430865&latLong=41.01357%2C28.96352&sort=RECOMMENDED&top_dp=5024&top_cur=TRY&gclid=CjwKCAjwqubPBhBOEiwAzgZX2gVHbUhbqLUcHLcmGkKFrkxeg3X7TN3wxbwRz_TkERXVti0_kMeirBoCiXcQAvD_BwE&semcid=HCOM-TR.UB.GOOGLE.PT-c-TR.HOTEL&semdtl=a115308987003.b1192332174390.g1kwd-2371467561061.e1c.m1CjwKCAjwqubPBhBOEiwAzgZX2gVHbUhbqLUcHLcmGkKFrkxeg3X7TN3wxbwRz_TkERXVti0_kMeirBoCiXcQAvD_BwE.r1.c1.j19198944.k19199120.d1784327484831.h1e.i1.l1.n1.o1.p1.q1.s1solis+boutique+hotel.t1.x1.f1.u1.v1.w1&userIntent=&selectedRoomType=327612372&selectedRatePlan=405661457&expediaPropertyId=106430865&searchId=e8f5735a-e104-4217-ac63-eaee7f93ef35",
      logo: 'https://www.logo.wine/a/logo/Hotels.com/Hotels.com-Logo.wine.svg'
    }
  ] : [];

  const whatsappNumber = "905334127275";

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
                    className={`relative flex items-center justify-center p-1 h-16 rounded-xl border border-gray-100 hover:border-[var(--gold)] hover:shadow-lg transition-all duration-300 group shadow-sm overflow-hidden ${platform.id === 'official' ? 'bg-[#0a0a0a]' : 'bg-white'}`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center z-10 px-2">
                      <img 
                        src={platform.logo} 
                        alt={platform.name}
                        className={`h-full w-auto object-contain transition-all duration-500 group-hover:scale-[1.1] ${platform.id === 'official' ? 'p-2' : 'scale-[1.5] group-hover:scale-[1.6]'}`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/20 to-transparent -translate-x-full group-hover:animate-shimmer z-0" />
                  </a>
                ))}

                {/* WhatsApp Option */}
                <div className={`flex flex-col items-center ${isSolisBoutique ? 'mt-6 pt-6 border-t border-gray-50' : ''}`}>
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
