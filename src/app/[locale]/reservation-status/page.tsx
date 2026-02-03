import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReservationStatusForm from "@/components/ReservationStatusForm";
import { getTranslations } from 'next-intl/server';
import { Search } from "lucide-react";

export default async function ReservationStatusPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('ReservationStatus');

    return (
        <main className="min-h-screen flex flex-col bg-[var(--off-white)]">
            <Navbar locale={locale} />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-[var(--off-black)] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <div className="w-20 h-20 bg-[var(--gold)] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">{t('title')}</h1>
                    <p className="text-gray-400 text-lg font-light">{t('subtitle')}</p>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-16 -mt-8 relative z-10">
                <div className="max-w-2xl mx-auto px-4">
                    <ReservationStatusForm locale={locale} />
                </div>
            </section>

            <div className="flex-grow"></div>
            <Footer />
        </main>
    );
}
