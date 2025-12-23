'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ChatMessage, ChatSession, getActiveSessions, getMessages, sendMessage, closeSession, markMessagesAsRead } from '@/src/services/chatService';
import { Send, User, Clock, CheckCircle, XCircle, Search, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPanel({ onMessagesRead }: { onMessagesRead?: () => void }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Active Sessions
  useEffect(() => {
    fetchSessions();

    // Realtime listener for new sessions or updates
    const sessionChannel = supabase
        .channel('admin-chat-list')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Chat_Sessions' }, (payload) => {
            if (payload.eventType === 'UPDATE') {
                const updatedSession = payload.new as ChatSession;
                
                if (updatedSession.status === 'closed') {
                    // If closed, remove from list
                    setSessions(prev => prev.filter(s => s.id !== updatedSession.id));
                    if (selectedSession === updatedSession.id) setSelectedSession(null);
                } else {
                    // If active update (e.g. name change), update in place
                    setSessions(prev => prev.map(s => s.id === updatedSession.id ? { ...s, ...updatedSession, unread_count: s.unread_count } : s));
                }
            } else {
                // For INSERT/DELETE, fetch fresh list
                fetchSessions();
            }
        })
        .subscribe();

    // Global Message Listener for Unread Counts
    const messageChannel = supabase
        .channel('admin-global-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Chat_Messages' }, (payload) => {
            const newMsg = payload.new as ChatMessage;
            if (newMsg.sender === 'user') {
                setSessions(prev => prev.map(s => {
                    if (s.id === newMsg.session_id) {
                        // If this session is currently open, don't increase count (it will be read immediately)
                        // Actually, better to increase and let the separate logic handle the read status if focused.
                        // But since we can't easily check "is focused" inside this callback without refs,
                        // we'll increment if it's NOT the selected session ID (we need a ref for selectedSession to be safe or use functional state update correctly)
                        
                        // NOTE: using selectedSession here would be stale due to closure. 
                        // So we increment regardless, and if it IS selected, the other effect cleans it up? 
                        // Or better: we rely on fetchSessions for initial load, and here just increment.
                        return { ...s, unread_count: (s.unread_count || 0) + 1 };
                    }
                    return s;
                }));
            }
        })
        .subscribe();
    
    return () => { 
        supabase.removeChannel(sessionChannel); 
        supabase.removeChannel(messageChannel);
    }
  }, []);

  // Effect to clear unread count if we are looking at the session
  useEffect(() => {
      if (selectedSession) {
          // Reset count locally
          setSessions(prev => prev.map(s => s.id === selectedSession ? { ...s, unread_count: 0 } : s));
          // Mark in DB
          markMessagesAsRead(selectedSession).then(() => {
              if (onMessagesRead) onMessagesRead();
          });
      }
  }, [selectedSession, messages]); // Also run when new messages arrive while selected

  const fetchSessions = async () => {
      try {
          const data = await getActiveSessions();
          setSessions(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  // 2. Fetch Messages when Session Selected
  useEffect(() => {
    if (!selectedSession) return;

    loadMessages(selectedSession);

    // Realtime listener for new messages in this session
    const channel = supabase
        .channel(`admin-chat:${selectedSession}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'Chat_Messages', 
            filter: `session_id=eq.${selectedSession}` 
        }, (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages(prev => {
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
            // Also mark as read immediately if we are viewing it
            if (newMsg.sender === 'user') {
                 markMessagesAsRead(selectedSession).then(() => {
                     if (onMessagesRead) onMessagesRead();
                 });
            }
        })
        .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [selectedSession]);

  const loadMessages = async (id: string) => {
      try {
          const msgs = await getMessages(id);
          setMessages(msgs);
          // Mark as read on load
          markMessagesAsRead(id).then(() => {
              if (onMessagesRead) onMessagesRead();
          });
          setSessions(prev => prev.map(s => s.id === id ? { ...s, unread_count: 0 } : s));
      } catch (err) {
          toast.error("Mesajlar yüklenemedi");
      }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSession || !replyText.trim()) return;

      try {
          await sendMessage(selectedSession, 'admin', replyText);
          setReplyText("");
      } catch (err) {
          toast.error("Mesaj gönderilemedi");
      }
  };

  const handleCloseSession = (id: string) => {
      toast((t) => (
        <div className="flex flex-col gap-2 bg-white rounded-lg p-1">
           <span className="font-medium text-gray-800">Sohbeti sonlandırmak istiyor musunuz?</span>
           <div className="flex gap-2 justify-end mt-2">
               <button 
                 onClick={() => toast.dismiss(t.id)}
                 className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
               >
                 Vazgeç
               </button>
               <button 
                 onClick={async () => {
                     toast.dismiss(t.id);
                     try {
                         await closeSession(id);
                         toast.success("Sohbet sonlandırıldı");
                         // Immediately remove from UI list or update status
                         setSessions(prev => prev.filter(s => s.id !== id));
                         if (selectedSession === id) setSelectedSession(null);
                     } catch (err) {
                         toast.error("İşlem başarısız");
                     }
                 }}
                 className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
               >
                 Bitir
               </button>
           </div>
        </div>
      ), { duration: 5000, icon: '⚠️', style: { minWidth: '300px' } });
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="h-[600px] bg-white border border-gray-200 rounded-xl shadow-sm flex overflow-hidden">
        {/* Sidebar: Session List */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[var(--gold)]" />
                    Aktif Sohbetler ({sessions.length})
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
                {sessions.filter(s => s.status === 'active').length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        Aktif sohbet bulunmuyor.
                    </div>
                ) : (
                    sessions.filter(s => s.status === 'active').map(session => (
                        <div 
                            key={session.id}
                            onClick={() => setSelectedSession(session.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${
                                selectedSession === session.id ? 'bg-white border-l-4 border-l-[var(--gold)]' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-900 text-sm truncate pr-2 flex items-center gap-2">
                                    {session.customer_name}
                                    {session.unread_count && session.unread_count > 0 ? (
                                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                            {session.unread_count}
                                        </span>
                                    ) : null}
                                </span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                    {new Date(session.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">Sohbeti görüntülemek için tıklayın.</p>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
            {selectedSession ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">
                                    {sessions.find(s => s.id === selectedSession)?.customer_name || 'Misafir'}
                                </h4>
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Çevrimiçi
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleCloseSession(selectedSession)}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 border border-red-100 transition-colors"
                        >
                            Sohbeti Bitir
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                                    msg.sender === 'admin' 
                                        ? 'bg-[var(--gold)] text-white rounded-tr-none' 
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                }`}>
                                    {msg.message}
                                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'admin' ? 'text-white/70' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-2 bg-white">
                        <input 
                            type="text" 
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none text-sm"
                            placeholder="Yanıtınızı yazın..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button 
                            type="submit"
                            disabled={!replyText.trim()}
                            className="bg-[var(--gold)] text-white px-6 rounded-lg hover:bg-[var(--off-black)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="w-16 h-16 mb-4 text-gray-200" />
                    <p>Mesajlaşmaya başlamak için soldan bir sohbet seçin.</p>
                </div>
            )}
        </div>
    </div>
  );
}