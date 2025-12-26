'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface BookButtonProps {
  href: string;
  text: string;
}

export default function BookButton({ href, text }: BookButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link 
        href={href} 
        className="px-6 py-3 bg-[var(--off-black)] text-white text-sm font-serif font-bold uppercase tracking-widest rounded-full hover:bg-[var(--gold)] transition-colors duration-300 shadow-md hover:shadow-lg inline-block text-center min-w-[140px]"
      >
        {text}
      </Link>
    </motion.div>
  );
}
