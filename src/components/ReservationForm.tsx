"use client";

import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import {
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hotel as HotelIcon,
  BedDouble
} from 'lucide-react';
import { Hotel, Room } from "@/lib/data";
import { createBooking } from "@/services/hotelService";
import { useTranslations } from "next-intl";
import { bookingSchema } from "@/lib/validations/booking";
import toast from 'react-hot-toast';

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
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestNames, setGuestNames] = useState<string[]>(['']); // Array of guest names
  const [guestName, setGuestName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+90"); // Default Turkey
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [customerCity, setCustomerCity] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState(""); // Hidden spam protection field

  // Popular country codes
  const countryCodes = [
    { code: "+90", country: "TR", flag: "🇹🇷" },
    { code: "+1", country: "US", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+49", country: "DE", flag: "🇩🇪" },
    { code: "+33", country: "FR", flag: "🇫🇷" },
    { code: "+7", country: "RU", flag: "🇷🇺" },
    { code: "+971", country: "AE", flag: "🇦🇪" },
    { code: "+966", country: "SA", flag: "🇸🇦" },
    { code: "+40", country: "RO", flag: "🇷🇴" },
    { code: "+36", country: "HU", flag: "🇭🇺" },
    { code: "+39", country: "IT", flag: "🇮🇹" },
    { code: "+34", country: "ES", flag: "🇪🇸" },
    { code: "+31", country: "NL", flag: "🇳🇱" },
    { code: "+32", country: "BE", flag: "🇧🇪" },
    { code: "+48", country: "PL", flag: "🇵🇱" },
    { code: "+30", country: "GR", flag: "🇬🇷" },
  ];

  // Format phone number (only digits)
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // Format as: XXX XXX XX XX (for Turkish format)
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
    if (digitsOnly.length <= 8) return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 8)} ${digitsOnly.slice(8, 10)}`;
  };

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setCustomerPhone(formatted);

    // Clear error when typing
    if (phoneError) setPhoneError(null);
  };

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

  // Get selected room's capacity
  const selectedRoomData = useMemo(() => {
    if (!selectedRoom) return null;
    return availableRooms.find(r => r.id === selectedRoom);
  }, [selectedRoom, availableRooms]);

  const roomCapacity = useMemo(() => {
    if (!selectedRoomData?.capacity) return 10; // Default max
    // Parse capacity string like "2 Yetişkin" or "4"
    const match = selectedRoomData.capacity.match(/\d+/);
    return match ? parseInt(match[0]) : 10;
  }, [selectedRoomData]);

  // Validate total guests against room capacity
  const totalGuests = adults + children;
  const isOverCapacity = totalGuests > roomCapacity;

  // Sync guestNames array with total guests count
  useEffect(() => {
    setGuestNames(prev => {
      const newArr = [...prev];
      while (newArr.length < totalGuests) newArr.push('');
      return newArr.slice(0, totalGuests);
    });
  }, [totalGuests]);

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
      customer_city: customerCity,
      customer_address: customerAddress,
      notes: customerNotes,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: totalGuests,
      num_adults: adults,
      num_children: children,
      total_price: totalPrice || 0,
    };

    try {
      bookingSchema.parse(formData);

      const result = await createBooking({
        hotel_id: parseInt(selectedHotel),
        room_id: parseInt(selectedRoom),
        guest_name: guestName,
        email: customerEmail,
        phone: customerPhone ? `${phoneCountryCode} ${customerPhone}` : '', // Include country code
        customer_city: customerCity,
        customer_address: customerAddress,
        notes: customerNotes,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: totalGuests,
        num_adults: adults,
        num_children: children,
        guest_names: guestNames.filter(n => n.trim() !== ''), // Filter empty names
        total_price: totalPrice || 0,
        room_status: 'pending',
        _honeypot: honeypot, // Spam protection
      });

      if (!result.success) {
        const msg = (result as any).error || t('errorGeneric');
        setError(msg);
        return;
      }

      // Harici rezervasyon sistemine yönlendir
      if ((result as any).redirect) {
        window.location.href = (result as any).redirect;
        return;
      }

      // Save the booking ID to display to user
      // Server returns data as array: [{ id: bookingId }]
      const dataArray = (result as any).data;
      const returnedId = Array.isArray(dataArray) ? dataArray[0]?.id : dataArray?.id;
      if (returnedId) {
        setBookingId(returnedId);
      }
      setIsSubmitted(true);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const firstError = err.issues[0];
        toast.error(firstError.message);
      } else {
        toast.error("Beklenmedik bir hata oluştu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-yellow-50 p-8 rounded-xl border border-yellow-200 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-[var(--gold)]">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{t('successTitle')}</h3>
        <p className="text-gray-700 text-lg">
          {t('successMessage')}
        </p>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm inline-block w-full max-w-md mt-6">
          <p className="text-sm text-gray-500 mb-4">{t('contactUs')}</p>
          <div className="space-y-4">
            <a
              href="tel:+905337932472"
              className="flex items-center justify-center gap-3 w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-200"
            >
              <svg className="w-5 h-5 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              {t('phone')}: +90 533 793 24 72
            </a>
            <a
              href="https://wa.me/905337932472?text=Merhaba,%20rezervasyonum%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              WhatsApp
            </a>
          </div>
        </div>

        <button
          onClick={() => { setIsSubmitted(false); setBookingId(null); setGuestName(""); setCustomerEmail(""); setCustomerPhone(""); setCustomerCity(""); setCustomerAddress(""); setCustomerNotes(""); setCheckIn(""); setCheckOut(""); setSelectedRoom(""); setTotalPrice(null); setAdults(1); setChildren(0); }}
          className="text-gray-500 font-medium hover:text-[var(--gold)] mt-8 block mx-auto transition-colors"
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

        {/* Honeypot field - hidden from real users, filled by bots */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{
            position: 'absolute',
            left: '-9999px',
            opacity: 0,
            height: 0,
            width: 0,
            pointerEvents: 'none'
          }}
          aria-hidden="true"
        />

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

        {/* Phone Number Field with Country Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Telefon Numarası</label>
          <div className="flex gap-2">
            {/* Country Code Selector */}
            <select
              value={phoneCountryCode}
              onChange={(e) => setPhoneCountryCode(e.target.value)}
              className="w-28 px-2 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            {/* Phone Number Input */}
            <input
              type="tel"
              value={customerPhone}
              onChange={handlePhoneChange}
              onBlur={() => {
                if (customerPhone && !validatePhone(customerPhone)) {
                  setPhoneError('Geçerli bir telefon numarası girin (en az 10 rakam)');
                }
              }}
              placeholder="555 123 45 67"
              maxLength={15}
              className={`flex-1 px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700 ${phoneError ? 'border-red-400' : 'border-gray-200'
                }`}
            />
          </div>
          {phoneError && (
            <p className="text-sm text-red-500">{phoneError}</p>
          )}
          <p className="text-xs text-gray-400">Örnek: {phoneCountryCode} 555 123 45 67</p>
        </div>

        {/* NEW: City & Address & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Şehir</label>
            <input
              type="text"
              value={customerCity}
              onChange={(e) => setCustomerCity(e.target.value)}
              placeholder="İstanbul"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Adres</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Tam adresiniz..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Notlar (Opsiyonel)</label>
          <textarea
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Varsa özel istekleriniz..."
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700 resize-none"
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

        {/* Adults & Children */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Yetişkin Sayısı</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={roomCapacity}
                value={adults || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setAdults(isNaN(val) ? 1 : Math.max(1, val));
                }}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
              />
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Çocuk Sayısı</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={Math.max(0, roomCapacity - adults)}
                value={children}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setChildren(isNaN(val) ? 0 : Math.max(0, val));
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
              />
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Capacity Warning */}
        {isOverCapacity && selectedRoom && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Oda kapasitesi {roomCapacity} kişidir. Lütfen misafir sayısını azaltın.</span>
          </div>
        )}

        {/* Room Capacity Info */}
        {selectedRoom && !isOverCapacity && (
          <div className="text-xs text-gray-500">
            Seçilen oda kapasitesi: {roomCapacity} kişi (Toplam: {totalGuests} kişi)
          </div>
        )}

        {/* Guest Names (when more than 1 guest) */}
        {totalGuests > 1 && (
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="text-sm font-medium text-gray-700 block">Misafir İsimleri</label>
            <p className="text-xs text-gray-500 -mt-2 mb-2">Odada kalacak diğer misafirlerin ad ve soyadlarını girin</p>
            {guestNames.slice(1).map((name, index) => (
              <div key={index + 1} className="space-y-1">
                <label className="text-xs text-gray-500">{index + 2}. Misafir</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...guestNames];
                    newNames[index + 1] = e.target.value;
                    setGuestNames(newNames);
                  }}
                  placeholder={`Misafir ${index + 2} Ad Soyad`}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700 text-sm"
                />
              </div>
            ))}
          </div>
        )}

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
        disabled={isLoading || isOverCapacity}
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
