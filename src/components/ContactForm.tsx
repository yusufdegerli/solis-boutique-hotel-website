'use client';

import { useState, useTransition } from 'react';
import { Send } from 'lucide-react';
import { sendContactMessage } from '@/actions/contactActions';
import toast from 'react-hot-toast';

interface ContactFormProps {
  t: {
    name: string;
    surname: string;
    email: string;
    message: string;
    send: string;
    formTitle: string;
  }
}

export default function ContactForm({ t }: ContactFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;

    startTransition(async () => {
      const result = await sendContactMessage(formData);
      
      if (result.success) {
        toast.success(result.message || 'Mesajınız gönderildi!');
        form.reset();
      } else {
        toast.error(result.error || 'Bir hata oluştu.');
      }
    });
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[var(--gold)]/10 rounded-full blur-xl -z-10"></div>
      <h2 className="text-3xl font-bold text-[var(--off-black)] mb-8 font-serif">{t.formTitle}</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-sans">{t.name}</label>
            <input 
              name="name" 
              type="text" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-sans">{t.surname}</label>
            <input 
              name="surname" 
              type="text" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 font-sans">{t.email}</label>
          <input 
            name="email" 
            type="email" 
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 font-sans">{t.message}</label>
          <textarea 
            name="message" 
            rows={4} 
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all"
          ></textarea>
        </div>
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-[var(--gold)] text-white py-4 rounded-lg font-bold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200 font-serif disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? 'Gönderiliyor...' : t.send} 
          {!isPending && <Send className="w-4 h-4 rtl:rotate-180" />}
        </button>
      </form>
    </div>
  );
}
