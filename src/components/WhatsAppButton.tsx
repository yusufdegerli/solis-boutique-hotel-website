"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function WhatsAppButton() {
  const pathname = usePathname();

  const isHiddenPage = pathname?.includes("/admin") || pathname?.includes("/login") || pathname?.includes("/update-password");

  if (isHiddenPage) {
    return null;
  }

  return (
    <motion.a
      href="https://wa.me/905337932472"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-2xl hover:bg-[#1fb355] transition-all duration-300 group"
    >
      <MessageCircle className="w-6 h-6 fill-white stroke-none" />
      <span className="font-bold font-sans text-sm hidden group-hover:inline-block transition-all duration-300">
        WhatsApp'tan Ulaşın
      </span>
    </motion.a>
  );
}
