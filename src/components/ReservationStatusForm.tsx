"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { searchReservation } from "@/actions/reservationStatusActions";
import {
    Search,
    Loader2,
    Calendar,
    Users,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    LogIn,
    LogOut,
    ArrowLeft,
    User,
    FileText
} from 'lucide-react';
import Link from 'next/link';

interface ReservationData {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    customer_city?: string;
    customer_address?: string;
    notes?: string;
    check_in: string;
    check_out: string;
    total_price: number;
    room_status: string;
    payment_status?: string;
    num_adults?: number;
    num_children?: number;
    guest_names?: string[];
    created_at?: string;
}

export default function ReservationStatusForm({ locale }: { locale: string }) {
    const t = useTranslations("ReservationStatus");
    const [email, setEmail] = useState("");
    const [reservationId, setReservationId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reservation, setReservation] = useState<ReservationData | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setReservation(null);

        if (!email || !reservationId) {
            setError(t('invalidInput'));
            setIsLoading(false);
            return;
        }

        const result = await searchReservation(email, reservationId);

        if (result.success && result.data) {
            setReservation(result.data as ReservationData);
        } else {
            setError(t('notFound'));
        }

        setIsLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'checked_in': return <LogIn className="w-5 h-5 text-blue-500" />;
            case 'checked_out': return <LogOut className="w-5 h-5 text-gray-500" />;
            default: return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return t('statusConfirmed');
            case 'pending': return t('statusPending');
            case 'cancelled': return t('statusCancelled');
            case 'checked_in': return t('statusCheckedIn');
            case 'checked_out': return t('statusCheckedOut');
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'checked_in': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'checked_out': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusText = (status?: string) => {
        switch (status) {
            case 'paid': return t('paymentPaid');
            case 'refunded': return t('paymentRefunded');
            default: return t('paymentPending');
        }
    };

    const getPaymentStatusColor = (status?: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'refunded': return 'bg-purple-100 text-purple-800';
            default: return 'bg-orange-100 text-orange-800';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{t('emailLabel')}</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('emailPlaceholder')}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Reservation ID Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{t('reservationIdLabel')}</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={reservationId}
                                onChange={(e) => setReservationId(e.target.value)}
                                placeholder={t('reservationIdPlaceholder')}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent outline-none transition-all text-gray-700"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[var(--gold)] text-white font-bold py-4 rounded-lg hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('searching')}
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                {t('searchButton')}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Reservation Result */}
            {reservation && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
                    <h2 className="text-xl font-bold text-[var(--off-black)] mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-[var(--gold)]" />
                        {t('resultTitle')}
                    </h2>

                    <div className="space-y-6">
                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-3">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(reservation.room_status)}`}>
                                {getStatusIcon(reservation.room_status)}
                                <span className="font-medium">{getStatusText(reservation.room_status)}</span>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getPaymentStatusColor(reservation.payment_status)}`}>
                                <CreditCard className="w-4 h-4" />
                                <span className="font-medium">{getPaymentStatusText(reservation.payment_status)}</span>
                            </div>
                        </div>

                        {/* Main Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Guest Name */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <User className="w-4 h-4" />
                                    {t('customerName')}
                                </div>
                                <div className="font-semibold text-gray-800">{reservation.customer_name}</div>
                            </div>

                            {/* Total Price */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <CreditCard className="w-4 h-4" />
                                    {t('totalPrice')}
                                </div>
                                <div className="font-bold text-2xl text-[var(--gold)]">€{reservation.total_price?.toLocaleString('en-US')}</div>
                            </div>

                            {/* Check-in */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <Calendar className="w-4 h-4" />
                                    {t('checkIn')}
                                </div>
                                <div className="font-semibold text-gray-800">{formatDate(reservation.check_in)}</div>
                            </div>

                            {/* Check-out */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <Calendar className="w-4 h-4" />
                                    {t('checkOut')}
                                </div>
                                <div className="font-semibold text-gray-800">{formatDate(reservation.check_out)}</div>
                            </div>

                            {/* Guests */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <Users className="w-4 h-4" />
                                    {t('guests')}
                                </div>
                                <div className="font-semibold text-gray-800">
                                    {reservation.num_adults || 1} {t('adults')}
                                    {(reservation.num_children || 0) > 0 && `, ${reservation.num_children} ${t('children')}`}
                                </div>
                            </div>

                            {/* Phone */}
                            {reservation.customer_phone && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                        <Phone className="w-4 h-4" />
                                        {t('phone')}
                                    </div>
                                    <div className="font-semibold text-gray-800">{reservation.customer_phone}</div>
                                </div>
                            )}

                            {/* Email */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <Mail className="w-4 h-4" />
                                    {t('email')}
                                </div>
                                <div className="font-semibold text-gray-800">{reservation.customer_email}</div>
                            </div>

                            {/* City */}
                            {reservation.customer_city && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                        <MapPin className="w-4 h-4" />
                                        {t('city')}
                                    </div>
                                    <div className="font-semibold text-gray-800">{reservation.customer_city}</div>
                                </div>
                            )}
                        </div>

                        {/* Address */}
                        {reservation.customer_address && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <MapPin className="w-4 h-4" />
                                    {t('address')}
                                </div>
                                <div className="font-semibold text-gray-800">{reservation.customer_address}</div>
                            </div>
                        )}

                        {/* Guest Names */}
                        {reservation.guest_names && reservation.guest_names.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                                    <Users className="w-4 h-4" />
                                    {t('guestNames')}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {reservation.guest_names.map((name, idx) => (
                                        <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm border border-gray-200 text-gray-700">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {reservation.notes && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <FileText className="w-4 h-4" />
                                    {t('notes')}
                                </div>
                                <div className="text-gray-700">{reservation.notes}</div>
                            </div>
                        )}

                        {/* Reservation ID */}
                        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                            Rezervasyon No: <span className="font-mono">{reservation.id}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Back to Home Button */}
            <div className="text-center">
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--gold)] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('backToHome')}
                </Link>
            </div>
        </div>
    );
}
