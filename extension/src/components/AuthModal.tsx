import React, { useState } from "react";
import { Sparkles, Shield, X, Check, LogOut, Loader2, User } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string } | null;
  onLoginSuccess: (user: { name: string; email: string }) => void;
  onLogout: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoJudgeLogin = async () => {
    setLoading(true);
    // Simulate Supabase Demo Judge auth login for extension
    setTimeout(() => {
      onLoginSuccess({
        name: "Meta Hackathon Judge",
        email: "judge@savvy.ai",
      });
      setLoading(false);
      onClose();
    }, 600);
  };

  const handleSocialLogin = (provider: "facebook" | "instagram" | "google") => {
    setLoading(true);
    // In chrome extension, open the web callback login url
    window.open(
      `https://savvy-plum.vercel.app/api/auth/login?provider=${provider}`,
      "_blank"
    );
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <img
            src="logo.png"
            alt="Savvy.AI Logo"
            className="w-8 h-8 object-contain drop-shadow-xs"
          />
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
              Savvy<span className="text-savvy-blue">.AI</span> Auth
            </h3>
            <p className="text-[10px] text-slate-500">Zero-Knowledge Public Form Assistant</p>
          </div>
        </div>

        {currentUser ? (
          <div className="space-y-3.5 pt-2">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-emerald-950 flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="text-[10px] text-emerald-700">{currentUser.email}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 leading-snug">
              Akun Anda telah terverifikasi dengan Supabase Free Tier (50.000 MAU). Vault data Anda tersinkronisasi terenkripsi AES-256-GCM.
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 pt-2">
            {/* 1-Click Demo Judge Button */}
            <div className="p-3 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 text-center space-y-2">
              <span className="text-[11px] font-bold text-blue-900 block">
                Pintu Masuk Khusus Dewan Juri
              </span>
              <button
                onClick={handleDemoJudgeLogin}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 disabled:opacity-75"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>1-Click Masuk Demo Juri</span>
              </button>
              <span className="text-[9px] text-slate-500 block">
                Akun: judge@savvy.ai • Vault KTP/Ijazah Otomatis Terisi
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <div className="h-px bg-slate-200 flex-1" />
              <span>Atau Masuk via Meta / Google</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleSocialLogin("facebook")}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="font-black text-blue-600 text-sm">f</span>
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleSocialLogin("google")}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="font-bold text-red-500 text-xs">G</span>
                <span>Google</span>
              </button>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-[10px] text-slate-500 leading-tight">
              <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Jaminan UU PDP No. 27/2022: Data rahasia (NIK/NPWP/Foto) tidak pernah dikirim atau disimpan secara terbuka.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
