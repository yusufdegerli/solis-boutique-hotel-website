import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (next) {
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  // Default redirect to update password page if no next param
  // Note: We need to handle locale dynamically or default to a known one.
  // Since we don't have locale here easily without parsing URL, we redirect to root
  // Middleware should handle the locale redirect if needed, but let's try to be safe.
  return NextResponse.redirect(`${requestUrl.origin}/admin`) 
}
