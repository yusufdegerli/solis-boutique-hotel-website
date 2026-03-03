import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['tr', 'en', 'ru', 'ar', 'hu'],
  defaultLocale: 'tr'
});

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Redirect root to /tr
  if (path === '/') {
    return NextResponse.redirect(new URL('/tr', request.url));
  }

  // Redirect /admin and /login without locale prefix to /tr/...
  if (path === '/login') {
    const url = new URL(`/tr${path}`, request.url);
    return NextResponse.redirect(url);
  }

  // =====================================================================
  // ADMIN PANELİ GEÇİCİ OLARAK ASKIYA ALINDI
  // Tekrar aktif etmek için bu bloğu silin veya yorum satırına alın.
  // =====================================================================
  if (path === '/admin' || path.startsWith('/admin/') ||
    /^\/[a-z]{2}\/admin(\/|$)/.test(path)) {
    return new NextResponse(null, { status: 404 });
  }
  // =====================================================================

  // Run next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};