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
  AlertCircle
} from 'lucide-react';
import { 
  getHotels, 
  getRooms, 
  createHotel, 
  updateHotel, 
  deleteHotel, 
  createRoom, 
  updateRoom, 
  deleteRoom 
} from '@/src/services/hotelService';
import { Hotel, Room } from '@/lib/data';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'hotels' | 'rooms' | 'campaigns'>('hotels');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // Hotel or Room
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelsData, roomsData] = await Promise.all([getHotels(), getRooms()]);
      setHotels(hotelsData);
      setRooms(roomsData);
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
    } catch (err) {
      console.error(err);
      setError('İşlem başarısız oldu.');
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
              {activeTab === 'hotels' && 'Otel Yönetimi'}
              {activeTab === 'rooms' && 'Oda & Fiyat Yönetimi'}
              {activeTab === 'campaigns' && 'Kampanyalar & İndirimler'}
            </h2>
            <p className="text-gray-500 mt-1">İçeriklerinizi buradan yönetebilirsiniz.</p>
          </div>
          {activeTab !== 'campaigns' && (
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
                          <p className="text-xs text-gray-400 truncate max-w-xs">{room.description}</p>
                        </td>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oda Tipi</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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