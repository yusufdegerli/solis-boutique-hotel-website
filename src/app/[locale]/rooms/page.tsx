import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getRooms } from "@/services/hotelService";
import Image from "next/image";
import { Users, Maximize2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import RoomImageSlider from "@/components/RoomImageSlider";
import { getAmenityIcon, getAmenityLabel } from "@/lib/amenityOptions";
import BookButton from "@/components/BookButton";

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-xl flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-full relative h-64 md:h-72">
                <RoomImageSlider 
                  images={room.images && room.images.length > 0 ? room.images : [room.image]} 
                  roomName={room.name} 
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <h3 className="text-2xl font-serif font-bold text-[var(--off-black)]">{room.name}</h3>
                    <div className="flex items-center gap-4 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg shrink-0">
                        <div className="flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5 text-[var(--gold)]" />
                            <span className="font-sans text-xs">{room.size}</span>
                        </div>
                        <div className="w-px h-3 bg-gray-300"></div>
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[var(--gold)]" />
                            <span className="font-sans text-xs">{room.capacity}</span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 mb-6 font-sans leading-relaxed text-sm line-clamp-3">
                  {room.description}
                </p>
                
                <div className="mt-auto border-t border-gray-100 pt-6">
                    <div className="flex flex-col gap-6">
                        
                        {/* Amenities Section */}
                        {room.amenities && room.amenities.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {room.amenities.slice(0, 5).map(key => {
                                    const Icon = getAmenityIcon(key);
                                    const label = getAmenityLabel(key);
                                    return (
                                    <div key={key} className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded text-xs text-gray-600 border border-gray-100" title={label}>
                                        <Icon size={14} />
                                        <span className="">{label}</span>
                                    </div>
                                    )
                                })}
                                {room.amenities.length > 5 && (
                                  <span className="text-xs text-gray-400 flex items-center px-2">+{room.amenities.length - 5}</span>
                                )}
                            </div>
                        ) : null}

                        {/* Price & Action */}
                        <div className="flex items-center justify-between gap-4 mt-2">
                            <div>
                                <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-sans mb-0.5">{t('night')}</span>
                                <div className="text-2xl font-serif font-bold text-[var(--gold)]">
                                    €{room.price.toLocaleString('en-US')}
                                </div>
                            </div>
                            <BookButton 
                                href={`/${locale}/reservation`} 
                                text={t('book')} 
                            />
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