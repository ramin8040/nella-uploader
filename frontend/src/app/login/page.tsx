'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Music, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.login({ username, password, rememberMe });
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'نام کاربری یا رمز عبور اشتباه است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#f8f9fa] overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="ambient-bg">
        <div className="ambient-orb -top-20 -right-20 w-80 h-80 bg-orange-500 opacity-20" />
        <div className="ambient-orb -bottom-20 -left-20 w-96 h-96 bg-amber-500 opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 shadow-card border border-white/90">
          {/* Brand Icon & Heading */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Music className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              ورود به پنل مدیریت
            </h1>
            <p className="text-xs text-gray-500 mt-1.5 font-medium">
              مرکز پخش موسیقی نلا
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 mr-1">
                نام کاربری
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/70 border border-gray-200/80 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-left font-mono"
                  dir="ltr"
                />
                <User className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 mr-1">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/70 border border-gray-200/80 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-left font-mono"
                  dir="ltr"
                />
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-gray-300"
                />
                <span className="text-xs text-gray-600 font-medium">
                  مرا به خاطر بسپار
                </span>
              </label>
              <span className="text-[11px] text-gray-400">ورود امن مدیر</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>ورود به سامانه</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick hint for initial default login */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 font-mono" dir="ltr">
              Default: admin / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
