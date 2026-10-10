export interface Track {
  id: string;
  slug: string;
  title: string;
  artist: string;
  album?: string | null;
  duration: number; // seconds
  bitrate?: number | null;
  fileSize: number; // bytes
  mimeType?: string;
  directUrl?: string | null;
  playCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt?: string;
  peaks?: number[];
}

export interface NextUpTrack {
  id: string;
  slug: string;
  title: string;
  artist: string;
  duration: number;
  playCount: number;
}

export interface BrandSettings {
  id: string;
  brandName: string;
  brandLogoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  instagramUrl?: string | null;
  telegramUrl?: string | null;
  phoneNumber?: string | null;
  websiteUrl?: string | null;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}
