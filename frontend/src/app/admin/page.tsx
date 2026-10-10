'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Music,
  Play,
  Heart,
  UploadCloud,
  ExternalLink,
  Settings,
  Headphones,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Track } from '@/lib/types';
import { formatNumber, formatDuration } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllTracksAdmin()
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load tracks:', err);
        setLoading(false);
      });
  }, []);

  const totalTracks = tracks.length;
  const totalPlays = tracks.reduce((acc, t) => acc + (t.playCount || 0), 0);
  const totalLikes = tracks.reduce((acc, t) => acc + (t.likeCount || 0), 0);

  const stats = [
    {
      title: 'کل قطعات فعال',
      value: formatNumber(totalTracks),
      icon: Music,
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'مجموع دفعات پخش',
      value: formatNumber(totalPlays),
      icon: Headphones,
      gradient: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'مجموع پسندها (لایک)',
      value: formatNumber(totalLikes),
      icon: Heart,
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[2rem] bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-xs">
            داشبورد مدیریت یکپارچه
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            مرکز پخش موسیقی نلا
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
            مدیریت کامل بارگذاری قطعات صوتی، ذخیره‌سازی ابری Cloudflare R2، و استریم امن با نشانی‌های یکتا
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/upload"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>بارگذاری موزیک جدید</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="p-6 rounded-[2rem] bg-white/90 backdrop-blur-md border border-white/80 shadow-card flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">{s.title}</p>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-mono">
                  {s.value}
                </h3>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${s.bgColor} ${s.textColor} flex items-center justify-center shadow-xs`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Uploads Table */}
      <div className="rounded-[2rem] bg-white/90 backdrop-blur-md border border-white/80 shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-gray-900">آخرین قطعات بارگذاری‌شده</h2>
          </div>
          <Link
            href="/admin/library"
            className="text-xs font-bold text-orange-600 hover:underline"
          >
            مشاهده همه آرشیو
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            در حال دریافت اطلاعات...
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-12 text-center">
            <Music className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-xs text-gray-500 mb-4">هنوز قطعه‌ای بارگذاری نشده است</p>
            <Link
              href="/admin/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
            >
              <UploadCloud className="w-4 h-4" />
              <span>بارگذاری اولین قطعه</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold">
                  <th className="pb-3 pr-2">عنوان قطعه</th>
                  <th className="pb-3">هنرمند</th>
                  <th className="pb-3">مدت زمان</th>
                  <th className="pb-3">دفعات پخش</th>
                  <th className="pb-3 text-left pl-2">پیوند اختصاصی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tracks.slice(0, 5).map((track) => (
                  <tr key={track.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 pr-2 font-bold text-gray-800">
                      {track.title}
                    </td>
                    <td className="py-3.5 text-gray-500 font-medium">
                      {track.artist}
                    </td>
                    <td className="py-3.5 text-gray-500 font-mono">
                      {formatDuration(track.duration)}
                    </td>
                    <td className="py-3.5 text-gray-600 font-bold font-mono">
                      {formatNumber(track.playCount)}
                    </td>
                    <td className="py-3.5 text-left pl-2">
                      <Link
                        href={`/music/${track.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold"
                      >
                        <span className="font-mono text-[11px]" dir="ltr">/music/{track.slug}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
