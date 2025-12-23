import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { sessionId, name } = await request.json();

    if (!sessionId || !name) {
      return NextResponse.json({ error: 'Missing sessionId or name' }, { status: 400 });
    }

    // Use Service Role Key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabaseAdmin
      .from('Chat_Sessions')
      .update({ customer_name: name })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session name:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Handler error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
