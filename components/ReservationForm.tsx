"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, Users, Hotel as HotelIcon, Loader2, BedDouble } from "lucide-react";
import { Hotel, Room } from "@/lib/data";
import { createBooking } from "@/src/services/hotelService";
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter rooms based on selected hotel
  const availableRooms = useMemo(() => {
    if (!selectedHotel) return [];
    const filtered = allRooms.filter(room => room.hotelId === selectedHotel);
    // Fallback: If no rooms found for specific hotel, show ALL rooms (for demo/empty DB cases)
    return filtered.length > 0 ? filtered : allRooms;
  }, [selectedHotel, allRooms]);

  // Reset selected room when hotel changes
  useEffect(() => {
    setSelectedRoom("");
  }, [selectedHotel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Prepare data for validation
    const formData = {
      hotel_id: selectedHotel,
      room_id: selectedRoom,
      customer_name: guestName,
      customer_email: customerEmail,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: guests,
    };

    try {
      // 1. Zod Validation
      bookingSchema.parse(formData);

      // 2. Submit if valid
      await createBooking({
        hotel_id: parseInt(selectedHotel), 
        room_id: parseInt(selectedRoom),
        guest_name: guestName,
        email: customerEmail,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guests,
        status: 'pending'
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Reservation Error:', err);
      
      // Handle Zod Validation Errors
      if (err instanceof ZodError) {
        // Get the first error message and translate it
        const firstError = err.errors[0];
        // We stored the translation key in the 'message' field of the schema
        setError(t(firstError.message as any)); 
        return;
      }

      let errorMessage = t('errorGeneric');
      
      if (err?.message) {
        // If it's a known server error string (which we might translate later), or just show raw if dev
        errorMessage += ` (${err.message})`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
          onClick={() => { setIsSubmitted(false); setGuestName(""); setCustomerEmail(""); setCheckIn(""); setCheckOut(""); setSelectedRoom(""); }}
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
                  {room.name} ({room.price}₺) - {room.capacity}
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
