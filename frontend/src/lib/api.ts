import { BrandSettings, Track, NextUpTrack, AdminUser } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isServer = typeof window === 'undefined';
  const fullUrl = url.startsWith('http')
    ? url
    : isServer
    ? `${BASE_URL || 'http://localhost:4000'}${url}`
    : url;

  const res = await fetch(fullUrl, {
    ...options,
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      ...(!options.body || !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || 'خطایی در ارتباط با سرور رخ داد';
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(' - ') : errorMsg);
  }

  return data as T;
}

export const api = {
  // Public
  async getSettings(): Promise<BrandSettings> {
    const res = await fetcher<{ success: boolean; settings: BrandSettings }>('/api/settings');
    return res.settings;
  },

  async getTrackBySlug(slug: string): Promise<Track> {
    const res = await fetcher<{ success: boolean; track: Track }>(`/api/music/${slug}`);
    return res.track;
  },

  async getNextUpTracks(slug: string, limit = 5): Promise<NextUpTrack[]> {
    const res = await fetcher<{ success: boolean; tracks: NextUpTrack[] }>(
      `/api/music/${slug}/next-up?limit=${limit}`,
    );
    return res.tracks;
  },

  async likeTrack(slug: string): Promise<{ id: string; slug: string; likeCount: number }> {
    const res = await fetcher<{ success: boolean; track: any }>(`/api/music/${slug}/like`, {
      method: 'POST',
    });
    return res.track;
  },

  getStreamUrl(slugOrId: string): string {
    return `/stream/${slugOrId}`;
  },

  // Auth
  async login(payload: { username: string; password: string; rememberMe?: boolean }) {
    return fetcher<{ success: boolean; admin: AdminUser; token?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout() {
    return fetcher<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<{ success: boolean; admin: AdminUser }> {
    return fetcher<{ success: boolean; admin: AdminUser }>('/api/auth/me');
  },

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    return fetcher<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin Music
  async getAllTracksAdmin(search?: string): Promise<Track[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetcher<{ success: boolean; tracks: Track[] }>(`/api/music/admin/all${query}`);
    return res.tracks;
  },

  async addDirectTrack(data: {
    directUrl: string;
    title: string;
    artist: string;
    album?: string;
    duration?: number;
  }): Promise<Track> {
    const res = await fetcher<{ success: boolean; track: Track }>('/api/music/direct', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.track;
  },

  async probeUrl(url: string): Promise<{
    url: string;
    fileSize: number;
    mimeType: string;
    title: string;
    artist: string;
    estimatedDuration: number;
  }> {
    const res = await fetcher<{ success: boolean; result: any }>('/api/music/probe-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    return res.result;
  },

  async uploadTrack(formData: FormData): Promise<Track> {
    const res = await fetcher<{ success: boolean; track: Track }>('/api/music/upload', {
      method: 'POST',
      body: formData,
    });
    return res.track;
  },

  async importDrive(data: { driveUrl: string; customTitle?: string; customArtist?: string }): Promise<Track> {
    const res = await fetcher<{ success: boolean; track: Track }>('/api/music/import-drive', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.track;
  },

  async updateTrack(id: string, data: { title?: string; artist?: string; album?: string }): Promise<Track> {
    const res = await fetcher<{ success: boolean; track: Track }>(`/api/music/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.track;
  },

  async deleteTrack(id: string): Promise<void> {
    await fetcher(`/api/music/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin Settings
  async updateSettings(data: Partial<BrandSettings>): Promise<BrandSettings> {
    const res = await fetcher<{ success: boolean; settings: BrandSettings }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.settings;
  },

  async uploadBrandLogo(formData: FormData): Promise<{ brandLogoUrl: string; settings: BrandSettings }> {
    return fetcher<{ success: boolean; brandLogoUrl: string; settings: BrandSettings }>(
      '/api/settings/logo',
      {
        method: 'POST',
        body: formData,
      },
    );
  },
};

