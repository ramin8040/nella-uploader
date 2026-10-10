'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  ExternalLink,
  Music,
  Headphones,
  Clock,
  X,
  AlertTriangle,
  Radio,
  UploadCloud,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Track } from '@/lib/types';
import { formatDuration, formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default function MusicLibraryPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal State
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTracks = () => {
    setLoading(true);
    api.getAllTracksAdmin(search)
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load library:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTracks();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCopy = (slug: string, id: string) => {
    const fullUrl = `${window.location.origin}/music/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEdit = (track: Track) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditArtist(track.artist);
    setEditAlbum(track.album || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;
    setSavingEdit(true);

    try {
      const updated = await api.updateTrack(editingTrack.id, {
        title: editTitle,
        artist: editArtist,
        album: editAlbum,
      });

      setTracks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
      );
      setEditingTrack(null);
    } catch (err) {
      console.error('Failed to update track:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTrack) return;
    setDeleting(true);

    try {
      await api.deleteTrack(deletingTrack.id);
      setTracks((prev) => prev.filter((t) => t.id !== deletingTrack.id));
      setDeletingTrack(null);
    } catch (err) {
      console.error('Failed to delete track:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            کتابخانه موسیقی
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            آرشیو کامل قطعات، ویرایش عنوان، حذف و دسترسی به پیوندهای اشتراک‌گذاری
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام قطعه یا هنرمند..."
            className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-white border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-xs"
          />
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/80 shadow-card p-6 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400">
            در حال بارگذاری آرشیو...
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-16 text-center">
            <Music className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-600 mb-1">
              قطعه‌ای یافت نشد
            </p>
            <p className="text-xs text-gray-400">
              {search ? 'برای عبارت جستجو شده موردی پیدا نشد' : 'هنوز آهنگی بارگذاری نشده است'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold">
                  <th className="pb-3.5 pr-3">عنوان قطعه</th>
                  <th className="pb-3.5">هنرمند</th>
                  <th className="pb-3.5">آلبوم</th>
                  <th className="pb-3.5">مدت زمان</th>
                  <th className="pb-3.5">دفعات پخش</th>
                  <th className="pb-3.5">شناسه یکتا</th>
                  <th className="pb-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tracks.map((track) => (
                  <tr
                    key={track.id}
                    className="hover:bg-orange-50/30 transition-colors group"
                  >
                    <td className="py-4 pr-3 font-bold text-gray-900">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                        <span className="truncate max-w-xs">{track.title}</span>
                        {track.directUrl ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 border border-amber-300/60 w-fit">
                            <Radio className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
                            <span>استریم مستقیم</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 w-fit">
                            <UploadCloud className="w-2.5 h-2.5 text-gray-500" />
                            <span>فایل آپلودی</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 font-medium">
                      {track.artist}
                    </td>
                    <td className="py-4 text-gray-400">
                      {track.album || '—'}
                    </td>
                    <td className="py-4 text-gray-500 font-mono">
                      {formatDuration(track.duration)}
                    </td>
                    <td className="py-4 text-gray-700 font-bold font-mono">
                      {formatNumber(track.playCount)}
                    </td>
                    <td className="py-4 text-gray-400 font-mono text-[11px]" dir="ltr">
                      {track.slug}
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopy(track.slug, track.id)}
                          title="کپی پیوند استریم"
                          className={`p-2 rounded-xl transition-all ${
                            copiedId === track.id
                              ? 'bg-emerald-500 text-white'
                              : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                          }`}
                        >
                          {copiedId === track.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open Stream Page */}
                        <Link
                          href={`/music/${track.slug}`}
                          target="_blank"
                          title="مشاهده صفحه پخش"
                          className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEdit(track)}
                          title="ویرایش اطلاعات"
                          className="p-2 rounded-xl text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingTrack(track)}
                          title="حذف قطعه"
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">ویرایش قطعه</h3>
              <button
                onClick={() => setEditingTrack(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  عنوان قطعه
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  نام هنرمند
                </label>
                <input
                  type="text"
                  required
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  آلبوم (اختیاری)
                </label>
                <input
                  type="text"
                  value={editAlbum}
                  onChange={(e) => setEditAlbum(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {savingEdit ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">
              حذف قطعه موسیقی؟
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              آیا از حذف «{deletingTrack.title}» مطمئن هستید؟ فایل صوتی از فضای ابری نیز پاک خواهد شد.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingTrack(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {deleting ? 'در حال حذف...' : 'بله، حذف شود'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
