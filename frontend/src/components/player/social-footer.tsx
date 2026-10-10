'use client';

import React from 'react';
import { Instagram, Send, Phone, Globe } from 'lucide-react';
import { BrandSettings } from '@/lib/types';

interface SocialFooterProps {
  settings?: BrandSettings | null;
}

export const SocialFooter: React.FC<SocialFooterProps> = ({ settings }) => {
  const instagram = settings?.instagramUrl || 'https://instagram.com';
  const telegram = settings?.telegramUrl || 'https://t.me';
  const phone = settings?.phoneNumber || '+989120000000';
  const website = settings?.websiteUrl || 'https://example.com';

  const items = [
    {
      title: 'اینستاگرام',
      href: instagram,
      icon: Instagram,
      color: 'hover:text-pink-600 hover:bg-pink-50',
    },
    {
      title: 'تلگرام',
      href: telegram,
      icon: Send,
      color: 'hover:text-sky-500 hover:bg-sky-50',
    },
    {
      title: 'تماس تلفنی',
      href: `tel:${phone.replace(/\s+/g, '')}`,
      icon: Phone,
      color: 'hover:text-emerald-600 hover:bg-emerald-50',
    },
    {
      title: 'وب‌سایت',
      href: website,
      icon: Globe,
      color: 'hover:text-orange-600 hover:bg-orange-50',
    },
  ];

  return (
    <footer className="w-full flex items-center justify-center gap-3 pt-4 pb-2">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-xs">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={item.title}
              className={`p-2.5 rounded-full text-gray-500 transition-all duration-200 transform hover:scale-110 active:scale-95 ${item.color}`}
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}
      </div>
    </footer>
  );
};
