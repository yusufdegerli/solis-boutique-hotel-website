'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Activity, Filter, Download, Loader2, X, BedDouble } from 'lucide-react';
import { getDashboardStats, DashboardStats } from '@/actions/reportActions';
import { getHotels, Booking } from '@/services/hotelService';
import { Hotel, Room } from '@/lib/data';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface ReportsTabProps {
  bookings?: Booking[];
  rooms?: Room[];
}

export default function ReportsTab({ bookings = [], rooms = [] }: ReportsTabProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>('all');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<Booking[]>([]);

  // Occupancy Modal State
  const [isOccupancyModalOpen, setIsOccupancyModalOpen] = useState(false);
  const [occupancyData, setOccupancyData] = useState<{room: Room, occupied: number, total: number}[]>([]);

  useEffect(() => {
    // Fetch hotels for the filter dropdown
    getHotels().then(setHotels).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const { success, data, error } = await getDashboardStats(selectedHotel);
        if (success && data) {
          setStats(data);
        } else {
          toast.error("Rapor verisi alınamadı: " + error);
        }
      } catch (err) {
        console.error(err);
        toast.error("Beklenmedik hata.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [selectedHotel]);

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    setGeneratingPdf(true);
    const loadingToast = toast.loading('PDF Raporu oluşturuluyor...');

    try {
        const element = printRef.current;
        const canvas = await html2canvas(element, {
            scale: 2, // High resolution
            useCORS: true, // Handle images if any
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        
        // A4 Landscape orientation
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Add Header Text manually to PDF for cleaner text
        const hotelName = selectedHotel === 'all' ? 'Tüm Oteller' : hotels.find(h => h.id.toString() === selectedHotel)?.name || 'Otel';
        const dateStr = new Date().toLocaleDateString('tr-TR');
        
        pdf.setFontSize(16);
        pdf.text(`Solis Hotel - Performans Raporu (${hotelName})`, 10, 15);
        pdf.setFontSize(10);
        pdf.text(`Oluşturulma Tarihi: ${dateStr}`, 10, 22);

        // Add the Image (content)
        // Adjust y position to not overlap with text
        pdf.addImage(imgData, 'PNG', 10, 30, pdfWidth - 20, imgHeight - 20 < pdfHeight ? imgHeight : pdfHeight - 40);

        pdf.save(`Solis_Rapor_${hotelName.replace(/\s+/g, '_')}_${dateStr}.pdf`);
        
        toast.success('Rapor indirildi!', { id: loadingToast });
    } catch (error) {
        console.error('PDF Error:', error);
        toast.error('PDF oluşturulurken hata oluştu.', { id: loadingToast });
    } finally {
        setGeneratingPdf(false);
    }
  };

  const handleKpiClick = (type: string) => {
      if (type === 'bookings') {
          // Filter bookings based on selectedHotel
          let filtered = bookings;
          if (selectedHotel !== 'all') {
              filtered = bookings.filter(b => b.hotel_id === Number(selectedHotel));
          }
          setDetailData(filtered);
          setIsDetailModalOpen(true);
      } 
      else if (type === 'occupancy') {
          // Filter rooms based on selectedHotel
          let targetRooms = rooms;
          if (selectedHotel !== 'all') {
              targetRooms = rooms.filter(r => r.hotelId === selectedHotel);
          }

          // Calculate occupancy for each room type
          // Use local date string YYYY-MM-DD for comparison
          const todayStr = new Date().toLocaleDateString('en-CA');
          
          console.log('--- Occupancy Debug ---');
          console.log('Today:', todayStr);
          console.log('Total Rooms:', targetRooms.length);
          console.log('Total Bookings:', bookings.length);

          const data = targetRooms.map(room => {
              // Find active bookings for this room type
              const activeCount = bookings.filter(b => {
                  const isSameRoom = String(b.room_id) === String(room.id);
                  
                  // Status Check
                  const isValidStatus = ['confirmed', 'checked_in', 'pending'].includes(b.room_status);
                  
                  // Date Logic: Handle potential timestamps like "2025-12-22T10:00..."
                  const checkIn = String(b.check_in).split('T')[0];
                  const checkOut = String(b.check_out).split('T')[0];
                  
                  // Occupied if: CheckIn <= Today < CheckOut
                  const isActiveToday = checkIn <= todayStr && checkOut > todayStr;

                  if (isSameRoom && isValidStatus && isActiveToday) {
                      console.log(`MATCH found for Room ${room.name}:`, b);
                      return true;
                  }
                  return false;
              }).length;

              return {
                  room,
                  occupied: activeCount,
                  total: room.quantity || 0
              };
          });
          
          console.log('Calculated Occupancy:', data);
          setOccupancyData(data);
          setIsOccupancyModalOpen(true);
      }
  };

  const getRoomName = (id: number) => {
      const r = rooms.find(room => room.id === id.toString());
      return r ? r.name : `Oda #${id}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
         <div>
            <h3 className="text-lg font-bold text-gray-800">Genel Bakış</h3>
            <p className="text-sm text-gray-500">
               {selectedHotel === 'all' ? 'Tüm otellerin performans verileri.' : 
                hotels.find(h => h.id.toString() === selectedHotel)?.name + ' için performans verileri.'}
            </p>
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <select 
                   value={selectedHotel}
                   onChange={(e) => setSelectedHotel(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none appearance-none cursor-pointer"
                >
                   <option value="all">Tüm Oteller</option>
                   {hotels.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                   ))}
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
             </div>

             <button 
                onClick={handleDownloadPDF}
                disabled={generatingPdf || loading}
                className="flex items-center gap-2 bg-[var(--off-black)] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
             >
                {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden sm:inline">Rapor Al</span>
             </button>
         </div>
      </div>

      {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gold)]"></div>
          </div>
      ) : stats ? (
          <div ref={printRef} className="space-y-8 p-4 rounded-xl" style={{ backgroundColor: '#ffffff' }}> 
            {/* Added explicit white background for PDF safety */}
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard 
                title="Toplam Gelir" 
                value={`€${stats.totalRevenue.toLocaleString('en-US')}`} 
                icon={DollarSign} 
                color="#22c55e" // green-500
                />
                <KpiCard 
                title="Toplam Rezervasyon" 
                value={stats.totalBookings.toString()} 
                icon={Calendar} 
                color="#3b82f6" // blue-500
                onClick={() => handleKpiClick('bookings')}
                clickable={true}
                />
                <KpiCard 
                title="Aktif Doluluk" 
                value={`%${stats.occupancyRate}`} 
                icon={Activity} 
                color="#a855f7" // purple-500
                desc="Tahmini doluluk oranı"
                onClick={() => selectedHotel !== 'all' && handleKpiClick('occupancy')}
                clickable={selectedHotel !== 'all'}
                disabled={selectedHotel === 'all'}
                disabledTooltip="Detayları görmek için lütfen belirli bir otel seçin."
                />
                <KpiCard 
                title="Aktif Misafir" 
                value={stats.activeBookings.toString()} 
                icon={Users} 
                color="#f97316" // orange-500
                desc="Şu anki veya gelecek"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Monthly Revenue Chart */}
                <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6' }}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: '#1f2937' }}>
                    <TrendingUp className="w-5 h-5" style={{ color: '#d4a373' }} />
                    Aylık Gelir Tablosu (Son 6 Ay)
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} stroke="#9ca3af" />
                        <YAxis tickFormatter={(value) => `${value / 1000}k`} tick={{fill: '#6b7280'}} stroke="#9ca3af" />
                        <RechartsTooltip 
                        formatter={(value: any) => [`€${Number(value).toLocaleString('en-US')}`, 'Gelir']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#ffffff', color: '#374151' }}
                        itemStyle={{ color: '#d4a373' }}
                        />
                        <Bar dataKey="revenue" fill="#d4a373" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </div>

                {/* Status Distribution Pie Chart */}
                <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6' }}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: '#1f2937' }}>
                    <Activity className="w-5 h-5" style={{ color: '#d4a373' }} />
                    Rezervasyon Durum Dağılımı
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={stats.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {stats.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#374151' }} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#4b5563' }} />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>

            </div>
          </div>
      ) : null}

      {/* BOOKING DETAIL MODAL */}
      {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">Rezervasyon Detayları</h3>
                        <p className="text-xs text-gray-500">
                            {selectedHotel === 'all' ? 'Tüm Oteller' : hotels.find(h => h.id.toString() === selectedHotel)?.name} - Toplam {detailData.length} Kayıt
                        </p>
                      </div>
                      <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-sm sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 font-medium border-b border-gray-200">Misafir Adı</th>
                                <th className="p-4 font-medium border-b border-gray-200">Tarihler</th>
                                <th className="p-4 font-medium border-b border-gray-200">Oda</th>
                                <th className="p-4 font-medium border-b border-gray-200">Tutar</th>
                                <th className="p-4 font-medium border-b border-gray-200">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {detailData.map((booking, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-800 font-medium">
                                        {booking.customer_name}
                                        {booking.customer_phone && <div className="text-xs text-gray-400">{booking.customer_phone}</div>}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {booking.check_in} <br />
                                        <span className="text-xs text-gray-400">{booking.check_out}</span>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {getRoomName(booking.room_id)}
                                    </td>
                                    <td className="p-4 text-[var(--gold)] font-bold">
                                        €{Number(booking.total_price).toLocaleString('en-US')}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                            ${booking.room_status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                              booking.room_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                              booking.room_status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            {booking.room_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {detailData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                                        Bu kriterlere uygun kayıt bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                      <button 
                        onClick={() => setIsDetailModalOpen(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                      >
                          Kapat
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* OCCUPANCY VISUAL MODAL */}
      {isOccupancyModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-600" /> Oda Doluluk Durumu
                        </h3>
                        <p className="text-xs text-gray-500">
                            Bugün ({new Date().toLocaleDateString('tr-TR')}) itibarıyla anlık durum.
                        </p>
                      </div>
                      <button onClick={() => setIsOccupancyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
                     {occupancyData.map((item, idx) => (
                         <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                             <div className="flex justify-between items-center mb-4">
                                 <div>
                                     <h4 className="font-bold text-gray-800">{item.room.name}</h4>
                                     <p className="text-xs text-gray-400">
                                         {hotels.find(h => h.id.toString() === item.room.hotelId)?.name}
                                     </p>
                                 </div>
                                 <div className="text-sm font-medium">
                                     <span className="text-purple-600">{item.occupied} Dolu</span>
                                     <span className="text-gray-300 mx-1">/</span>
                                     <span className="text-gray-500">{item.total} Toplam</span>
                                 </div>
                             </div>
                             
                             {/* Icons Grid */}
                             <div className="flex flex-wrap gap-2">
                                 {Array.from({ length: item.total }).map((_, i) => {
                                     const isOccupied = i < item.occupied;
                                     return (
                                         <div 
                                            key={i} 
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all
                                                ${isOccupied 
                                                    ? 'bg-purple-100 text-purple-600 border border-purple-200' 
                                                    : 'bg-gray-100 text-gray-300 border border-gray-200'
                                                }`}
                                            title={isOccupied ? "Dolu" : "Boş"}
                                         >
                                             <BedDouble className="w-5 h-5" />
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                     ))}
                     {occupancyData.length === 0 && (
                         <p className="text-center text-gray-400">Oda bilgisi bulunamadı.</p>
                     )}
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-white text-right flex justify-between items-center">
                       <div className="flex gap-4 text-xs font-medium">
                           <div className="flex items-center gap-1">
                               <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
                               <span className="text-gray-600">Dolu Oda</span>
                           </div>
                           <div className="flex items-center gap-1">
                               <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                               <span className="text-gray-400">Boş Oda</span>
                           </div>
                       </div>
                      <button 
                        onClick={() => setIsOccupancyModalOpen(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                      >
                          Kapat
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color, desc, onClick, clickable, disabled, disabledTooltip }: any) {
  return (
    <div 
      className={`p-6 rounded-xl shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200 border border-gray-100 bg-white`}
      style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6' }}
    >
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{title}</p>
        <h4 className="text-2xl font-bold" style={{ color: '#111827' }}>{value}</h4>
        {desc && <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{desc}</p>}
      </div>
      <div 
        onClick={!disabled ? onClick : undefined}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${
            disabled 
            ? 'opacity-50 cursor-not-allowed grayscale' 
            : clickable 
                ? 'cursor-pointer hover:scale-110 active:scale-95 hover:ring-2 hover:ring-offset-2 hover:ring-blue-500' 
                : 'group-hover:scale-110'
        }`}
        style={{ backgroundColor: color }}
        title={disabled ? disabledTooltip : (clickable ? "Detaylar için tıkla" : "")}
      >
        <Icon className="w-6 h-6" style={{ color: '#ffffff' }} />
      </div>
    </div>
  );
}
