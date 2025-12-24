import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import { getTranslations } from 'next-intl/server';
import ContactForm from "@/components/ContactForm";
import { Toaster } from 'react-hot-toast';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Contact');

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar locale={locale} />
      <Toaster position="bottom-right" />
      
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
                  <p className="text-gray-600 leading-relaxed font-sans">{t('addressDetail')}</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="bg-yellow-50 p-4 rounded-full text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white transition-colors duration-300">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 font-serif">{t('phoneTitle')}</h3>
                  <p className="text-gray-600 font-sans" dir="ltr">{t('phoneNumber')}</p>
                  <p className="text-gray-500 text-sm font-sans">{t('phoneDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="bg-yellow-50 p-4 rounded-full text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white transition-colors duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 font-serif">{t('emailTitle')}</h3>
                  <p className="text-gray-600 font-sans">{t('emailAddress')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm t={{
            name: t('name'),
            surname: t('surname'),
            email: t('email'),
            message: t('message'),
            send: t('send'),
            formTitle: t('formTitle')
          }} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
