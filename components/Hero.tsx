"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import ParticleBackground from "./ParticleBackground";

export default function Hero({ locale }: { locale: string }) {
  const t = useTranslations('Hero');
  const tNav = useTranslations('Navbar');

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* 3D Particle Background */}
      <ParticleBackground />

      {/* Overlay for readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        <span className="inline-block py-2 px-4 rounded-full bg-white/5 backdrop-blur-md border border-[var(--gold)]/30 text-[var(--gold)] text-xs tracking-[0.2em] uppercase font-sans mb-4">
          Solis Hotels & Resorts
        </span>
        
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold text-white tracking-tighter drop-shadow-2xl leading-none font-serif">
          {t('subtitle')} <br />
          <span className="text-[var(--gold)] italic pr-2 font-serif">{t('subtitleHighlight')}</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed font-sans opacity-90 tracking-wide">
          {t('description')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-12">
          <Link 
            href={`/${locale}/#hotels`} 
            className="group px-10 py-4 bg-[var(--gold)] text-white font-serif text-lg rounded-sm hover:bg-white hover:text-[var(--off-black)] transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center gap-3 uppercase tracking-widest"
          >
            {t('explore')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
          </Link>
          <Link 
            href={`/${locale}/reservation`}
            className="px-10 py-4 bg-transparent border border-white/30 text-white font-serif text-lg rounded-sm hover:bg-white/10 transition-all hover:border-white/60 uppercase tracking-widest backdrop-blur-sm"
          >
            {tNav('book')}
          </Link>
        </div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-pulse"
      >
        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[var(--gold)] to-transparent mx-auto"></div>
      </motion.div>
    </div>
  );
}
