import { supabase } from '@/lib/supabaseClient';

export interface ChatMessage {
    id: number;
    session_id: string;
    sender: 'user' | 'admin';
    message: string;
    created_at: string;
    is_read: boolean;
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
    const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, sender, message })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to send message');
    }

    const { data } = await response.json();
    return data;
}

// Admin: Mark messages as read
export async function markMessagesAsRead(sessionId: string) {
    const { error } = await supabase
        .from('Chat_Messages')
        .update({ is_read: true })
        .eq('session_id', sessionId)
        .eq('sender', 'user') // Only mark user messages as read
        .eq('is_read', false);

    if (error) console.error('Error marking messages as read:', error);
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
    // Use API route to bypass RLS for updating name
    const response = await fetch('/api/chat/update-name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, name }),
    });

    if (!response.ok) {
        throw new Error('Failed to update customer name');
    }
}

// Admin: Get all active sessions (Last 24 hours only)
export async function getActiveSessions() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions, error } = await supabase
        .from('Chat_Sessions')
        .select('*')
        .eq('status', 'active')
        .gt('last_message_at', twentyFourHoursAgo) // Only recent chats
        .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Fetch unread counts for each session
    // Note: This could be optimized with a stored procedure or view, but for small scale this is fine.
    const sessionsWithUnread = await Promise.all(sessions.map(async (s) => {
        const { count } = await supabase
            .from('Chat_Messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', s.id)
            .eq('sender', 'user')
            .eq('is_read', false);
        
        return { ...s, unread_count: count || 0 };
    }));

    return sessionsWithUnread as ChatSession[];
}

// Admin: Close session
export async function closeSession(sessionId: string) {
    const response = await fetch('/api/chat/close', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
        throw new Error('Failed to close session');
    }
}
