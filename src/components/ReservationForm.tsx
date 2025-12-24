"use client";

import { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Hotel, Room } from "@/lib/data";
import { createBooking } from "@/services/hotelService";
import { useTranslations } from "next-intl";
import { bookingSchema } from "@/lib/validations/booking";
import { ZodError } from "zod";

export default function ReservationForm({ 
  preSelectedHotelId, 
  hotels,
  allRooms 
}: { 
  preSelectedHotelId?: string, 
  hotels: Hotel[],
  allRooms: Room[]
}) {
  const t = useTranslations("Reservation");
  const [selectedHotel, setSelectedHotel] = useState(preSelectedHotelId || "");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState(""); 
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState(""); 
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format for min attributes
  const today = new Date().toLocaleDateString('en-CA');

  // Filter rooms based on selected hotel
  const availableRooms = useMemo(() => {
    if (!selectedHotel) return [];
    const filtered = allRooms.filter(room => room.hotelId === selectedHotel);
    return filtered.length > 0 ? filtered : allRooms;
  }, [selectedHotel, allRooms]);

  // Calculate Price Effect
  useEffect(() => {
    if (selectedRoom && checkIn && checkOut) {
      const room = availableRooms.find(r => r.id === selectedRoom);
      if (room) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        
        if (end > start) {
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          const baseTotal = diffDays * room.price;
          
          // --- CAMPAIGN LOGIC (SIMULATED) ---
          const discountRate = 0.15; 
          const discountAmount = baseTotal * discountRate;
          
          setDiscount(discountAmount);
          setTotalPrice(baseTotal - discountAmount);
        } else {
          setTotalPrice(null);
          setDiscount(0);
        }
      }
    } else {
      setTotalPrice(null);
      setDiscount(0);
    }
  }, [selectedRoom, checkIn, checkOut, availableRooms]);

  // Reset selected room when hotel changes
  useEffect(() => {
    setSelectedRoom("");
  }, [selectedHotel]);

  // Ensure check-out is after check-in when check-in changes
  useEffect(() => {
    if (checkIn && checkOut) {
      if (checkIn >= checkOut) {
        setCheckOut(""); 
      }
    }
  }, [checkIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = {
      hotel_id: selectedHotel,
      room_id: selectedRoom,
      customer_name: guestName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: guests,
      total_price: totalPrice || 0,
    };

    try {
      bookingSchema.parse(formData);

      const result = await createBooking({
        hotel_id: parseInt(selectedHotel), 
        room_id: parseInt(selectedRoom),
        guest_name: guestName,
        email: customerEmail,
        phone: customerPhone,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guests,
        total_price: totalPrice || 0,
        room_status: 'pending'
      });

      if (!result.success) {
        const msg = result.error || t('errorGeneric');
        setError(msg);
        return;
      }

      setIsSubmitted(true);
        } catch (err: any) {
          if (err instanceof z.ZodError) {
            const firstError = err.issues[0];
            toast.error(firstError.message);
          } else {
            toast.error("Beklenmedik bir hata oluştu.");
          }
        } finally {      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-green-800">{t('successTitle')}</h3>
        <p className="text-green-700">
          {t('successMessage')}
        </p>
        <button 
          onClick={() => { setIsSubmitted(false); setGuestName(""); setCustomerEmail(""); setCustomerPhone(""); setCheckIn(""); setCheckOut(""); setSelectedRoom(""); setTotalPrice(null); }}
          className="text-green-700 font-medium hover:underline mt-4 block mx-auto"
        >
          {t('newBooking')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--off-black)] mb-6 flex items-center gap-2">
          <HotelIcon className="w-5 h-5 text-[var(--gold)]" />
          {t('detailsTitle')}
        </h3>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Guest Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('nameLabel')}</label>
                <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                placeholder={t('namePlaceholder')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('emailLabel')}</label>
                <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                placeholder={t('emailPlaceholder')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
                />
            </div>
        </div>
        
        {/* NEW: Phone Number Field */}
        <div className="space-y-2">
             <label className="text-sm font-medium text-gray-700">Telefon Numarası</label>
             <input
               type="tel"
               value={customerPhone}
               onChange={(e) => setCustomerPhone(e.target.value)}
               placeholder="+90 555 123 45 67"
               className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
             />
        </div>

        {/* Hotel Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('hotelLabel')}</label>
          <div className="relative">
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              required
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all appearance-none text-gray-700"
            >
              <option value="" disabled>{t('hotelSelectPlaceholder')}</option>
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

        {/* Room Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('roomLabel')}</label>
          <div className="relative">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              required
              disabled={!selectedHotel}
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all appearance-none text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="" disabled>
                {!selectedHotel ? t('selectHotelFirst') : t('roomSelectPlaceholder')}
              </option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (€{room.price}) - {room.capacity}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <BedDouble className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          {selectedHotel && availableRooms.length === 0 && (
             <p className="text-xs text-red-500 mt-1">{t('noRoomsDefined')}</p>
          )}
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('checkIn')}</label>
            <div className="relative">
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('checkOut')}</label>
            <div className="relative">
              <input
                type="date"
                min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : today}
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
          <label className="text-sm font-medium text-gray-700">{t('guests')}</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="10"
              value={guests || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setGuests(isNaN(val) ? 0 : val);
              }}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
            />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* PRICE SUMMARY CARD */}
        {totalPrice !== null && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fadeIn">
                <h4 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2">Ödeme Özeti</h4>
                
                {discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                        <span>Oda Fiyatı (İndirimsiz):</span>
                        <span className="line-through">€{(totalPrice + discount).toLocaleString('en-US')}</span>
                    </div>
                )}
                
                {discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600 mb-1">
                        <span>Sezon Sonu İndirimi (%15):</span>
                        <span>-€{discount.toLocaleString('en-US')}</span>
                    </div>
                )}

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900 text-lg">Toplam Tutar:</span>
                    <span className="font-bold text-[var(--gold)] text-2xl">€{totalPrice.toLocaleString('en-US')}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">Vergiler dahildir.</p>
            </div>
        )}

      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[var(--gold)] text-white font-bold py-4 rounded-lg hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('processing')}
          </>
        ) : (
          t('submitButton')
        )}
      </button>
    </form>
  );
}
