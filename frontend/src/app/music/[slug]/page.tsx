'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Share2, Music2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Track, BrandSettings } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { ProgressRing } from '@/components/player/progress-ring';
import { Waveform, WaveformHandle } from '@/components/player/waveform';
import { PlayerControls } from '@/components/player/player-controls';
import { ShareModal } from '@/components/player/share-modal';
import { SocialFooter } from '@/components/player/social-footer';

export default function MusicStreamingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one'>('off');
  const [isMuted, setIsMuted] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const waveformRef = useRef<WaveformHandle>(null);

  // Load Track and Settings (Direct single-track without external playlist)
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);

    Promise.all([
      api.getTrackBySlug(slug),
      api.getSettings(),
    ])
      .then(([trackData, settingsData]) => {
        if (!isMounted) return;
        setTrack(trackData);
        setDuration(trackData.duration || 0);
        setLikeCount(trackData.likeCount || 0);
        setSettings(settingsData);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error loading music page:', err);
        setError(err.message || 'خطا در بارگذاری قطعه موسیقی');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const primaryColor = settings?.primaryColor || '#e08d3c';
  const secondaryColor = settings?.secondaryColor || '#ffd7ab';
  const logoUrl = settings?.brandLogoUrl || '/assets/logo.svg';

  // Compute progress percentage (0 - 100)
  const progressPercent = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  // Audio Stream URL
  const audioStreamUrl = useMemo(() => {
    if (!slug) return '';
    return api.getStreamUrl(slug);
  }, [slug]);

  // Player Handlers
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleTimeUpdate = (curr: number, dur: number) => {
    setCurrentTime(curr);
    if (dur && dur > 0 && Math.abs(dur - duration) > 1) {
      setDuration(dur);
    }
  };

  const handleFinish = () => {
    if (repeatMode === 'one') {
      waveformRef.current?.restart();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSkipBackward = () => {
    waveformRef.current?.skip(-10);
  };

  const handleSkipForward = () => {
    waveformRef.current?.skip(10);
  };

  const handleToggleMute = () => {
    if (waveformRef.current) {
      const nextMutedState = waveformRef.current.toggleMute();
      setIsMuted(nextMutedState);
    }
  };

  const handleToggleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'one' : 'off'));
  };

  const handleLike = async () => {
    if (!slug) return;
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      try {
        await api.likeTrack(slug);
      } catch (e) {
        console.error('Like error:', e);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-3 border-orange-200 border-t-orange-500 animate-spin"
            style={{ borderTopColor: primaryColor }}
          />
          <p className="text-sm font-medium text-gray-500 animate-pulse">
            در حال بارگذاری نوای دلنشین...
          </p>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="glass-card max-w-sm w-full p-8 rounded-3xl text-center shadow-card">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <Music2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">قطعه یافت نشد</h2>
          <p className="text-xs text-gray-500 mb-6">
            ممکن است پیوند تغییر کرده یا توسط مدیر حذف شده باشد.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-between py-6 px-4 overflow-hidden">
      {/* Soft ambient gradient background */}
      <div className="ambient-bg">
        <div
          className="ambient-orb -top-24 -left-20 w-96 h-96"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="ambient-orb top-1/2 -right-24 w-[32rem] h-[32rem]"
          style={{ backgroundColor: secondaryColor }}
        />
        <div
          className="ambient-orb -bottom-24 left-1/3 w-80 h-80"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Centered Content Container */}
      <div className="relative z-10 w-full max-w-[390px] mx-auto my-auto flex flex-col items-center">
        {/* Main Floating Glassmorphic Card */}
        <section
          aria-label="پخش‌کننده موسیقی"
          className="glass-card w-full rounded-[2.5rem] p-6 sm:p-7 shadow-card border border-white/90 animate-float-gentle transition-shadow hover:shadow-glassHover duration-500"
        >
          {/* Top Brand Logo Container with Rounded Square Progress Frame */}
          <div className="flex flex-col items-center justify-center mb-5">
            <ProgressRing
              progress={progressPercent}
              size={142}
              strokeWidth={4}
              cornerRadius={28}
              primaryColor={primaryColor}
            >
              {/* Fixed Brand Logo inside rounded square */}
              <div
                className="w-[114px] h-[114px] rounded-[1.45rem] bg-white/95 shadow-md flex items-center justify-center overflow-hidden p-3.5 border border-gray-100"
                style={{
                  boxShadow: `0 12px 28px -8px ${primaryColor}35`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={settings?.brandName || 'Brand Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
            </ProgressRing>

            {/* Time Indicator below Logo */}
            <div className="mt-3 px-3 py-0.5 rounded-full bg-gray-100/70 border border-gray-200/40 text-[11px] font-medium text-gray-500 tracking-wider font-mono">
              {formatDuration(currentTime)}
            </div>
          </div>

          {/* Track Info Header: Title, Artist, Heart (Left) & Share (Right) */}
          <div className="flex items-center justify-between gap-3 mb-4 px-1">
            {/* Heart / Like Icon */}
            <button
              onClick={handleLike}
              title="علاقه‌مندی"
              className={`p-2 rounded-full transition-all duration-200 active:scale-75 ${
                isLiked
                  ? 'text-rose-500 bg-rose-50/80 shadow-xs'
                  : 'text-gray-400 hover:text-rose-500 hover:bg-gray-100/70'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-transform ${
                  isLiked ? 'fill-current scale-110' : ''
                }`}
              />
            </button>

            {/* Title & Artist */}
            <div className="flex flex-col items-center text-center flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight truncate max-w-full">
                {track.title}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate max-w-full mt-0.5">
                {track.artist}
              </p>
            </div>

            {/* Share Icon */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              title="اشتراک‌گذاری"
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100/70 transition-all duration-200 active:scale-90"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* WaveSurfer Minimal Audio Waveform */}
          <div className="mb-4">
            <Waveform
              ref={waveformRef}
              audioUrl={audioStreamUrl}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onFinish={handleFinish}
              primaryColor={primaryColor}
              peaks={track.peaks}
              initialDuration={track.duration}
            />

            {/* Duration bounds indicator */}
            <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 font-mono">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration || track.duration)}</span>
            </div>
          </div>

          {/* Single-Track Player Controls (Repeat, Rewind 10s, Play/Pause, Forward 10s, Mute) */}
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSkipBackward={handleSkipBackward}
            onSkipForward={handleSkipForward}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            repeatMode={repeatMode}
            onToggleRepeat={handleToggleRepeat}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </section>

        {/* Bottom Social Links Footer */}
        <SocialFooter settings={settings} />
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trackTitle={track.title}
        artistName={track.artist}
        shareUrl={`/music/${track.slug}`}
      />
    </main>
  );
}
