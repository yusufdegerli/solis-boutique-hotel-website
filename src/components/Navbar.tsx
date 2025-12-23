"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Hotel, Globe, ChevronDown } from "lucide-react";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const t = useTranslations('Navbar');
  const router = useRouter();
  const pathname = usePathname();

  // Removed Auth Logic (Guest Mode)

  const handleLanguageChange = (newLocale: string) => {
    // Replace locale in path
    const pathSegments = pathname.split('/');
    pathSegments[1] = newLocale;
    const newPath = pathSegments.join('/');
    router.push(newPath);
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <div className="bg-[var(--gold)] p-2 rounded-sm text-white group-hover:bg-white group-hover:text-[var(--gold)] transition-colors duration-300">
                <Hotel className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                  <span className="font-serif font-bold text-2xl tracking-widest text-white group-hover:text-[var(--gold)] transition-colors">SOLIS</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">Hotels & Resorts</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link href={`/${locale}`} className="text-white/80 hover:text-[var(--gold)] transition-colors font-sans font-medium text-xs tracking-widest uppercase">{t('home')}</Link>
            <Link href={`/${locale}/#hotels`} className="text-white/80 hover:text-[var(--gold)] transition-colors font-sans font-medium text-xs tracking-widest uppercase">
                {locale === 'tr' ? 'Şubeler' : locale === 'en' ? 'Branches' : t('hotels')}
            </Link>
            
            {/* Pages Dropdown */}
            <div className="relative group" onMouseEnter={() => setIsPagesOpen(true)} onMouseLeave={() => setIsPagesOpen(false)}>
                <button className="flex items-center gap-1 text-white/80 hover:text-[var(--gold)] font-sans font-medium text-xs tracking-widest uppercase py-4">
                    {locale === 'tr' ? 'Keşfet' : 'Discover'} <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute left-0 mt-0 w-56 bg-white rounded-sm shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 border-t-2 border-[var(--gold)]">
                    <div className="py-2">
                        <Link href={`/${locale}/rooms`} className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)] font-serif border-b border-gray-100">
                           {locale === 'tr' ? 'Odalar & Suitler' : 'Rooms & Suites'}
                        </Link>
                        <Link href={`/${locale}/services`} className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)] font-serif border-b border-gray-100">
                           {locale === 'tr' ? 'Hizmetler & Transfer' : 'Services & Transfer'}
                        </Link>
                         <Link href={`/${locale}/pages/istanbul-history`} className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)] font-serif border-b border-gray-100">
                           {locale === 'tr' ? 'İstanbul Tarihi' : 'History of Istanbul'}
                        </Link>
                        <Link href={`/${locale}/blog`} className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)] font-serif">
                           {locale === 'tr' ? 'Blog' : 'Blog'}
                        </Link>
                    </div>
                </div>
            </div>

            <Link href={`/${locale}/contact`} className="text-white/80 hover:text-[var(--gold)] transition-colors font-sans font-medium text-xs tracking-widest uppercase">{t('contact')}</Link>
            
            {/* Language Switcher */}
            <div className="relative group">
                <button className="flex items-center gap-2 text-white/80 hover:text-[var(--gold)] border border-white/20 px-3 py-1 rounded-sm">
                    <Globe className="w-3 h-3" />
                    <span className="uppercase text-[10px] font-bold tracking-wider">
                        {locale === 'tr' ? '🇹🇷 TR' : 
                         locale === 'en' ? '🇬🇧 EN' : 
                         locale === 'ar' ? '🇸🇦 AR' : 
                         locale === 'hu' ? '🇭🇺 HU' : '🇷🇴 RO'}
                    </span>
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 z-50">
                    {[
                        { code: 'tr', label: '🇹🇷 TR' },
                        { code: 'en', label: '🇬🇧 EN' },
                        { code: 'ar', label: '🇸🇦 AR' },
                        { code: 'hu', label: '🇭🇺 HU' },
                        { code: 'ro', label: '🇷🇴 RO' }
                    ].map((l) => (
                        <button 
                            key={l.code} 
                            onClick={() => handleLanguageChange(l.code)}
                            className={`block w-full text-left px-4 py-2 text-xs uppercase tracking-wider hover:bg-gray-50 rounded-sm ${locale === l.code ? 'text-[var(--gold)] font-bold' : 'text-gray-700'}`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            <Link href={`/${locale}/reservation`} className="bg-[var(--gold)] text-white px-6 py-3 rounded-sm font-serif text-xs uppercase tracking-widest hover:bg-white hover:text-[var(--off-black)] transition-all shadow-lg hover:shadow-xl duration-200">
              {t('book')}
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-[var(--gold)] focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 p-6 space-y-6 h-screen">
           <Link href={`/${locale}`} className="block text-white font-serif text-lg">{t('home')}</Link>
           <Link href={`/${locale}/rooms`} className="block text-white font-serif text-lg">Odalar</Link>
           <Link href={`/${locale}/services`} className="block text-white font-serif text-lg">Hizmetler</Link>
           <Link href={`/${locale}/#hotels`} className="block text-white font-serif text-lg">{t('hotels')}</Link>
           <Link href={`/${locale}/contact`} className="block text-white font-serif text-lg">{t('contact')}</Link>
           <div className="flex gap-4 pt-4 border-t border-gray-800">
                {['tr', 'en', 'ar', 'hu', 'ro'].map((l) => (
                    <button key={l} onClick={() => handleLanguageChange(l)} className={`uppercase text-sm ${locale === l ? 'text-[var(--gold)] font-bold' : 'text-gray-500'}`}>
                        {l}
                    </button>
                ))}
           </div>
        </div>
      )}
    </nav>
  );
}