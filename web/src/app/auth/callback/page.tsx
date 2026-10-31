'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    async function handleAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          console.error('Auth error:', error);
          setStatus('error');
          return;
        }

        const rawMeta = user.user_metadata || {};
        const name = rawMeta.full_name || rawMeta.name || user.email || 'Pengguna';
        setUserName(name);
        setStatus('success');

        // Redirect ke landingpage atau simulator setelah 1.5 detik
        setTimeout(() => {
          router.push('/landingpage/simulator');
        }, 1500);

      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <h2 className="text-xl font-semibold text-slate-800">Menghubungkan Akun...</h2>
            <p className="text-sm text-slate-500">Mohon tunggu sebentar, kami sedang memverifikasi identitas kamu.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Berhasil Masuk!</h2>
            <p className="text-sm text-slate-600">
              Selamat datang kembali, <strong className="text-blue-600">{userName}</strong>! Mengalihkan ke Owly Assistant...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold text-rose-600">Gagal Masuk</h2>
            <p className="text-sm text-slate-500">Terjadi kendala saat memverifikasi sesi login kamu.</p>
            <button
              onClick={() => router.push('/landingpage')}
              className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
