'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChatMessage, ChatSession, getActiveSessions, getMessages, sendMessage, closeSession } from '@/src/services/chatService';
import { Send, User, Clock, CheckCircle, XCircle, Search, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, anonKey);

export default function ChatPanel() {
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
    const channel = supabase
        .channel('admin-chat-list')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Chat_Sessions' }, () => {
            fetchSessions();
        })
        .subscribe();
    
    return () => { supabase.removeChannel(channel); }
  }, []);

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
            // Play sound?
        })
        .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [selectedSession]);

  const loadMessages = async (id: string) => {
      try {
          const msgs = await getMessages(id);
          setMessages(msgs);
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

  const handleCloseSession = async (id: string) => {
      if (!confirm("Bu sohbeti sonlandırmak istediğinize emin misiniz?")) return;
      try {
          await closeSession(id);
          toast.success("Sohbet sonlandırıldı");
          setSelectedSession(null);
          fetchSessions();
      } catch (err) {
          toast.error("İşlem başarısız");
      }
  };

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

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
                {sessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        Aktif sohbet bulunmuyor.
                    </div>
                ) : (
                    sessions.map(session => (
                        <div 
                            key={session.id}
                            onClick={() => setSelectedSession(session.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${
                                selectedSession === session.id ? 'bg-white border-l-4 border-l-[var(--gold)]' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-900 text-sm">{session.customer_name}</span>
                                <span className="text-[10px] text-gray-400">
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
