import { NextResponse, type NextRequest } from 'next/server'

/**
 * STUB - Supabase session checking is disabled for static/contact-first operation.
 * Returns a no-op response with null user so the middleware can still run its route protection logic.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })
  return { response, user: null, supabase: null }
}
