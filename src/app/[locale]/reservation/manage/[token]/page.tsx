import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CancellationForm from './CancellationForm';
import { getTranslations } from 'next-intl/server';

export default async function CancellationPage({
  params
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { locale, token } = await params;
  const supabase = await createClient();
  const t = await getTranslations('MyBookings'); // Reuse existing translations or add new ones

  // 1. Validate Token & Fetch Booking
  const { data: booking, error } = await supabase
    .from('Reservation_Information')
    .select(`
      *,
      rooms:Rooms_Information(type_name, image_url),
      hotels:Hotel_Information_Table(name)
    `)
    .eq('cancellation_token', token)
    .single();

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Geçersiz Bağlantı</h1>
          <p className="text-gray-600">Rezervasyon bulunamadı veya bağlantının süresi dolmuş.</p>
        </div>
      </div>
    );
  }

  // 2. Render Page
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <CancellationForm booking={booking} locale={locale} />
      </div>
    </div>
  );
}
