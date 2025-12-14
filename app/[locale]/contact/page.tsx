import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { getTranslations } from 'next-intl/server';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Contact');

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar locale={locale} />
      
      <div className="bg-[var(--off-black)] text-white py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4 font-serif">{t('title')}</h1>
            <p className="text-gray-300 max-w-2xl mx-auto px-4 font-light font-sans">
              {t('desc')}
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-10">
            <h2 className="text-3xl font-bold text-[var(--off-black)] font-serif">{t('contactInfo')}</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="bg-yellow-50 p-4 rounded-full text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white transition-colors duration-300">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 font-serif">{t('addressTitle')}</h3>
                  <p className="text-gray-600 leading-relaxed font-sans">Levent Mah. Büyükdere Cad. No:1, 34330 Beşiktaş/İstanbul</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="bg-yellow-50 p-4 rounded-full text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white transition-colors duration-300">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 font-serif">{t('phoneTitle')}</h3>
                  <p className="text-gray-600 font-sans" dir="ltr">+90 212 555 0000</p>
                  <p className="text-gray-500 text-sm font-sans">{t('phoneDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="bg-yellow-50 p-4 rounded-full text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white transition-colors duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 font-serif">{t('emailTitle')}</h3>
                  <p className="text-gray-600 font-sans">info@solishotels.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[var(--gold)]/10 rounded-full blur-xl -z-10"></div>
            <h2 className="text-3xl font-bold text-[var(--off-black)] mb-8 font-serif">{t('formTitle')}</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 font-sans">{t('name')}</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 font-sans">{t('surname')}</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 font-sans">{t('email')}</label>
                <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 font-sans">{t('message')}</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all"></textarea>
              </div>
              <button type="submit" className="w-full bg-[var(--gold)] text-white py-4 rounded-lg font-bold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200 font-serif">
                {t('send')} <Send className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
