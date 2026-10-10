'use client';

import React, { useState, useRef } from 'react';
import {
  Link as LinkIcon,
  UploadCloud,
  FileAudio,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertCircle,
  HardDrive,
  Sparkles,
  Search,
  Music,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Track } from '@/lib/types';
import { formatBytes, formatDuration } from '@/lib/utils';
import Link from 'next/link';

export default function UploadMusicPage() {
  const [activeTab, setActiveTab] = useState<'direct' | 'drive' | 'file'>('direct');

  // Direct Link State (Primary)
  const [directUrl, setDirectUrl] = useState('');
  const [directTitle, setDirectTitle] = useState('');
  const [directArtist, setDirectArtist] = useState('');
  const [directAlbum, setDirectAlbum] = useState('');
  const [directDuration, setDirectDuration] = useState<number | undefined>(undefined);
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<any | null>(null);

  // File Upload State (Alternative)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileTitle, setFileTitle] = useState('');
  const [fileArtist, setFileArtist] = useState('');
  const [fileAlbum, setFileAlbum] = useState('');

  // Google Drive State (Alternative)
  const [driveUrl, setDriveUrl] = useState('');
  const [driveTitle, setDriveTitle] = useState('');
  const [driveArtist, setDriveArtist] = useState('');

  // Action State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTrack, setCreatedTrack] = useState<Track | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-probe direct URL
  const handleProbeUrl = async () => {
    if (!directUrl.trim()) return;
    setProbing(true);
    setError(null);

    try {
      const result = await api.probeUrl(directUrl.trim());
      setProbeResult(result);
      if (!directTitle && result.title) setDirectTitle(result.title);
      if (!directArtist && result.artist) setDirectArtist(result.artist);
      if (!directDuration && result.estimatedDuration) setDirectDuration(result.estimatedDuration);
    } catch (err: any) {
      console.warn('Probe error:', err);
    } finally {
      setProbing(false);
    }
  };

  const handleAddDirectTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) {
      setError('لطفاً لینک مستقیم آهنگ را وارد کنید');
      return;
    }
    if (!directTitle.trim()) {
      setError('لطفاً عنوان آهنگ را وارد کنید');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const track = await api.addDirectTrack({
        directUrl: directUrl.trim(),
        title: directTitle.trim(),
        artist: (directArtist || 'هنرمند ناشناس').trim(),
        album: directAlbum.trim() || undefined,
        duration: directDuration,
      });
      setCreatedTrack(track);
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت لینک مستقیم آهنگ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('لطفاً یک فایل صوتی انتخاب کنید');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (fileTitle) formData.append('title', fileTitle);
    if (fileArtist) formData.append('artist', fileArtist);
    if (fileAlbum) formData.append('album', fileAlbum);

    try {
      const track = await api.uploadTrack(formData);
      setCreatedTrack(track);
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری فایل صوتی');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl) {
      setError('لطفاً پیوند گوگل درایو را وارد کنید');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const track = await api.importDrive({
        driveUrl,
        customTitle: driveTitle || undefined,
        customArtist: driveArtist || undefined,
      });
      setCreatedTrack(track);
    } catch (err: any) {
      setError(err.message || 'خطا در درون‌ریزی فایل از گوگل درایو');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdTrack) return;
    const fullUrl = `${window.location.origin}/music/${createdTrack.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetForm = () => {
    setCreatedTrack(null);
    setDirectUrl('');
    setDirectTitle('');
    setDirectArtist('');
    setDirectAlbum('');
    setDirectDuration(undefined);
    setProbeResult(null);
    setSelectedFile(null);
    setDriveUrl('');
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          ثبت قطعه موسیقی (استریم از لینک مستقیم)
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          به جای آپلود مستقیم فایل سنگین، لینک مستقیم موزیک را قرار دهید تا سرور آن را به شکل امن و با بافر پیشرفته استریم کند.
        </p>
      </div>

      {createdTrack ? (
        /* Success Screen */
        <div className="p-8 rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/80 shadow-card text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900">
              قطعه با موفقیت ثبت شد و آماده استریم است!
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              نشانی اصلی آهنگ برای مخاطبان کاملاً مخفی و امن نگه داشته می‌شود.
            </p>
          </div>

          {/* Track Summary Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/50 max-w-md mx-auto text-right space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">{createdTrack.title}</span>
              <span className="text-[11px] text-gray-500 font-mono">
                {formatDuration(createdTrack.duration)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>هنرمند: {createdTrack.artist}</span>
              <span className="text-[11px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                استریم مستقیم
              </span>
            </div>
          </div>

          {/* Share Link Preview */}
          <div className="max-w-md mx-auto">
            <label className="block text-xs font-bold text-gray-700 mb-2 text-right">
              نشانی استریم اختصاصی:
            </label>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-amber-200">
              <input
                type="text"
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/music/${createdTrack.slug}`}
                className="w-full bg-transparent text-xs text-gray-800 outline-none select-all font-mono px-2"
                dir="ltr"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e08d3c] hover:bg-[#c96515] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'کپی شد' : 'کپی'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href={`/music/${createdTrack.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>مشاهده صفحه پخش</span>
            </Link>

            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
            >
              افزودن قطعه دیگر
            </button>
          </div>
        </div>
      ) : (
        /* Upload Card with Tabs */
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/80 shadow-card">
          {/* Tab Selector */}
          <div className="flex p-1 bg-amber-50/70 border border-amber-200/50 rounded-2xl max-w-md mx-auto mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'direct'
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              استریم از لینک مستقیم
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drive')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'drive'
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              درون‌ریزی از درایو
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'file'
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              آپلود فایل صوتی
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'direct' ? (
            /* Primary Mode: Direct Link Form */
            <form onSubmit={handleAddDirectTrack} className="space-y-6">
              {/* Direct URL Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  لینک مستقیم فایل صوتی (Direct Audio Link)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      required
                      value={directUrl}
                      onChange={(e) => setDirectUrl(e.target.value)}
                      onBlur={handleProbeUrl}
                      placeholder="https://example.com/audio/song.mp3"
                      className="w-full px-4 py-3 pr-10 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c] focus:bg-white transition-all font-mono"
                      dir="ltr"
                    />
                    <LinkIcon className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleProbeUrl}
                    disabled={probing || !directUrl}
                    className="px-4 py-3 rounded-2xl bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {probing ? (
                      <div className="w-3.5 h-3.5 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span>بررسی لینک</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  لینک مستقیم فایل صوتی با پسوند mp3، wav، flac، aac. سرور به صورت خودکار اندازه و اطلاعات را بررسی می‌کند.
                </p>
              </div>

              {/* Detected info badge */}
              {probeResult && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs flex items-center justify-between">
                  <span className="text-gray-600">
                    نوع فایل: <b className="font-mono">{probeResult.mimeType}</b>
                  </span>
                  {probeResult.fileSize > 0 && (
                    <span className="text-gray-600 font-mono">
                      حجم: {formatBytes(probeResult.fileSize)}
                    </span>
                  )}
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    لینک در دسترس است
                  </span>
                </div>
              )}

              {/* Title & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    عنوان قطعه
                  </label>
                  <input
                    type="text"
                    required
                    value={directTitle}
                    onChange={(e) => setDirectTitle(e.target.value)}
                    placeholder="مثال: باران بهاری"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نام هنرمند
                  </label>
                  <input
                    type="text"
                    required
                    value={directArtist}
                    onChange={(e) => setDirectArtist(e.target.value)}
                    placeholder="مثال: محمدرضا شجریان"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Album & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    آلبوم (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={directAlbum}
                    onChange={(e) => setDirectAlbum(e.target.value)}
                    placeholder="تک آهنگ"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    مدت زمان تخمینی به ثانیه (اختیاری)
                  </label>
                  <input
                    type="number"
                    value={directDuration || ''}
                    onChange={(e) => setDirectDuration(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="مثال: 210"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c] focus:bg-white transition-all font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !directUrl.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e08d3c] to-[#ffd7ab] hover:opacity-95 text-gray-900 font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin" />
                ) : (
                  <>
                    <Music className="w-4 h-4 text-gray-900" />
                    <span>ثبت و ایجاد استریم اختصاصی</span>
                  </>
                )}
              </button>
            </form>
          ) : activeTab === 'drive' ? (
            /* Google Drive Import Form */
            <form onSubmit={handleImportDrive} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  پیوند اشتراک‌گذاری گوگل درایو (Google Drive Link)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c] focus:bg-white transition-all font-mono"
                    dir="ltr"
                  />
                  <LinkIcon className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  توجه: دسترسی پیوند باید روی «Anyone with the link» باشد.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    عنوان قطعه (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={driveTitle}
                    onChange={(e) => setDriveTitle(e.target.value)}
                    placeholder="در صورت خالی بودن خودکار تعیین می‌شود"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نام هنرمند (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={driveArtist}
                    onChange={(e) => setDriveArtist(e.target.value)}
                    placeholder="در صورت خالی بودن خودکار تعیین می‌شود"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !driveUrl}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e08d3c] to-[#ffd7ab] text-gray-900 font-extrabold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin" />
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    <span>درون‌ریزی از درایو</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* File Upload Form */
            <form onSubmit={handleUploadFile} className="space-y-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? 'border-amber-500 bg-amber-50/50 scale-[0.99]'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-gray-200 hover:border-amber-400 bg-gray-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mp3,audio/wav,audio/flac,audio/aac,audio/m4a,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <FileAudio className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm text-gray-800">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {formatBytes(selectedFile.size)}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        فایل صوتی را به اینجا بکشید یا برای انتخاب کلیک کنید
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        فرمت‌های MP3, WAV, FLAC, AAC
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    عنوان قطعه
                  </label>
                  <input
                    type="text"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    placeholder="اختیاری (خودکار استخراج می‌شود)"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    نام هنرمند
                  </label>
                  <input
                    type="text"
                    value={fileArtist}
                    onChange={(e) => setFileArtist(e.target.value)}
                    placeholder="اختیاری"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#e08d3c]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedFile}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e08d3c] to-[#ffd7ab] text-gray-900 font-extrabold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>آپلود فایل صوتی</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
