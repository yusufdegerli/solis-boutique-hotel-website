import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserBookings } from '@/services/hotelService';
import { getTranslations } from 'next-intl/server';
import UserBookingList from '@/components/UserBookingList';

export default async function MyBookingsPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('MyBookings');
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const bookings = await getUserBookings(user.email || '');

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-600">{user.email}</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">{t('noBookings')}</p>
          </div>
        ) : (
          <UserBookingList bookings={bookings} locale={locale} />
        )}
      </div>
    </div>
  );
}
