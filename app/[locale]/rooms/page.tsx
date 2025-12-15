import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getRooms } from "@/src/services/hotelService";
import Image from "next/image";
import Link from "next/link";
import { Users, Maximize2 } from "lucide-react";

export default async function RoomsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const rooms = await getRooms();

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
            <h1 className="text-5xl font-bold mb-4 font-serif">Konaklama</h1>
            <p className="text-gray-300 max-w-2xl mx-auto px-4 font-light font-sans tracking-wide">
              Konfor ve lüksün mükemmel uyumu. Size özel tasarlanmış odalarımızda evinizin sıcaklığını hissedin.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid gap-12">
          {rooms.map((room, index) => (
            <div key={room.id} className={`bg-white rounded-xl overflow-hidden shadow-xl flex flex-col md:flex-row h-full ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="md:w-1/2 relative min-h-[300px] md:min-h-[400px]">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-serif font-bold text-[var(--off-black)] mb-4">{room.name}</h3>
                <p className="text-gray-600 mb-8 font-sans leading-relaxed">
                  {room.description}
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Maximize2 className="w-5 h-5 text-[var(--gold)]" />
                    <span className="font-sans">{room.size}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users className="w-5 h-5 text-[var(--gold)]" />
                    <span className="font-sans">{room.capacity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-8 mt-auto">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-sans">Gecelik</span>
                    <div className="text-2xl font-serif font-bold text-[var(--gold)]">
                      ₺{room.price.toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <Link 
                    href={`/${locale}/reservation`} 
                    className="px-8 py-3 bg-[var(--off-black)] text-white font-serif text-sm uppercase tracking-widest rounded-sm hover:bg-[var(--gold)] transition-colors"
                  >
                    Rezervasyon
                  </Link>
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