'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Music, Play, Lock, Sparkles, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { BrandSettings } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const primaryColor = settings?.primaryColor || '#ff6b35';
  const logoUrl = settings?.brandLogoUrl || '/assets/logo.svg';

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-[#f8f9fa] overflow-hidden">
      {/* Soft Ambient Orbs */}
      <div className="ambient-bg">
        <div
          className="ambient-orb -top-24 -left-20 w-96 h-96"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="ambient-orb -bottom-24 -right-20 w-96 h-96"
          style={{ backgroundColor: settings?.secondaryColor || '#ff8c42' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 shadow-card border border-white/90 space-y-6 animate-float-gentle">
          {/* Brand Logo */}
          <div
            className="w-24 h-24 mx-auto rounded-3xl bg-white shadow-md p-3 flex items-center justify-center overflow-hidden border border-gray-100"
            style={{
              boxShadow: `0 12px 28px -8px ${primaryColor}40`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {settings?.brandName || 'مرکز پخش موسیقی نلا'}
            </h1>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              پلتفرم اختصاصی استریم باکیفیت و ایمن قطعات صوتی
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/50 text-xs text-orange-800 leading-relaxed text-right">
            <span className="font-bold block mb-1">راهنمای دسترسی کاربران:</span>
            مخاطبان گرامی تنها از طریق پیوندهای اختصاصی ارسال‌شده (مانند <code className="font-mono text-orange-900" dir="ltr">/music/f8Ka2Lp</code>) به پخش قطعات دسترسی دارند.
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ورود مدیر به سامانه</span>
            </Link>

            <Link
              href="/music/f8Ka2Lp"
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white/80 hover:bg-white text-gray-700 font-bold text-xs border border-gray-200 shadow-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 text-orange-500 fill-current" />
              <span>مشاهده نمونه پخش‌کننده</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
