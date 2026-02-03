"use server";

import { supabase } from "@/lib/supabaseClient";

export async function searchReservationsByEmail(email: string) {
    try {
        // Validate input
        if (!email) {
            return { success: false, error: "Missing email" };
        }

        // Get today's date for filtering past reservations
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // Search for all reservations matching email with check_out >= today
        const { data, error } = await supabase
            .from('Reservation_Information')
            .select('*')
            .eq('customer_email', email)
            .gte('check_out', todayStr)
            .order('check_in', { ascending: true });

        if (error) {
            console.log('Reservation search error:', error);
            return { success: false, error: "Search failed" };
        }

        if (!data || data.length === 0) {
            return { success: false, error: "No reservations found" };
        }

        return { success: true, data };
    } catch (err: any) {
        console.error('Search reservation error:', err);
        return { success: false, error: err.message };
    }
}
