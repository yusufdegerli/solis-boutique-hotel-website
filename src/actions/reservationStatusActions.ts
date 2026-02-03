"use server";

import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side queries
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, serviceKey || anonKey);

export async function searchReservationsByEmail(email: string) {
    try {
        // Validate input
        if (!email) {
            return { success: false, error: "Missing email" };
        }

        console.log('--- RESERVATION STATUS SEARCH ---');
        console.log('Searching for email:', email);

        // Get today's date for filtering past reservations
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        console.log('Today date:', todayStr);

        // Search for all reservations matching email with check_out >= today
        const { data, error } = await supabase
            .from('Reservation_Information')
            .select('*')
            .eq('customer_email', email)
            .gte('check_out', todayStr)
            .order('check_in', { ascending: true });

        console.log('Query result - data:', data?.length || 0, 'items');
        console.log('Query result - error:', error);

        if (error) {
            console.error('Reservation search error:', error);
            return { success: false, error: "Search failed: " + error.message };
        }

        if (!data || data.length === 0) {
            console.log('No reservations found for this email');
            return { success: false, error: "No reservations found" };
        }

        console.log('Found', data.length, 'reservations');
        return { success: true, data };
    } catch (err: any) {
        console.error('Search reservation error:', err);
        return { success: false, error: err.message };
    }
}
