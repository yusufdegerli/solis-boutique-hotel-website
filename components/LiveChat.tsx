"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Globe, Loader2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  translatedFrom?: string;
  originalText?: string;
}

export default function LiveChat({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: locale === 'tr' ? 'Merhaba! Solis Hotels asistanınızım. Size nasıl yardımcı olabilirim?' : 'Hello! I am your Solis Hotels assistant. How can I help you?',
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const pathname = usePathname();

  const isHiddenPage = pathname?.includes("/admin") || pathname?.includes("/login") || pathname?.includes("/update-password");

  if (isHiddenPage) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgId = Date.now().toString();
    const userMessage: Message = {
      id: userMsgId,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate Translation & Response Delay
    setTimeout(() => {
      setIsTyping(false);
      
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getSimulatedResponse(inputText, locale),
        sender: 'agent',
        timestamp: new Date(),
        // Simulate translation metadata if not English
        translatedFrom: locale !== 'en' ? locale.toUpperCase() : undefined,
        originalText: locale !== 'en' ? "Auto-translated message" : undefined
      };
      
      setMessages(prev => [...prev, agentResponse]);
    }, 2000);
  };

  const getSimulatedResponse = (input: string, lang: string) => {
    // Simple keyword matching for demo
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('fiyat') || lowerInput.includes('price')) {
      return lang === 'tr' ? 'Oda fiyatlarımız gecelik 2.500₺\'den başlamaktadır. Tarihlerinizi belirtirseniz detaylı bilgi verebilirim.' : 'Our room rates start from 2.500₺ per night. Please specify your dates for detailed pricing.';
    }
    if (lowerInput.includes('rezervasyon') || lowerInput.includes('book')) {
      return lang === 'tr' ? 'Web sitemiz üzerinden veya 0212 555 0000 numarasından rezervasyon yapabilirsiniz.' : 'You can book via our website or call +90 212 555 0000.';
    }
    return lang === 'tr' ? 'Anladım. Müsaitlik durumunu kontrol edip size hemen dönüyorum.' : 'I understand. Let me check the availability and get back to you immediately.';
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
                    <Globe className="w-3 h-3" /> {locale !== 'en' ? 'Auto-Translation Active' : 'Online'}
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
                    {msg.sender === 'agent' && msg.translatedFrom && (
                       <div className="flex items-center gap-1 text-[10px] text-[var(--gold)] mb-1 font-bold uppercase tracking-wider">
                          <Globe className="w-3 h-3" /> Translated from {locale.toUpperCase()}
                       </div>
                    )}
                    {msg.text}
                    <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" />
                    <span className="text-xs text-gray-400 italic">Translating & typing...</span>
                  </div>
                </div>
              )}
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
