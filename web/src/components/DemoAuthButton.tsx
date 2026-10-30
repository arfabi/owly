"use client";

import React, { useEffect, useState } from "react";
import { signInAsDemoJudge, signOutUser, getCurrentUserProfile } from "@/lib/supabaseClient";
import { Sparkles, Check, LogOut, Loader2 } from "lucide-react";

export function DemoAuthButton() {
  const [profile, setProfile] = useState<{ full_name: string; email: string; avatar_url: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUserProfile();
        if (user) {
          setProfile(user);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    }
    loadUser();
  }, []);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signInAsDemoJudge();
      const user = await getCurrentUserProfile();
      setProfile(user);
    } catch (err) {
      console.error("Demo login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setProfile(null);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (profile) {
    return (
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-full pl-1.5 pr-2.5 py-1 text-xs">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/30"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
            {profile.full_name?.charAt(0) || "J"}
          </div>
        )}
        <div className="flex flex-col text-left">
          <span className="font-semibold text-slate-800 leading-tight flex items-center gap-1">
            {profile.full_name}
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
          </span>
          <span className="text-[10px] text-slate-500 leading-tight">Demo Judge</span>
        </div>
        <button
          onClick={handleLogout}
          title="Keluar"
          className="ml-1 text-slate-400 hover:text-rose-600 p-1 rounded-full transition"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDemoLogin}
      disabled={loading}
      className="flex items-center gap-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs hover:shadow-sm transition-all active:scale-95 disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      )}
      <span>1-Click Demo Juri</span>
    </button>
  );
}
