'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const locale = await getLocale();
  redirect(`/${locale}/admin`)
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  redirect(`/${locale}/login`);
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const locale = await getLocale();
  
  // 1. Check if user exists (Requires Service Role Key)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    return { error: 'Sistem hatası: Konfigürasyon eksik.' };
  }

  const adminSupabase = createAdminClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // 1. Check if user exists efficiently
  // We try to generate a link. If it fails, the user likely doesn't exist.
  // This avoids fetching the entire user database (O(1) vs O(N)).
  const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  });
  
  if (linkError || !linkData.user) {
    // Security Note: In a strict security environment, you normally shouldn't 
    // reveal if an email is registered. But we keep your logic here.
    return { error: 'Bu mail adresi kayıtlı değil.' };
  }

  // 2. Send Reset Email
  const supabase = await createClient(); // Use regular client for the reset request
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUrl = `${origin}/auth/callback?next=/${locale}/update-password`;
  
  console.log('Attempting to send reset email to:', email);
  console.log('Redirect URL:', redirectUrl);

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error('Reset Password Error (Supabase):', JSON.stringify(error, null, 2));
    return { error: error.message };
  }

  console.log('Reset email sent successfully. Data:', data);
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  const locale = await getLocale();
  redirect(`/${locale}/admin`);
}
