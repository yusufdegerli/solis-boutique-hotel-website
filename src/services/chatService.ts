import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, anonKey);

export interface ChatMessage {
    id: number;
    session_id: string;
    sender: 'user' | 'admin';
    message: string;
    created_at: string;
}

export interface ChatSession {
    id: string;
    customer_name: string;
    status: 'active' | 'closed';
    last_message_at: string;
    unread_count?: number; // Virtual field
}

// User: Create a new session
export async function startChatSession(name?: string) {
    const { data, error } = await supabase
        .from('Chat_Sessions')
        .insert({ customer_name: name || 'Ziyaretçi' })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// Shared: Send a message
export async function sendMessage(sessionId: string, sender: 'user' | 'admin', message: string) {
    const { data, error } = await supabase
        .from('Chat_Messages')
        .insert({ session_id: sessionId, sender, message })
        .select()
        .single();

    if (error) throw error;

    // Update last_message_at
    await supabase
        .from('Chat_Sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', sessionId);

    return data;
}

// Shared: Get messages for a session
export async function getMessages(sessionId: string) {
    const { data, error } = await supabase
        .from('Chat_Messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as ChatMessage[];
}

// Shared: Update customer name (for first message flow)
export async function updateCustomerName(sessionId: string, name: string) {
    const { error } = await supabase
        .from('Chat_Sessions')
        .update({ customer_name: name })
        .eq('id', sessionId);
    
    if (error) throw error;
}

// Admin: Get all active sessions (Last 24 hours only)
export async function getActiveSessions() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('Chat_Sessions')
        .select('*')
        .eq('status', 'active')
        .gt('last_message_at', twentyFourHoursAgo) // Only recent chats
        .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data as ChatSession[];
}

// Admin: Close session
export async function closeSession(sessionId: string) {
    const { error } = await supabase
        .from('Chat_Sessions')
        .update({ status: 'closed' })
        .eq('id', sessionId);
    
    if (error) throw error;
}
