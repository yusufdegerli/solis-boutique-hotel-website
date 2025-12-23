import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { sessionId, sender, message } = await request.json();

    if (!sessionId || !sender || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use Service Role Key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Insert Message
    const { data: msgData, error: msgError } = await supabaseAdmin
        .from('Chat_Messages')
        .insert({ session_id: sessionId, sender, message })
        .select()
        .single();

    if (msgError) {
        console.error('Error inserting message:', msgError);
        return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // 2. Update Session Timestamp
    const { error: sessionError } = await supabaseAdmin
        .from('Chat_Sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', sessionId);

    if (sessionError) {
        console.error('Error updating session timestamp:', sessionError);
        // We don't fail the request if just the timestamp fails, but it's bad.
    }

    return NextResponse.json({ data: msgData });
  } catch (err) {
    console.error('Handler error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
