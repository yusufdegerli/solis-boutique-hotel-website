'use client';

import { useTransition, useState } from 'react';
import { login } from './actions';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[var(--gold)] rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-serif">Yönetici Girişi</h2>
          <p className="mt-2 text-sm text-gray-600">
            Devam etmek için lütfen giriş yapın
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email Adresi</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[var(--gold)] focus:border-[var(--gold)] focus:z-10 sm:text-sm transition-all"
                placeholder="Email Adresi"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[var(--gold)] focus:border-[var(--gold)] focus:z-10 sm:text-sm transition-all"
                placeholder="Şifre"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[var(--off-black)] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gold)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
