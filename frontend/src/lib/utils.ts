import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(value: string | number): string {
  if (value === null || value === undefined) return '';
  return value
    .toString()
    .replace(/[0-9]/g, (w) => PERSIAN_DIGITS[+w] || w);
}

export function formatDuration(seconds: number, persian = true): string {
  if (isNaN(seconds) || seconds < 0) return persian ? '۰۰:۰۰' : '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return persian ? toPersianDigits(formatted) : formatted;
}

export function formatBytes(bytes: number, persian = true): string {
  if (bytes === 0) return persian ? '۰ بایت' : '0 Bytes';
  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  const formattedVal = persian ? toPersianDigits(val) : val.toString();
  return `${formattedVal} ${sizes[i]}`;
}

export function formatNumber(num: number, persian = true): string {
  if (isNaN(num)) return persian ? '۰' : '0';
  const formatted = num.toLocaleString('en-US');
  return persian ? toPersianDigits(formatted) : formatted;
}
