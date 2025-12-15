"use client";

import { useState } from "react";
import { Calendar, Users, Hotel as HotelIcon } from "lucide-react";
import { Hotel } from "@/lib/data";

export default function ReservationForm({ preSelectedHotelId, hotels }: { preSelectedHotelId?: string, hotels: Hotel[] }) {
  const [selectedHotel, setSelectedHotel] = useState(preSelectedHotelId || "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-green-800">Rezervasyon Talebi Alındı!</h3>
        <p className="text-green-700">
          Talebiniz başarıyla bize ulaştı. Müşteri temsilcimiz en kısa sürede sizinle iletişime geçecektir.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="text-green-700 font-medium hover:underline mt-4 block mx-auto"
        >
          Yeni Rezervasyon Yap
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--off-black)] mb-6 flex items-center gap-2">
          <HotelIcon className="w-5 h-5 text-[var(--gold)]" />
          Rezervasyon Detayları
        </h3>

        {/* Hotel Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Otel Seçimi</label>
          <div className="relative">
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              required
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all appearance-none text-gray-700"
            >
              <option value="" disabled>Lütfen bir otel seçin</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} - {hotel.location}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Giriş Tarihi</label>
            <div className="relative">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Çıkış Tarihi</label>
            <div className="relative">
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Misafir Sayısı</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="10"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
            />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[var(--gold)] text-white font-bold py-4 rounded-lg hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200"
      >
        Uygunluk Kontrol Et
      </button>
    </form>
  );
}
