import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ArrowRight, Wifi, Coffee, Waves } from "lucide-react";
import { Hotel } from "@/lib/data";

interface HotelCardProps {
  hotel: Hotel;
  locale?: string; // Add locale prop
}

export default function HotelCard({ hotel, locale = 'tr' }: HotelCardProps) {
  // Select a few icons based on features (simple logic for demo)
  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes("wi-fi")) return <Wifi className="w-3 h-3" />;
    if (feature.toLowerCase().includes("havuz")) return <Waves className="w-3 h-3" />;
    return <Coffee className="w-3 h-3" />;
  };

  return (
    <div className="group bg-white rounded-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2">
      <div className="relative h-80 w-full overflow-hidden">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-sm flex items-center gap-1 shadow-sm border border-gray-100">
          <Star className="w-3.5 h-3.5 text-[var(--gold)] fill-[var(--gold)]" />
          <span className="font-bold text-sm text-gray-800 font-serif">{hotel.rating}</span>
        </div>

        <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-1.5 text-[var(--gold)] mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest font-sans">{hotel.location}</span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-white group-hover:text-[var(--gold)] transition-colors">
            {hotel.name}
            </h3>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow relative bg-white">
        <p className="text-gray-500 mb-8 line-clamp-2 text-sm leading-relaxed font-sans font-light">
          {hotel.description}
        </p>

        {/* Mini features preview */}
        <div className="flex gap-2 mb-8 border-b border-gray-100 pb-8">
            {hotel.features.slice(0, 3).map((f, i) => (
                <span key={i} className="text-[10px] uppercase tracking-wider border border-gray-200 px-3 py-1 rounded-sm text-gray-500 flex items-center gap-2 font-sans hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors cursor-default">
                    {getFeatureIcon(f)} {f.split(' ')[0]}
                </span>
            ))}
        </div>
        
        <div className="flex items-end justify-between mt-auto">
          <div>
            <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1 font-sans">Başlangıç</span>
            <div className="text-2xl font-serif font-bold text-[var(--off-black)]">
              ₺{hotel.pricePerNight.toLocaleString('tr-TR')}
            </div>
          </div>
          
          <Link 
            href={`/${locale}/hotels/${hotel.slug}`} // Corrected Link structure
            className="flex items-center justify-center w-12 h-12 rounded-full border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110"
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
