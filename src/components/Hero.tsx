"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "./ParticleBackground";

export default function Hero({ locale }: { locale: string }) {
  const t = useTranslations('Hero');
  const tNav = useTranslations('Navbar');
  const [videoEnded, setVideoEnded] = useState(false);

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

        {/* Animated Logo Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex justify-center my-6 relative min-h-[100px] w-full"
        >
          <AnimatePresence mode="wait">
            {!videoEnded ? (
              <motion.video
                key="video"
                autoPlay
                muted
                playsInline
                onEnded={() => setVideoEnded(true)}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-[400px] max-w-full h-auto object-contain mix-blend-screen transform-gpu"
              >
                <source src="/logo_animation.mp4?v=3" type="video/mp4" />
              </motion.video>
            ) : (
              <motion.img
                key="image"
                src="/logo3.png"
                alt="Solis Hotels"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="max-w-full h-auto object-contain"
                style={{ width: '260px', maxHeight: '120px' }}
              />
            )}
          </AnimatePresence>
        </motion.div>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed font-sans opacity-90 tracking-wide">
          {t('description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-12">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={`/${locale}/#hotels`}
              className="group px-10 py-4 bg-[var(--gold)] text-white font-serif text-lg rounded-full hover:bg-white hover:text-[var(--off-black)] transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center gap-3 uppercase tracking-widest"
            >
              {t('explore')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a
              href="https://tr.hotels.com/ho3406787680/?semcid=HCOM-TR.UB.GOOGLE.PT-DSA-c-TR.HOTEL&semdtl=a113476951092.b1124944680393.g1aud-2141179518447:dsa-977487782636.e1c.m1EAIaIQobChMI9pqz7faalAMVMJGDBx0OuSHeEAAYASAAEgIKmfD_BwE.r1.c1.j19199051.k19199120.d1660336623510.h1.i1290283925904.l1.n1.o1.p1.q1.s1.t1.x1.f1.u1.v1.w1&gad_source=1&gad_campaignid=13476951092&gbraid=0AAAAACTxZ9aqJKDc7BRD1l2afq77K6U9T&gclid=EAIaIQobChMI9pqz7faalAMVMJGDBx0OuSHeEAAYASAAEgIKmfD_BwE"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-transparent border border-white/30 text-white font-serif text-lg rounded-full hover:bg-white/10 transition-all hover:border-white/60 uppercase tracking-widest backdrop-blur-sm"
            >
              {tNav('book')}
            </a>
          </motion.div>
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
