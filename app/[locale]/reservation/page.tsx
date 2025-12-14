import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReservationForm from "@/components/ReservationForm";

export default async function ReservationPage({ 
  searchParams, 
  params 
}: { 
  searchParams: Promise<{ hotel?: string }>,
  params: Promise<{ locale: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const { locale } = await params;
  const hotelId = resolvedSearchParams.hotel;

  return (
    <main className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar locale={locale} />
      <div className="flex-grow max-w-3xl mx-auto w-full px-4 py-32 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[var(--off-black)] mb-2 font-serif">Rezervasyonunuzu Tamamlayın</h1>
          <p className="text-gray-600">Solis ayrıcalıklarıyla dolu bir tatil sizi bekliyor.</p>
        </div>
        
        <ReservationForm preSelectedHotelId={hotelId} />
      </div>
      <Footer />
    </main>
  );
}