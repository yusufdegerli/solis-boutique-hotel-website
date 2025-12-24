import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getRooms } from "@/services/hotelService";
import Image from "next/image";
import Link from "next/link";
import { Users, Maximize2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import RoomImageSlider from "@/components/RoomImageSlider";
import { getAmenityIcon, getAmenityLabel } from "@/lib/amenityOptions";

export default async function RoomsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [rooms, t] = await Promise.all([getRooms(), getTranslations('Rooms')]);

  return (
    <main className="min-h-screen bg-[var(--off-white)]">
      <Navbar locale={locale} />
      
      <div className="bg-[var(--off-black)] text-white py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1920&q=80"
            alt="Rooms Background"
            fill
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4 font-serif">{t('title')}</h1>
            <p className="text-gray-300 max-w-2xl mx-auto px-4 font-light font-sans tracking-wide">
              {t('desc')}
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid gap-12">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-xl flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-full relative h-[400px] md:h-[500px]">
                <RoomImageSlider 
                  images={room.images && room.images.length > 0 ? room.images : [room.image]} 
                  roomName={room.name} 
                />
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <h3 className="text-4xl font-serif font-bold text-[var(--off-black)]">{room.name}</h3>
                    <div className="flex items-center gap-6 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Maximize2 className="w-4 h-4 text-[var(--gold)]" />
                            <span className="font-sans text-sm">{room.size}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[var(--gold)]" />
                            <span className="font-sans text-sm">{room.capacity}</span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 mb-10 font-sans leading-relaxed text-lg">
                  {room.description}
                </p>
                
                <div className="mt-auto border-t border-gray-100 pt-8">
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
                        
                        {/* Amenities Section */}
                        {room.amenities && room.amenities.length > 0 ? (
                            <div className="flex flex-wrap justify-center xl:justify-start gap-3 flex-1">
                                {room.amenities.map(key => {
                                    const Icon = getAmenityIcon(key);
                                    const label = getAmenityLabel(key);
                                    return (
                                    <div key={key} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600 border border-gray-100 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors" title={label}>
                                        <Icon size={16} />
                                        <span className="hidden sm:inline">{label}</span>
                                    </div>
                                    )
                                })}
                            </div>
                        ) : <div className="flex-1"></div>}

                        {/* Price & Action */}
                        <div className="flex items-center gap-6 shrink-0">
                            <div className="text-right">
                                <span className="block text-xs text-gray-400 uppercase tracking-wider font-sans mb-1">{t('night')}</span>
                                <div className="text-3xl font-serif font-bold text-[var(--gold)]">
                                    €{room.price.toLocaleString('en-US')}
                                </div>
                            </div>
                            <Link 
                                href={`/${locale}/reservation`} 
                                className="px-10 py-4 bg-[var(--off-black)] text-white font-serif font-bold uppercase tracking-widest rounded hover:bg-[var(--gold)] transition-colors shadow-lg hover:shadow-xl"
                            >
                                {t('book')}
                            </Link>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}