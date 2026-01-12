import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log('Webhook received:', payload);

    // TODO: Process webhook payload (e.g., payment verification, etc.)

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is active. Use POST to send data.' });
}
