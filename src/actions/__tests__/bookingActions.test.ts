import { describe, it, expect, vi } from 'vitest';
import { createBookingServer } from '@/actions/bookingActions';

// Mocking Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    rpc: vi.fn(),
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }))
}));

describe('Booking Actions - createBookingServer', () => {
  it('geçersiz tarihlerde hata döndürmelidir (çıkış < giriş)', async () => {
    const invalidData = {
      hotel_id: 1,
      room_id: 1,
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      check_in: '2025-12-25',
      check_out: '2025-12-24', // Geçersiz: Girişten önce
      guests_count: 2
    };

    const result = await createBookingServer(invalidData);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Çıkış tarihi giriş tarihinden sonra olmalıdır');
  });

  it('geçmiş bir tarihe rezervasyon yapılmasını engellemelidir', async () => {
    const pastDateData = {
      hotel_id: 1,
      room_id: 1,
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      check_in: '2020-01-01', // Geçmiş tarih
      check_out: '2020-01-05',
      guests_count: 1
    };

    const result = await createBookingServer(pastDateData);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Giriş tarihi bugünden eski olamaz');
  });
});
