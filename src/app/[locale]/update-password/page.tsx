'use client';

import { useTransition, useState } from 'react';
import { updatePassword } from '../login/actions';
import { KeyRound } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor.' });
      return;
    }

    // Strong Password Regex Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setMessage({ type: 'error', text: 'Şifreniz en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir.' });
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi. Yönetim paneline yönlendiriliyorsunuz...' });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[var(--gold)] rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-serif">Yeni Şifre Belirle</h2>
          <p className="mt-2 text-sm text-gray-600">
            Lütfen yeni şifrenizi giriniz.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">Yeni Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[var(--gold)] focus:border-[var(--gold)] focus:z-10 sm:text-sm transition-all"
                placeholder="Yeni Şifre"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Yeni Şifre (Tekrar)</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[var(--gold)] focus:border-[var(--gold)] focus:z-10 sm:text-sm transition-all"
                placeholder="Yeni Şifre (Tekrar)"
              />
            </div>
          </div>

          {message && (
            <div className={`text-sm text-center p-3 rounded-lg border ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[var(--off-black)] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gold)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
