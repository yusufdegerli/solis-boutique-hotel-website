'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Booking {
  id: number;
  customer_name: string;
  check_in: string;
  check_out: string;
  total_price: number;
  room_status: string;
  cancellation_token: string;
  rooms?: { type_name: string; image_url: string };
  hotels?: { name: string };
}

export default function CancellationForm({ booking, locale }: { booking: Booking; locale: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const dateLocale = locale === 'tr' ? tr : enUS;

  const handleCancel = async () => {
    if (!confirm('Rezervasyonunuzu iptal etmek istediğinize emin misiniz?')) return;

    setLoading(true);
    setError('');

    try {
      // We will create a server action for this to ensure security
      // For now, let's assume we use a direct API route or server action
      const response = await fetch(`/api/cancel-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: booking.cancellation_token })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'İptal işlemi başarısız oldu.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">İptal Edildi</h2>
        <p className="text-gray-600 mb-6">Rezervasyonunuz başarıyla iptal edilmiştir.</p>
        <button onClick={() => router.push(`/${locale}`)} className="text-[var(--gold)] hover:underline">
          Anasayfaya Dön
        </button>
      </div>
    );
  }

  const isCancelled = booking.room_status === 'cancelled';
  const isCompleted = booking.room_status === 'completed' || booking.room_status === 'checked_out';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-[var(--gold)]/10">
        <h1 className="text-xl font-serif font-bold text-gray-900">Rezervasyon Yönetimi</h1>
        <p className="text-sm text-gray-600">Referans No: #{booking.id}</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Hotel Info */}
        <div className="flex gap-4">
           {booking.rooms?.image_url && (
             <img src={booking.rooms.image_url} alt="Room" className="w-24 h-24 object-cover rounded-md" />
           )}
           <div>
             <h3 className="font-bold text-lg">{booking.hotels?.name}</h3>
             <p className="text-gray-600">{booking.rooms?.type_name}</p>
             <p className="text-sm text-gray-500 mt-1">
               {format(new Date(booking.check_in), 'dd MMM yyyy', { locale: dateLocale })} - {format(new Date(booking.check_out), 'dd MMM yyyy', { locale: dateLocale })}
             </p>
           </div>
        </div>

        {/* Status Badge */}
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${isCancelled ? 'bg-red-100 text-red-800' : 
              isCompleted ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
            Durum: {isCancelled ? 'İptal Edildi' : isCompleted ? 'Tamamlandı' : 'Aktif'}
          </span>
        </div>

        {/* Action Button */}
        {!isCancelled && !isCompleted && (
          <div className="pt-6 border-t border-gray-100">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}
            
            <p className="text-sm text-gray-500 mb-4">
              Planlarınız değişti mi? Aşağıdaki butonu kullanarak rezervasyonunuzu iptal edebilirsiniz.
            </p>
            
            <button 
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-md hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'İşleniyor...' : 'Rezervasyonu İptal Et'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
