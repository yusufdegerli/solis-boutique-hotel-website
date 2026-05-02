'use client';

import { motion } from 'framer-motion';

interface BookButtonProps {
  href: string;
  text: string;
}

export default function BookButton({ href, text }: BookButtonProps) {
  const externalBookingUrl = "https://tr.hotels.com/ho3406787680/?semcid=HCOM-TR.UB.GOOGLE.PT-DSA-c-TR.HOTEL&semdtl=a113476951092.b1124944680393.g1aud-2141179518447:dsa-977487782636.e1c.m1EAIaIQobChMI9pqz7faalAMVMJGDBx0OuSHeEAAYASAAEgIKmfD_BwE.r1.c1.j19199051.k19199120.d1660336623510.h1.i1290283925904.l1.n1.o1.p1.q1.s1.t1.x1.f1.u1.v1.w1&gad_source=1&gad_campaignid=13476951092&gbraid=0AAAAACTxZ9aqJKDc7BRD1l2afq77K6U9T&gclid=EAIaIQobChMI9pqz7faalAMVMJGDBx0OuSHeEAAYASAAEgIKmfD_BwE";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <a 
        href={externalBookingUrl} 
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 bg-[var(--off-black)] text-white text-sm font-serif font-bold uppercase tracking-widest rounded-full hover:bg-[var(--gold)] transition-colors duration-300 shadow-md hover:shadow-lg inline-block text-center min-w-[140px]"
      >
        {text}
      </a>
    </motion.div>
  );
}
