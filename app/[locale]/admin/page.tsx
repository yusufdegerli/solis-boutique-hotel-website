'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Hotel as HotelIcon, 
  BedDouble, 
  Tags, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Activity,
  Calendar,
  User,
  LogIn,
  LogOut
} from 'lucide-react';
import { 
  getHotels, 
  getRooms, 
  createHotel, 
  updateHotel, 
  deleteHotel, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  getBookings,
  updateBookingStatus,
  Booking
} from '@/src/services/hotelService';
import { Hotel, Room } from '@/lib/data';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'live' | 'hotels' | 'rooms' | 'campaigns'>('live');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // Hotel or Room
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();

    // Realtime Subscription
    const channel = supabase
      .channel('realtime bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Reservation_Information' }, (payload) => {
        console.log('Change received!', payload);
        if (payload.eventType === 'INSERT') {
          setBookings((prev) => [payload.new as Booking, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setBookings((prev) => prev.map(b => b.id === payload.new.id ? payload.new as Booking : b));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelsData, roomsData, bookingsData] = await Promise.all([getHotels(), getRooms(), getBookings()]);
      setHotels(hotelsData);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type: 'add' | 'edit', item?: any) => {
    setEditingItem(item || null);
    setFormData(item ? { ...item } : {});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'hotels') {
        if (editingItem) {
          await updateHotel(editingItem.id, formData);
        } else {
          await createHotel(formData);
        }
      } else if (activeTab === 'rooms') {
        if (editingItem) {
          await updateRoom(editingItem.id, formData);
        } else {
          await createRoom(formData);
        }
      }
      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error('Submit Error:', JSON.stringify(err, null, 2));
      setError(`İşlem başarısız oldu: ${err.message || JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    
    setLoading(true);
    try {
      if (activeTab === 'hotels') await deleteHotel(id);
      if (activeTab === 'rooms') await deleteRoom(id);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Silme işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
        await updateBookingStatus(id, newStatus);
        // State update handled by Realtime subscription, but optimistic update is good too
        setBookings(prev => prev.map(b => b.id === id ? { ...b, room_status: newStatus as any } : b));
    } catch (err) {
        console.error(err);
        alert("Durum güncellenemedi.");
    }
  };

  // --- RENDER HELPERS ---

  const SidebarItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id 
          ? 'bg-[var(--gold)] text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:block">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-serif font-bold text-[var(--off-black)]">Solis Admin</h1>
          <p className="text-xs text-gray-400 mt-1">Yönetim Paneli</p>
        </div>
        <nav className="p-4 space-y-2">
          <SidebarItem id="live" icon={Activity} label="Canlı Durum" />
          <SidebarItem id="hotels" icon={HotelIcon} label="Oteller" />
          <SidebarItem id="rooms" icon={BedDouble} label="Odalar" />
          <SidebarItem id="campaigns" icon={Tags} label="Kampanyalar" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 font-serif">
              {activeTab === 'live' && 'Canlı Otel Durumu'}
              {activeTab === 'hotels' && 'Otel Yönetimi'}
              {activeTab === 'rooms' && 'Oda & Fiyat Yönetimi'}
              {activeTab === 'campaigns' && 'Kampanyalar & İndirimler'}
            </h2>
            <p className="text-gray-500 mt-1">
                {activeTab === 'live' ? 'Anlık misafir ve rezervasyon takibi.' : 'İçeriklerinizi buradan yönetebilirsiniz.'}
            </p>
          </div>
          {activeTab !== 'campaigns' && activeTab !== 'live' && (
            <button 
              onClick={() => handleOpenModal('add')}
              className="flex items-center gap-2 bg-[var(--off-black)] text-white px-5 py-2.5 rounded-lg hover:bg-black transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Ekle</span>
            </button>
          )}
        </header>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* CONTENT AREA */}
        {loading && !isModalOpen ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gold)]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* LIVE STATUS TAB */}
            {activeTab === 'live' && (
                <div className="space-y-8">
                    {/* Active Guests Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-green-600" />
                            Şu An Otelde Olanlar
                        </h3>
                        {bookings.filter(b => b.room_status === 'checked_in').length === 0 ? (
                             <p className="text-gray-400 text-sm italic">Şu an giriş yapmış misafir bulunmuyor.</p>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {bookings.filter(b => b.room_status === 'checked_in').map(booking => {
                                    const room = rooms.find(r => r.id === booking.room_id.toString());
                                    const locationInfo = room ? `Oda: ${room.name}` : `Oda ID: ${booking.room_id}`;
                                    
                                    return (
                                        <div key={booking.id} className="border border-green-100 bg-green-50/50 p-4 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-gray-800">{booking.customer_name}</p>
                                                <p className="text-sm text-gray-500">{locationInfo}</p>
                                                <p className="text-xs text-gray-400 mt-1">Çıkış: {booking.check_out}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleStatusChange(booking.id, 'checked_out')}
                                                className="bg-white text-red-600 px-3 py-1.5 rounded border border-red-200 hover:bg-red-50 text-sm font-medium flex items-center gap-1"
                                            >
                                                <LogOut className="w-4 h-4" /> Çıkış Yap
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pending Reservations */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[var(--gold)]" />
                            Bekleyen / Yaklaşan Rezervasyonlar
                        </h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="p-3">Misafir</th>
                                        <th className="p-3">Oda</th>
                                        <th className="p-3">Giriş/Çıkış</th>
                                        <th className="p-3">Durum</th>
                                        <th className="p-3 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {bookings.filter(b => b.room_status === 'pending' || b.room_status === 'confirmed').map(booking => {
                                         const room = rooms.find(r => r.id === booking.room_id.toString());
                                         const roomName = room ? room.name : `Oda #${booking.room_id}`;
                                         
                                         return (
                                            <tr key={booking.id} className="hover:bg-gray-50">
                                                <td className="p-3 font-medium text-gray-900">{booking.customer_name}</td>
                                                <td className="p-3 text-gray-600">{roomName}</td>
                                                <td className="p-3 text-gray-500">
                                                    {booking.check_in} <span className="text-gray-300">/</span> {booking.check_out}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.room_status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {booking.room_status === 'confirmed' ? 'Onaylı' : 'Bekliyor'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right flex justify-end gap-2">
                                                    {booking.room_status === 'pending' && (
                                                        <button onClick={() => handleStatusChange(booking.id, 'confirmed')} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Onayla</button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleStatusChange(booking.id, 'checked_in')}
                                                        className="bg-[var(--off-black)] text-white px-3 py-1.5 rounded hover:bg-black flex items-center gap-1 ml-auto"
                                                    >
                                                        <LogIn className="w-3 h-3" /> Giriş
                                                    </button>
                                                </td>
                                            </tr>
                                         )
                                    })}
                                    {bookings.filter(b => b.room_status === 'pending' || b.room_status === 'confirmed').length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-gray-400 italic">Bekleyen rezervasyon yok.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
            )}

            {/* HOTELS LIST */}
            {activeTab === 'hotels' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 relative">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal('edit', hotel)} className="p-2 bg-white rounded-full shadow text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(hotel.id)} className="p-2 bg-white rounded-full shadow text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900">{hotel.name}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{hotel.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">{hotel.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ROOMS LIST */}
            {activeTab === 'rooms' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                    <tr>
                      <th className="p-4 font-medium">Oda Tipi</th>
                      <th className="p-4 font-medium">Adet</th>
                      <th className="p-4 font-medium">Kapasite</th>
                      <th className="p-4 font-medium">Fiyat (Gecelik)</th>
                      <th className="p-4 font-medium text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-gray-900">{room.name}</p>
                          <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-wider">
                             {hotels.find(h => h.id === room.hotelId)?.name || 'Bilinmeyen Otel'}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-xs mt-1">{room.description}</p>
                        </td>
                        <td className="p-4 text-gray-600 font-bold">{room.quantity}</td>
                        <td className="p-4 text-gray-600">{room.capacity}</td>
                        <td className="p-4 font-medium text-[var(--gold)]">{room.price}₺</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => handleOpenModal('edit', room)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                             <button onClick={() => handleDelete(room.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CAMPAIGNS TAB (Simplified) */}
            {activeTab === 'campaigns' && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                  <Tags className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aktif Kampanyalar</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Şu anda sistemde aktif bir kampanya bulunmamaktadır. Yeni bir indirim veya sezonluk kampanya oluşturmak için aşağıdaki butonu kullanın.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
                   <div className="border border-dashed border-gray-300 rounded-lg p-6 hover:border-[var(--gold)] hover:bg-yellow-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 mb-2">
                         <CheckCircle className="w-5 h-5 text-gray-300 group-hover:text-[var(--gold)]" />
                         <span className="font-bold text-gray-700">Sezon Sonu İndirimi</span>
                      </div>
                      <p className="text-sm text-gray-500 pl-8">Tüm odalarda %15 indirim uygula.</p>
                   </div>
                   <div className="border border-dashed border-gray-300 rounded-lg p-6 hover:border-[var(--gold)] hover:bg-yellow-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 mb-2">
                         <CheckCircle className="w-5 h-5 text-gray-300 group-hover:text-[var(--gold)]" />
                         <span className="font-bold text-gray-700">Erken Rezervasyon</span>
                      </div>
                      <p className="text-sm text-gray-500 pl-8">30 gün öncesi rezervasyonlarda %20 indirim.</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {editingItem ? 'Düzenle' : 'Yeni Ekle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === 'hotels' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Otel Adı</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
                    <input 
                      type="text" 
                      value={formData.location || ''} 
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea 
                      value={formData.description || ''} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resim URL</label>
                    <input 
                      type="text" 
                      value={formData.image || ''} 
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                    />
                  </div>
                </>
              )}

              {activeTab === 'rooms' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bağlı Olduğu Otel</label>
                    <select 
                      value={formData.hotelId || ''} 
                      onChange={(e) => setFormData({...formData, hotelId: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                      required
                    >
                      <option value="">Otel Seçiniz</option>
                      {hotels.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oda Tipi</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok Adedi</label>
                    <input 
                      type="number" 
                      value={formData.quantity || ''} 
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                        <input 
                          type="number" 
                          value={formData.price || ''} 
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                          required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite</label>
                        <input 
                          type="text" 
                          value={formData.capacity || ''} 
                          onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                          placeholder="2 Yetişkin"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea 
                      value={formData.description || ''} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[var(--gold)] text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}