import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'tr', 'ar', 'hu', 'ro'],
 
  // Used when no locale matches
  defaultLocale: 'tr'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(tr|en|ar|hu|ro)/:path*']
};
