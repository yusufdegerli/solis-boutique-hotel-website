"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Hotel, ChevronDown, Globe } from "lucide-react";
import { useTranslations } from 'next-intl';

const LANGUAGES = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
];

async function switchLocale(code: string, currentLocale: string) {
  // Navigate to the same page but with the new locale in the URL
  const currentPath = window.location.pathname;
  // Replace /tr/ with /en/ etc, or if it's just /tr go to /en
  const newPath = currentPath.replace(`/${currentLocale}`, `/${code}`)
    || `/${code}`;
  window.location.href = newPath;
}

export default function Navbar({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Navbar');
  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <div className="bg-[var(--gold)] p-2 rounded-full text-white group-hover:bg-white group-hover:text-[var(--gold)] transition-colors duration-300">
                <Hotel className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-widest text-white group-hover:text-[var(--gold)] transition-colors">SOLIS</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">Hotels &amp; Resorts</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href={`/${locale}`} className="text-white/80 hover:text-[var(--gold)] transition-colors font-sans font-medium text-xs tracking-widest uppercase">{t('home')}</Link>
            <Link href={`/${locale}/#hotels`} className="text-white/80 hover:text-[var(--gold)] transition-colors font-sans font-medium text-xs tracking-widest uppercase">{t('hotels')}</Link>

            {/* Pages Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white/80 hover:text-[var(--gold)] font-sans font-medium text-xs tracking-widest uppercase py-4">
                {t('discover')} <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute left-0 mt-0 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 border-t-2 border-[var(--gold)] overflow-hidden">
                <div className="py-2">
                  <Link href={`/${locale}/rooms`} className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)] font-serif border-b border-gray-100">{t('roomsSuites')}</Link>
                  <Link href={`/${locale}/services`} className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)] font-serif border-b border-gray-100">{t('servicesTransfer')}</Link>
                  <Link href={`/${locale}/pages/istanbul-history`} className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)] font-serif border-b border-gray-100">{t('istanbulHistory')}</Link>
                  <Link href={`/${locale}/blog`} className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--gold)] font-serif">{t('blog')}</Link>
                </div>
              </div>
            </div>

            <Link href={`/${locale}/contact`} className="text-white/80 hover:text-[var(--gold)] transition-colors font-sans font-medium text-xs tracking-widest uppercase">{t('contact')}</Link>

            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-white/80 hover:text-[var(--gold)] border border-white/20 px-3 py-1.5 rounded-full transition-colors duration-300">
                <Globe className="w-3 h-3" />
                <span className="text-sm">{currentLang.flag}</span>
                <span className="uppercase text-[10px] font-bold tracking-wider">{currentLang.code}</span>
              </button>
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border-t-2 border-[var(--gold)] overflow-hidden">
                <div className="py-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code, locale)}
                      className={`flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-[var(--gold)] font-sans transition-colors ${locale === lang.code ? 'text-[var(--gold)] font-bold bg-yellow-50' : 'text-gray-700'}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link href={`/${locale}/reservation`} className="bg-[var(--gold)] text-white px-8 py-3 rounded-full font-serif text-xs uppercase tracking-widest hover:bg-white hover:text-[var(--off-black)] transition-all shadow-lg hover:shadow-xl duration-300 transform hover:-translate-y-0.5">
              {t('book')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-[var(--gold)] focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 p-6 space-y-6 h-screen">
          <Link href={`/${locale}`} className="block text-white font-serif text-lg">{t('home')}</Link>
          <Link href={`/${locale}/rooms`} className="block text-white font-serif text-lg">{t('roomsSuites')}</Link>
          <Link href={`/${locale}/services`} className="block text-white font-serif text-lg">{t('servicesTransfer')}</Link>
          <Link href={`/${locale}/#hotels`} className="block text-white font-serif text-lg">{t('hotels')}</Link>
          <Link href={`/${locale}/contact`} className="block text-white font-serif text-lg">{t('contact')}</Link>
          {/* Mobile language switcher */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Dil / Language</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLocale(lang.code, locale)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${locale === lang.code ? 'bg-[var(--gold)] text-white border-[var(--gold)]' : 'border-white/20 text-white/70 hover:border-[var(--gold)] hover:text-[var(--gold)]'}`}
                >
                  {lang.flag} {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}