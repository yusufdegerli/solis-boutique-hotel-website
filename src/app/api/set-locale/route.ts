import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['tr', 'en', 'ru', 'ar', 'hu'];

export async function POST(request: NextRequest) {
    const { locale } = await request.json();

    if (!SUPPORTED_LOCALES.includes(locale)) {
        return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('NEXT_LOCALE', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
    });

    return response;
}
