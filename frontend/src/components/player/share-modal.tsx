'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Send, MessageCircle, Twitter, Instagram } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackTitle: string;
  artistName: string;
  shareUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  trackTitle,
  artistName,
  shareUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullShareUrl = typeof window !== 'undefined'
    ? (shareUrl.startsWith('http') ? shareUrl : `${window.location.origin}${shareUrl}`)
    : shareUrl;

  const shareText = `شنیدن قطعه «${trackTitle}» اثر «${artistName}»`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareOptions = [
    {
      name: 'تلگرام',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-sky-500',
      action: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(fullShareUrl)}&text=${encodeURIComponent(shareText)}`,
          '_blank',
        );
      },
    },
    {
      name: 'واتس‌اپ',
      icon: MessageCircle,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      textColor: 'text-emerald-500',
      action: () => {
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${fullShareUrl}`)}`,
          '_blank',
        );
      },
    },
    {
      name: 'توییتر / X',
      icon: Twitter,
      color: 'bg-gray-800 hover:bg-black',
      textColor: 'text-gray-800',
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullShareUrl)}&text=${encodeURIComponent(shareText)}`,
          '_blank',
        );
      },
    },
    {
      name: 'اینستاگرام',
      icon: Instagram,
      color: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600',
      textColor: 'text-pink-600',
      action: async () => {
        await handleCopy();
        window.open('https://instagram.com', '_blank');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-xl p-6 shadow-2xl border border-white/80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">اشتراک‌گذاری قطعه</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Link Field */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            پیوند اختصاصی قطعه
          </label>
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-gray-50 border border-gray-200/70">
            <input
              type="text"
              readOnly
              value={fullShareUrl}
              className="w-full bg-transparent text-xs text-gray-700 outline-none select-all font-mono px-2"
              dir="ltr"
            />
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-4 gap-3 text-center">
          {shareOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.name}
                onClick={opt.action}
                className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${opt.color} text-white flex items-center justify-center shadow-md transform transition-transform group-hover:scale-110 active:scale-95`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-gray-600">
                  {opt.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
