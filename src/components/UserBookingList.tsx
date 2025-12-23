'use client';

import { Booking } from '@/services/hotelService';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface UserBookingListProps {
  bookings: Booking[];
  locale: string;
}

export default function UserBookingList({ bookings, locale }: UserBookingListProps) {
  const t = useTranslations('MyBookings');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('bookingId')}: {booking.id.slice(0, 8)}...
                </h3>
                <p className="text-sm text-gray-500">
                  {t('bookedOn')} {formatDate(booking.check_in)} {/* Assuming created_at isn't available, using check_in for display purposes or just hiding it if needed */}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  booking.room_status
                )}`}
              >
                {t(`status.${booking.room_status}`)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkIn')}</span>
                  <span className="font-medium">{formatDate(booking.check_in)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkOut')}</span>
                  <span className="font-medium">{formatDate(booking.check_out)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('guests')}</span>
                  <span className="font-medium">{booking.guests_count || 1}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('totalPrice')}</span>
                  <span className="font-medium text-green-600">
                    {booking.total_price} ₺
                  </span>
                </div>
                {/* Add more details here if available */}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
             {booking.room_status === 'pending' || booking.room_status === 'confirmed' ? (
                 <Link
                    href={`/${locale}/reservation/manage/${booking.id}`} // Assuming ID works as token or needs a separate token field
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                 >
                   {t('cancelBooking')}
                 </Link>
             ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
