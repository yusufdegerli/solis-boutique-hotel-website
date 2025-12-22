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
  LogOut,
  Image as ImageIcon
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
  Booking,
  uploadImage
} from '@/src/services/hotelService';
import { updateBookingStatusServer } from '@/src/actions/bookingActions';
import { Hotel, Room } from '@/lib/data';
import { supabase } from '@/lib/supabaseClient';
import { logout } from '../login/actions';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'live' | 'hotels' | 'rooms' | 'campaigns'>('live');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // Hotel or Room
  const [formData, setFormData] = useState<any>({});

  // --- NEW: Check-In / Check-Out States ---
  const [checkInModal, setCheckInModal] = useState<{ isOpen: boolean, bookingId: string | null }>({ isOpen: false, bookingId: null });
  const [checkOutModal, setCheckOutModal] = useState<{ isOpen: boolean, bookingId: string | null }>({ isOpen: false, bookingId: null });
  
  const [checkInForm, setCheckInForm] = useState({
      guest_id_number: '',
      guest_nationality: '',
      check_in_notes: '',
      payment_received: false
  });

  const [checkOutForm, setCheckOutForm] = useState({
      extra_charges: 0,
      damage_report: '',
      payment_settled: false
  });

  const openCheckIn = (bookingId: string) => {
      setCheckInForm({ guest_id_number: '', guest_nationality: '', check_in_notes: '', payment_received: false });
      setCheckInModal({ isOpen: true, bookingId });
  };

  const openCheckOut = (bookingId: string) => {
      setCheckOutForm({ extra_charges: 0, damage_report: '', payment_settled: false });
      setCheckOutModal({ isOpen: true, bookingId });
  };

  const submitCheckIn = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!checkInModal.bookingId) return;

      // --- VALIDATION START ---
      const idInput = checkInForm.guest_id_number.trim().toUpperCase();
      
      // TC Identity: Exactly 11 digits
      const isTC = /^[0-9]{11}$/.test(idInput);
      
      // Passport: Starts with 'U', followed by 8 alphanumeric characters (Total 9)
      const isPassport = /^U[A-Z0-9]{8}$/.test(idInput);

      if (!isTC && !isPassport) {
          toast.error("Hatalı Kimlik/Pasaport Formatı!\nTC Kimlik (11 hane) veya Pasaport (U+8 hane) giriniz.");
          return;
      }
      // --- VALIDATION END ---

      setLoading(true);
      const loadingToast = toast.loading('Giriş işlemi yapılıyor...');
      try {
          const result = await updateBookingStatusServer(checkInModal.bookingId, 'checked_in', {
              guest_id_number: idInput, // Use cleaned input
              guest_nationality: checkInForm.guest_nationality,
              check_in_notes: checkInForm.check_in_notes,
              payment_status: checkInForm.payment_received ? 'paid' : 'pending'
          });

          if (!result.success) {
             throw new Error(result.error || "Veritabanı güncellenemedi.");
          }

          toast.success('Misafir girişi başarıyla tamamlandı!', { id: loadingToast });
          setCheckInModal({ isOpen: false, bookingId: null });
          fetchData(); // Refresh list
      } catch (err: any) {
          console.error('Check-in Error:', err);
          toast.error(`Giriş işlemi başarısız: ${err.message || "Bilinmeyen hata"}`, { id: loadingToast });
      } finally {
          setLoading(false);
      }
  };

  const submitCheckOut = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!checkOutModal.bookingId) return;
      
      setLoading(true);
      const loadingToast = toast.loading('Çıkış işlemi yapılıyor...');

      try {
          const result = await updateBookingStatusServer(checkOutModal.bookingId, 'checked_out', {
              extra_charges: checkOutForm.extra_charges,
              damage_report: checkOutForm.damage_report,
              payment_status: checkOutForm.payment_settled ? 'paid' : 'pending'
          });

          if (!result.success) {
             throw new Error(result.error || "Veritabanı güncellenemedi.");
          }

          toast.success('Misafir çıkışı başarıyla tamamlandı!', { id: loadingToast });
          setCheckOutModal({ isOpen: false, bookingId: null });
          fetchData();
      } catch (err: any) {
           console.error('Check-out Error:', err);
           toast.error(`Çıkış işlemi başarısız: ${err.message}`, { id: loadingToast });
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchData();

    // Realtime Subscription
    const channel = supabase
      .channel('realtime bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Reservation_Information' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBookings((prev) => [payload.new as Booking, ...prev]);
          toast('Yeni rezervasyon geldi!', { icon: '🔔' });
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
      toast.error('Veriler yüklenemedi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const loadingToast = toast.loading('Resim yükleniyor...');
    try {
      const file = e.target.files[0];
      const url = await uploadImage(file);
      setFormData((prev: any) => ({ ...prev, image: url }));
      toast.success('Resim yüklendi', { id: loadingToast });
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Resim yüklenirken hata oluştu', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleRoomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const currentImages = formData.images || [];
    if (currentImages.length >= 5) {
      toast.error("En fazla 5 fotoğraf yükleyebilirsiniz.");
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading('Resim yükleniyor...');
    try {
      const file = e.target.files[0];
      const url = await uploadImage(file);
      setFormData((prev: any) => ({
        ...prev, 
        images: [...(prev.images || []), url] 
      }));
      toast.success('Resim eklendi', { id: loadingToast });
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Resim yüklenirken hata oluştu', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const removeRoomImage = (indexToRemove: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, idx: number) => idx !== indexToRemove)
    }));
  };

  const handleOpenModal = (type: 'add' | 'edit', item?: any) => {
    setEditingItem(item || null);
    // Ensure images array exists for rooms
    setFormData(item ? { ...item, images: item.images || (item.image ? [item.image] : []) } : { images: [] });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const loadingToast = toast.loading('Kaydediliyor...');

    try {
      if (activeTab === 'hotels') {
        if (editingItem) {
          await updateHotel(editingItem.id, formData);
        } else {
          await createHotel(formData);
        }
      } else if (activeTab === 'rooms') {
        // Validate Room Images
        const images = formData.images || [];
        if (images.length < 1) {
          throw new Error("En az 1 fotoğraf yüklemelisiniz.");
        }
        if (images.length > 5) {
          throw new Error("En fazla 5 fotoğraf yükleyebilirsiniz.");
        }

        if (editingItem) {
          await updateRoom(editingItem.id, formData);
        } else {
          await createRoom(formData);
        }
      }
      setIsModalOpen(false);
      fetchData(); // Refresh data
      toast.success('İşlem başarıyla kaydedildi!', { id: loadingToast });
    } catch (err: any) {
      console.error('Submit Error:', JSON.stringify(err, null, 2));
      toast.error(`İşlem başarısız: ${err.message || "Hata"}`, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Custom Confirmation Toast for Delete
    toast((t) => (
      <div className="flex flex-col gap-2">
         <span className="font-medium text-gray-800">Bu kaydı silmek istediğinize emin misiniz?</span>
         <div className="flex gap-2 justify-end">
             <button 
               onClick={() => toast.dismiss(t.id)}
               className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
             >
               Vazgeç
             </button>
             <button 
               onClick={async () => {
                   toast.dismiss(t.id);
                   setLoading(true);
                   try {
                     if (activeTab === 'hotels') await deleteHotel(id);
                     if (activeTab === 'rooms') await deleteRoom(id);
                     fetchData();
                     toast.success("Kayıt silindi.");
                   } catch (err) {
                     console.error(err);
                     toast.error("Silme işlemi başarısız.");
                   } finally {
                     setLoading(false);
                   }
               }}
               className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded text-white"
             >
               Evet, Sil
             </button>
         </div>
      </div>
    ), { duration: 5000, icon: '🗑️' });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const loadingToast = toast.loading('Durum güncelleniyor...');
    try {
        const result = await updateBookingStatusServer(id, newStatus);
        if (!result.success) throw new Error(result.error);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, room_status: newStatus as any } : b));
        
        // Custom message based on status
        if (newStatus === 'confirmed') toast.success('Rezervasyon onaylandı ve mail gönderildi!', { id: loadingToast });
        else if (newStatus === 'cancelled') toast.success('Rezervasyon iptal edildi.', { id: loadingToast });
        else toast.success('Durum güncellendi.', { id: loadingToast });

    } catch (err: any) {
        console.error(err);
        toast.error(`Güncelleme hatası: ${err.message}`, { id: loadingToast });
    }
  };

  const confirmCancellation = (bookingId: string) => {
    toast((t) => (
        <div className="flex flex-col gap-2">
           <span className="font-medium text-gray-800">Bu rezervasyonu iptal etmek istediğinize emin misiniz?</span>
           <div className="flex gap-2 justify-end">
               <button 
                 onClick={() => toast.dismiss(t.id)}
                 className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
               >
                 Vazgeç
               </button>
               <button 
                 onClick={() => {
                     toast.dismiss(t.id);
                     handleStatusChange(bookingId, 'cancelled');
                 }}
                 className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded text-white"
               >
                 İptal Et
               </button>
           </div>
        </div>
      ), { duration: 5000, icon: '⚠️' });
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
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
            zIndex: 99999, // Ensure it's above everything including modals
        }}
        toastOptions={{
            // Define default options
            className: '',
            duration: 4000,
            style: {
                background: '#ffffff',
                color: '#1f2937', // Gray-800
                border: '1px solid #e5e7eb', // Gray-200
                padding: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Shadow-lg
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '12px',
            },
            // Default options for specific types
            success: {
                duration: 3000,
                iconTheme: {
                    primary: '#10b981', // Green-500
                    secondary: '#ffffff',
                },
                style: {
                    borderLeft: '4px solid #10b981',
                }
            },
            error: {
                duration: 5000,
                iconTheme: {
                    primary: '#ef4444', // Red-500
                    secondary: '#ffffff',
                },
                style: {
                    borderLeft: '4px solid #ef4444',
                }
            },
            loading: {
                style: {
                    borderLeft: '4px solid #d4a373', // Gold
                }
            }
        }}
      />
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:block">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-serif font-bold text-[var(--off-black)]">Solis Admin</h1>
          <p className="text-xs text-gray-400 mt-1">Yönetim Paneli</p>
        </div>
        <nav className="p-4 flex flex-col h-[calc(100vh-120px)]">
          <div className="space-y-2 flex-1">
            <SidebarItem id="live" icon={Activity} label="Canlı Durum" />
            <SidebarItem id="hotels" icon={HotelIcon} label="Oteller" />
            <SidebarItem id="rooms" icon={BedDouble} label="Odalar" />
            <SidebarItem id="campaigns" icon={Tags} label="Kampanyalar" />
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
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
                                                {booking.customer_phone && <p className="text-xs text-gray-500">{booking.customer_phone}</p>}
                                                <p className="text-sm text-gray-500">{locationInfo}</p>
                                                <p className="text-xs text-gray-400 mt-1">Çıkış: {booking.check_out}</p>
                                            </div>
                                            <button 
                                                onClick={() => openCheckOut(booking.id)}
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
                                                <td className="p-3">
                                                    <p className="font-medium text-gray-900">{booking.customer_name}</p>
                                                    {booking.customer_phone && (
                                                        <p className="text-xs text-gray-400">{booking.customer_phone}</p>
                                                    )}
                                                </td>
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
                                                        <>
                                                            <button 
                                                                onClick={() => confirmCancellation(booking.id)} 
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="İptal Et"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleStatusChange(booking.id, 'confirmed')} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Onayla</button>
                                                        </>
                                                    )}
                                                    <button 
                                                        onClick={() => openCheckIn(booking.id)}
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
                      <th className="p-4 font-medium">Fotoğraflar</th>
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
                        <td className="p-4">
                           <div className="flex -space-x-2 overflow-hidden">
                             {room.images && room.images.length > 0 ? (
                               room.images.map((img, i) => (
                                 <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src={img} alt="" />
                               ))
                             ) : (
                               <span className="text-xs text-gray-400">Görsel Yok</span>
                             )}
                           </div>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resim</label>
                    <div className="flex flex-col gap-2">
                        <input 
                        type="text" 
                        value={formData.image || ''} 
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                        placeholder="https://... veya dosya yükleyin"
                        />
                        <div className="flex items-center gap-2">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-[var(--gold)] hover:file:bg-yellow-100 cursor-pointer"
                            />
                            {uploading && <span className="text-xs text-gray-500 animate-pulse">Yükleniyor...</span>}
                        </div>
                    </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fotoğraflar (Min 1, Maks 5)</label>
                    <div className="space-y-3">
                        {/* Image Preview Grid */}
                        <div className="grid grid-cols-5 gap-2">
                            {formData.images && formData.images.map((img: string, idx: number) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={img} alt={`Oda Görseli ${idx}`} className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removeRoomImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {(!formData.images || formData.images.length < 5) && (
                                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--gold)] hover:bg-yellow-50 transition-colors aspect-square">
                                    <Plus className="text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Ekle</span>
                                    <input type="file" accept="image/*" onChange={handleRoomImageUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                        {uploading && <p className="text-xs text-[var(--gold)] animate-pulse">Yükleniyor...</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok Adedi</label>
                        <input 
                          type="number" 
                          value={formData.quantity || ''} 
                          onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})
                          }
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
      {/* CHECK-IN MODAL */}
      {checkInModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                 <LogIn className="w-5 h-5 text-[var(--gold)]" /> Misafir Girişi (Check-in)
               </h3>
               <button onClick={() => setCheckInModal({isOpen: false, bookingId: null})} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
             </div>
             <form onSubmit={submitCheckIn} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik / Pasaport No</label>
                   <input 
                     type="text" 
                     required
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                     value={checkInForm.guest_id_number}
                     onChange={(e) => setCheckInForm({...checkInForm, guest_id_number: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Uyruk</label>
                   <input 
                     type="text" 
                     required
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                     value={checkInForm.guest_nationality}
                     onChange={(e) => setCheckInForm({...checkInForm, guest_nationality: e.target.value})}
                     placeholder="Örn: TC, Almanya..."
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Notlar (Opsiyonel)</label>
                   <textarea 
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                     value={checkInForm.check_in_notes}
                     onChange={(e) => setCheckInForm({...checkInForm, check_in_notes: e.target.value})}
                     placeholder="Özel istekler, oda numarası teyidi vb."
                   />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="paymentReceived"
                      checked={checkInForm.payment_received}
                      onChange={(e) => setCheckInForm({...checkInForm, payment_received: e.target.checked})}
                      className="w-4 h-4 text-[var(--gold)] focus:ring-[var(--gold)] border-gray-300 rounded"
                    />
                    <label htmlFor="paymentReceived" className="text-sm font-medium text-gray-700">Ödeme Tahsil Edildi</label>
                </div>
                
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setCheckInModal({isOpen: false, bookingId: null})} className="flex-1 py-2 bg-gray-100 rounded-lg font-medium text-gray-700 hover:bg-gray-200">İptal</button>
                   <button type="submit" disabled={loading} className="flex-1 py-2 bg-[var(--gold)] text-white rounded-lg font-bold hover:bg-yellow-600 shadow-lg transition-colors">
                     {loading ? 'İşleniyor...' : 'Girişi Tamamla'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* CHECK-OUT MODAL */}
      {checkOutModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                 <LogOut className="w-5 h-5 text-red-600" /> Misafir Çıkışı (Check-out)
               </h3>
               <button onClick={() => setCheckOutModal({isOpen: false, bookingId: null})} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
             </div>
             <form onSubmit={submitCheckOut} className="p-6 space-y-4">
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-800 mb-4">
                   Lütfen oda kontrolünü yaptığınızdan ve anahtarı teslim aldığınızdan emin olun.
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Ekstra Harcamalar (Minibar vb.)</label>
                   <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                        <input 
                            type="number" 
                            className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                            value={checkOutForm.extra_charges}
                            onChange={(e) => setCheckOutForm({...checkOutForm, extra_charges: parseFloat(e.target.value) || 0})}
                        />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Hasar / Olay Raporu</label>
                   <textarea 
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--gold)] outline-none"
                     value={checkOutForm.damage_report}
                     onChange={(e) => setCheckOutForm({...checkOutForm, damage_report: e.target.value})}
                     placeholder="Oda durumu hakkında notlar..."
                   />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="paymentSettled"
                      required
                      checked={checkOutForm.payment_settled}
                      onChange={(e) => setCheckOutForm({...checkOutForm, payment_settled: e.target.checked})}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="paymentSettled" className="text-sm font-bold text-gray-800">Tüm ödemeler alındı ve hesap kapatıldı</label>
                </div>
                
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setCheckOutModal({isOpen: false, bookingId: null})} className="flex-1 py-2 bg-gray-100 rounded-lg font-medium text-gray-700 hover:bg-gray-200">İptal</button>
                   <button type="submit" disabled={loading} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg transition-colors">
                     {loading ? 'İşleniyor...' : 'Çıkışı Onayla'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
