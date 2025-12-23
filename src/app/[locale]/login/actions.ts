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
  const supabase = await createClient();
  
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUrl = `${origin}/auth/callback?next=/${locale}/update-password`;
  
  console.log('Attempting to send reset email to:', email);

  // We do not check if the user exists explicitly to prevent user enumeration.
  // Supabase's resetPasswordForEmail handles the flow.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    // Log the actual error for debugging securely
    console.error('Reset Password Error (Supabase):', error.message);
    
    // If it's a strict rate limit, we might want to tell the user to wait.
    if (error.status === 429) {
      return { error: 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.' };
    }
  }

  // Always return success to the UI to prevent email enumeration
  return { success: true, message: 'Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilmiştir.' };
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
