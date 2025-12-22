"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Globe, Loader2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { startChatSession, sendMessage, getMessages, ChatMessage } from "@/src/services/chatService";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, anonKey);

export default function LiveChat({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Can be used for "agent is typing" later
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Load session from local storage or create new on first open
  useEffect(() => {
    if (isOpen && !sessionId) {
        const storedSession = localStorage.getItem('solis_chat_session_id');
        if (storedSession) {
            setSessionId(storedSession);
            loadMessages(storedSession);
        } else {
            // Create new session
            startChatSession('Ziyaretçi').then(session => {
                if (session) {
                    setSessionId(session.id);
                    localStorage.setItem('solis_chat_session_id', session.id);
                    // Add welcome message
                    setMessages([{
                        id: 0,
                        session_id: session.id,
                        sender: 'admin', // System/Bot
                        message: locale === 'tr' ? 'Merhaba! Size nasıl yardımcı olabilirim?' : 'Hello! How can I help you?',
                        created_at: new Date().toISOString()
                    }]);
                }
            });
        }
    }
  }, [isOpen]);

  // Realtime subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
        .channel(`chat:${sessionId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'Chat_Messages', 
            filter: `session_id=eq.${sessionId}` 
        }, (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages(prev => {
                // Prevent duplicate if we added it optimistically (though we don't do that here yet)
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const loadMessages = async (id: string) => {
      try {
          const msgs = await getMessages(id);
          if (msgs && msgs.length > 0) {
            setMessages(msgs);
          } else {
             // If no messages (maybe cleared db), show welcome
             setMessages([{
                id: 0,
                session_id: id,
                sender: 'admin',
                message: locale === 'tr' ? 'Merhaba! Size nasıl yardımcı olabilirim?' : 'Hello! How can I help you?',
                created_at: new Date().toISOString()
            }]);
          }
      } catch (err) {
          console.error(err);
      }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const isHiddenPage = pathname?.includes("/admin") || pathname?.includes("/login") || pathname?.includes("/update-password");

  if (isHiddenPage) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    try {
        await sendMessage(sessionId, 'user', inputText);
        setInputText("");
        // Realtime will add the message to the list
    } catch (err) {
        console.error('Send error:', err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-[var(--off-black)] p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[var(--gold)]">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--off-black)] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold font-heading text-sm">Solis Assistant</h3>
                  <p className="text-[10px] text-gray-300 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Online
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-white/10 rounded">
                    <Minimize2 className="w-4 h-4" />
                 </button>
                 <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                    <X className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${ 
                      msg.sender === 'user'
                        ? 'bg-[var(--gold)] text-white rounded-tr-none shadow-md'
                        : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.message}
                    <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={locale === 'tr' ? "Mesajınızı yazın..." : "Type your message..."}
                className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--gold)] outline-none transition-all text-gray-800"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-[var(--gold)] text-white rounded-full hover:bg-[var(--off-black)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-5 h-5 rtl:rotate-180" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative ${ 
          isOpen && !isMinimized ? 'bg-gray-200 text-gray-500 rotate-90' : 'bg-[var(--off-black)] text-white'
        }`}
      > 
        {isOpen && !isMinimized ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
}
