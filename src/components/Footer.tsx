import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-[var(--off-black)] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[var(--gold)] font-serif">SOLIS</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-sans">
              {t('desc')}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-[var(--gold)] transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--gold)] transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--gold)] transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white font-serif">{t('quickLinks')}</h4>
            <ul className="space-y-3 text-sm text-gray-400 font-sans">
              <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('about')}</a></li>
              <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('rooms')}</a></li>
              <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('spa')}</a></li>
              <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('contact')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white font-serif">{t('contact')}</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-sans">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[var(--gold)] shrink-0" />
                <span>{t('address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[var(--gold)] shrink-0" />
                <span dir="ltr">+90 533 793 24 72</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[var(--gold)] shrink-0" />
                <span>info@solisboutiquehotel.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white font-serif">{t('newsletter')}</h4>
            <p className="text-gray-400 text-sm mb-4 font-sans">{t('newsletterDesc')}</p>
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder={t('placeholder')} 
                className="bg-gray-800 text-white px-6 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[var(--gold)] font-sans text-sm border border-white/10"
              />
              <button className="bg-[var(--gold)] text-white px-6 py-3 rounded-full font-serif font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-[var(--off-black)] transition-all duration-300 shadow-lg">
                {t('subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500 font-sans">
          <p>&copy; {new Date().getFullYear()} Solis Hotels. {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}