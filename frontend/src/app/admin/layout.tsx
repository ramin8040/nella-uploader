'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  Music,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminUser, BrandSettings } from '@/lib/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.getMe(), api.getSettings()])
      .then(([authRes, settingsRes]) => {
        if (!isMounted) return;
        setAdmin(authRes.admin);
        setSettings(settingsRes);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        router.push('/login');
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const navItems = [
    {
      title: 'داشبورد',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      title: 'بارگذاری موزیک',
      href: '/admin/upload',
      icon: UploadCloud,
      active: pathname === '/admin/upload',
    },
    {
      title: 'کتابخانه موزیک',
      href: '/admin/library',
      icon: Music,
      active: pathname === '/admin/library',
    },
    {
      title: 'تنظیمات و امنیت',
      href: '/admin/settings',
      icon: Settings,
      active: pathname === '/admin/settings',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-500">
            بررسی دسترسی مدیریت...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex flex-col md:flex-row text-gray-800">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings?.brandLogoUrl || '/assets/logo.svg'}
            alt="Logo"
            className="w-8 h-8 rounded-xl object-contain bg-orange-50 p-1"
          />
          <span className="font-extrabold text-sm text-gray-800">
            {settings?.brandName || 'پنل مدیریت'}
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Modern Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-white/95 md:bg-white/80 backdrop-blur-xl border-l border-gray-200/70 z-40 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Logo & Title */}
          <div className="p-6 border-b border-gray-100/90 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings?.brandLogoUrl || '/assets/logo.svg'}
              alt="Logo"
              className="w-10 h-10 rounded-2xl object-contain bg-orange-500/10 p-1.5 border border-orange-500/20"
            />
            <div className="overflow-hidden">
              <h2 className="font-black text-sm text-gray-900 truncate">
                {settings?.brandName || 'مرکز پخش نلا'}
              </h2>
              <span className="text-[11px] text-gray-400 font-medium">
                پنل مدیریت یکپارچه
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all duration-200 ${
                    item.active
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-gray-100/90">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50 border border-gray-200/60 mb-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-gray-800 truncate">
                {admin?.name || 'مدیر سیستم'}
              </p>
              <p className="text-[10px] text-gray-400 truncate font-mono">
                @{admin?.username}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
