'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Instagram,
  Send,
  Phone,
  Globe,
  Palette,
  Image as ImageIcon,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { BrandSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [brandName, setBrandName] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#ffd7ab');
  const [secondaryColor, setSecondaryColor] = useState('#e08d3c');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Password Change Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getSettings()
      .then((data) => {
        setSettings(data);
        setBrandName(data.brandName || '');
        setBrandLogoUrl(data.brandLogoUrl || '/assets/logo.svg');
        setPrimaryColor(data.primaryColor || '#ff6b35');
        setSecondaryColor(data.secondaryColor || '#ff8c42');
        setInstagramUrl(data.instagramUrl || '');
        setTelegramUrl(data.telegramUrl || '');
        setPhoneNumber(data.phoneNumber || '');
        setWebsiteUrl(data.websiteUrl || '');
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingLogo(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append('logo', file);

      try {
        const res = await api.uploadBrandLogo(formData);
        setBrandLogoUrl(res.brandLogoUrl);
        setSuccessMsg('لوگوی برند با موفقیت به‌روزرسانی شد');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err: any) {
        setErrorMsg(err.message || 'خطا در بارگذاری لوگو');
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await api.updateSettings({
        brandName,
        brandLogoUrl,
        primaryColor,
        secondaryColor,
        instagramUrl,
        telegramUrl,
        phoneNumber,
        websiteUrl,
      });

      setSettings(updated);
      setSuccessMsg('تنظیمات برند با موفقیت ذخیره شد');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('لطفاً رمز عبور فعلی را وارد کنید');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('رمز عبور جدید با تکرار آن مطابقت ندارد');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess(res.message || 'رمز عبور با موفقیت به‌روزرسانی شد');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'خطا در تغییر رمز عبور');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-gray-400">
        در حال دریافت تنظیمات...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          تنظیمات برند و هویت بصری
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          لوگوی عمومی، رنگ‌های اصلی پخش‌کننده و پیوندهای شبکه‌های اجتماعی برای تمامی آهنگ‌ها
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Logo & Name */}
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/80 shadow-card space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <ImageIcon className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-gray-800">لوگوی ثابت و هویت برند</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Logo Preview */}
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-gray-200/80 p-2.5 flex items-center justify-center overflow-hidden shadow-sm"
                style={{ borderColor: primaryColor }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brandLogoUrl || '/assets/logo.svg'}
                  alt="Brand Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>

            <div className="space-y-2 flex-1">
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingLogo ? 'در حال آپلود...' : 'تغییر لوگوی برند (PNG, SVG, WEBP)'}</span>
              </button>
              <p className="text-[11px] text-gray-400">
                این لوگو به صورت سراسری برای تمامی قطعات پخش‌کننده به جای کاور آلبوم نمایش داده می‌شود.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              نام برند / مرکز موسیقی
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="مرکز پخش موسیقی نلا"
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Colors Section */}
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/80 shadow-card space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Palette className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-gray-800">رنگ‌های تم و گرادیانت استریم</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Primary Color */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                رنگ اصلی (Primary Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 font-mono outline-none focus:border-orange-500"
                  dir="ltr"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                برای دکمه اصلی پخش، حلقه پیشرفت و موج صوتی
              </p>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                رنگ ثانویه (Secondary Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 font-mono outline-none focus:border-orange-500"
                  dir="ltr"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                برای گرادیانت پس‌زمینه و هماهنگی بصری
              </p>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">پیش‌نمایش ترکیب گرادیانت:</span>
            <div
              className="w-32 h-8 rounded-xl shadow-xs"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            />
          </div>
        </div>

        {/* Social Links & Contact */}
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/80 shadow-card space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Globe className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-gray-800">پیوندهای شبکه‌های اجتماعی و تماس</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Instagram */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                پیوند اینستاگرام
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500 font-mono"
                  dir="ltr"
                />
                <Instagram className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                پیوند تلگرام
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/username"
                  className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500 font-mono"
                  dir="ltr"
                />
                <Send className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                شماره تماس (پشتیبانی / رزرو)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500"
                />
                <Phone className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                پیوند وب‌سایت
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500 font-mono"
                  dir="ltr"
                />
                <Globe className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-98 transition-all disabled:opacity-50"
          >
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تمامی تغییرات'}
          </button>
        </div>
      </form>

      {/* Password Change Section */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/80 shadow-card space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <KeyRound className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-bold text-gray-800">تغییر رمز عبور مدیر</h2>
        </div>

        <p className="text-xs text-gray-500">
          جهت ارتقای امنیت حساب کاربری، می‌توانید رمز عبور ورود به پنل مدیریت را تغییر دهید.
        </p>

        {passwordSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                رمز عبور فعلی
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500 focus:bg-white font-mono transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500 focus:bg-white font-mono transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                تکرار رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تکرار رمز جدید"
                  className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-orange-500 focus:bg-white font-mono transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>پس از تغییر، برای ورودهای بعدی باید از رمز عبور جدید استفاده کنید.</span>
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="px-6 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all active:scale-98 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{passwordSaving ? 'در حال ثبت رمز جدید...' : 'به‌روزرسانی رمز عبور'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
