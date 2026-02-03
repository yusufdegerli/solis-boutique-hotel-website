"use server";

import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side queries
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, serviceKey || anonKey);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is a transient/network error that can be retried
 */
const isTransientError = (error: any): boolean => {
    const errorMsg = error?.message?.toLowerCase() || '';
    return (
        errorMsg.includes('could not find host') ||
        errorMsg.includes('fetch failed') ||
        errorMsg.includes('network') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('econnreset') ||
        errorMsg.includes('enotfound') ||
        errorMsg.includes('socket hang up')
    );
};

export async function searchReservationsByEmail(email: string) {
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Validate input
            if (!email) {
                return { success: false, error: "E-posta adresi gereklidir." };
            }

            console.log(`--- RESERVATION STATUS SEARCH (Attempt ${attempt}/${MAX_RETRIES}) ---`);
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
                // Check if it's a transient error that should be retried
                if (isTransientError(error) && attempt < MAX_RETRIES) {
                    console.log(`Transient error detected, retrying in ${RETRY_DELAY_MS}ms...`);
                    lastError = error;
                    await sleep(RETRY_DELAY_MS * attempt); // Exponential backoff
                    continue;
                }

                console.error('Reservation search error:', error);
                return {
                    success: false,
                    error: "Arama sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin."
                };
            }

            if (!data || data.length === 0) {
                console.log('No reservations found for this email');
                return { success: false, error: "Bu e-posta adresiyle eşleşen rezervasyon bulunamadı." };
            }

            console.log('Found', data.length, 'reservations');
            return { success: true, data };

        } catch (err: any) {
            console.error(`Search reservation error (attempt ${attempt}):`, err);

            // Check if it's a transient error that should be retried
            if (isTransientError(err) && attempt < MAX_RETRIES) {
                console.log(`Transient error detected, retrying in ${RETRY_DELAY_MS}ms...`);
                lastError = err;
                await sleep(RETRY_DELAY_MS * attempt); // Exponential backoff
                continue;
            }

            return {
                success: false,
                error: "Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin."
            };
        }
    }

    // All retries exhausted
    console.error('All retry attempts exhausted:', lastError);
    return {
        success: false,
        error: "Sunucuya bağlanılamadı. Lütfen birkaç dakika sonra tekrar deneyin."
    };
}
