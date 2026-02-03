"use server";

import { supabase } from "@/lib/supabaseClient";

export async function searchReservation(email: string, reservationId: string) {
    try {
        // Validate inputs
        if (!email || !reservationId) {
            return { success: false, error: "Missing email or reservation ID" };
        }

        // Search for reservation matching both email and ID
        const { data, error } = await supabase
            .from('Reservation_Information')
            .select('*')
            .eq('id', reservationId)
            .eq('customer_email', email)
            .single();

        if (error || !data) {
            console.log('Reservation not found:', error);
            return { success: false, error: "Reservation not found" };
        }

        // Check if reservation is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkOut = new Date(data.check_out);

        if (checkOut < today) {
            return { success: false, error: "Reservation has already passed" };
        }

        return { success: true, data };
    } catch (err: any) {
        console.error('Search reservation error:', err);
        return { success: false, error: err.message };
    }
}
