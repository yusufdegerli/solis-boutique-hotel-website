'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service key to bypass RLS for aggregating stats
const supabase = createClient(supabaseUrl, serviceKey!);

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeBookings: number; // pending + confirmed + checked_in
  occupancyRate: number; // Mock or calculated if total rooms known
  monthlyRevenue: { name: string; revenue: number }[];
  statusDistribution: { name: string; value: number }[];
}

export async function getDashboardStats(hotelId?: string | number): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
  try {
    if (!serviceKey) return { success: false, error: "Server configuration error" };

    // 1. Fetch Reservations
    let query = supabase
      .from('Reservation_Information')
      .select('total_price, room_status, check_in, hotel_id');
    
    if (hotelId && hotelId !== 'all') {
        // Explicitly cast to number to match bigint/integer column type
        const id = Number(hotelId);
        if (!isNaN(id)) {
            query = query.eq('hotel_id', id);
        }
    }

    const { data: bookings, error } = await query;

    if (error) throw error;
    if (!bookings) return { success: true, data: getDefaultStats() };

    // 2. Calculate KPI
    const validStatuses = ['confirmed', 'checked_in', 'checked_out', 'completed'];
    
    const totalRevenue = bookings
      .filter(b => validStatuses.includes(b.room_status) && b.total_price)
      .reduce((sum, b) => sum + Number(b.total_price), 0);

    const totalBookings = bookings.length;
    
    const activeBookings = bookings.filter(b => 
      ['pending', 'confirmed', 'checked_in'].includes(b.room_status)
    ).length;

    // 3. Prepare Monthly Revenue Data (Last 6 Months)
    const monthlyData = new Map<string, number>();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${months[d.getMonth()]} ${d.getFullYear()}`; // e.g. "Kasım 2024"
        monthlyData.set(key, 0);
    }

    bookings.forEach(b => {
        if (validStatuses.includes(b.room_status) && b.total_price) {
            const date = new Date(b.check_in); // Use check-in date for revenue recognition
            const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
            if (monthlyData.has(key)) {
                monthlyData.set(key, monthlyData.get(key)! + Number(b.total_price));
            }
        }
    });

    const monthlyRevenue = Array.from(monthlyData.entries()).map(([name, revenue]) => ({ name, revenue }));

    // 4. Status Distribution for Pie Chart
    const statusCounts = bookings.reduce((acc, curr) => {
        const status = curr.room_status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    // Mock Occupancy (Need total room count to be accurate)
    // Let's assume 50 rooms * 30 days = 1500 nights capacity per month
    const occupancyRate = Math.min(Math.round((activeBookings / 50) * 100), 100); 

    return {
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        activeBookings,
        occupancyRate,
        monthlyRevenue,
        statusDistribution
      }
    };

  } catch (err: any) {
    console.error('Stats Error:', err);
    return { success: false, error: err.message };
  }
}

function getDefaultStats(): DashboardStats {
    return {
        totalRevenue: 0,
        totalBookings: 0,
        activeBookings: 0,
        occupancyRate: 0,
        monthlyRevenue: [],
        statusDistribution: []
    };
}
