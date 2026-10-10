'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import WaveSurfer from 'wavesurfer.js';

export interface WaveformHandle {
  skip: (seconds: number) => void;
  restart: () => void;
  toggleMute: () => boolean;
  isMuted: () => boolean;
}

interface WaveformProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onFinish?: () => void;
  primaryColor?: string;
  peaks?: number[];
  initialDuration?: number;
}

export const Waveform = forwardRef<WaveformHandle, WaveformProps>(({
  audioUrl,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  onFinish,
  primaryColor = '#e08d3c',
  peaks,
  initialDuration,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useImperativeHandle(ref, () => ({
    skip: (seconds: number) => {
      const ws = wavesurferRef.current;
      if (!ws) return;
      try {
        const cur = ws.getCurrentTime();
        const dur = ws.getDuration() || initialDuration || 0;
        const target = Math.max(0, Math.min(dur, cur + seconds));
        ws.setTime(target);
      } catch (err) {
        console.error('Error skipping:', err);
      }
    },
    restart: () => {
      const ws = wavesurferRef.current;
      if (!ws) return;
      try {
        ws.setTime(0);
      } catch (err) {
        console.error('Error restarting:', err);
      }
    },
    toggleMute: () => {
      const ws = wavesurferRef.current;
      if (!ws) return false;
      try {
        const muted = ws.getMuted();
        ws.setMuted(!muted);
        return !muted;
      } catch {
        return false;
      }
    },
    isMuted: () => {
      const ws = wavesurferRef.current;
      if (!ws) return false;
      try {
        return ws.getMuted();
      } catch {
        return false;
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#e2e8f0',
      progressColor: primaryColor,
      cursorColor: 'transparent',
      barWidth: 2.5,
      barGap: 3,
      barRadius: 3,
      height: 48,
      normalize: true,
      url: audioUrl,
      peaks: peaks && peaks.length > 0 ? [peaks] : undefined,
      duration: initialDuration,
      backend: 'MediaElement',
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setIsReady(true);
      const dur = ws.getDuration();
      onTimeUpdate(ws.getCurrentTime(), dur);
    });

    ws.on('timeupdate', (currentTime) => {
      const dur = ws.getDuration() || initialDuration || 0;
      onTimeUpdate(currentTime, dur);
    });

    ws.on('finish', () => {
      if (onFinish) onFinish();
    });

    return () => {
      try {
        ws.destroy();
      } catch {
        // ignore cleanup error
      }
      wavesurferRef.current = null;
    };
  }, [audioUrl]);

  // Sync play/pause state
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isReady) return;

    if (isPlaying && !ws.isPlaying()) {
      ws.play().catch(() => {});
    } else if (!isPlaying && ws.isPlaying()) {
      ws.pause();
    }
  }, [isPlaying, isReady]);

  // Sync primary color changes
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    ws.setOptions({ progressColor: primaryColor });
  }, [primaryColor]);

  return (
    <div className="w-full relative px-1 py-1">
      <div
        ref={containerRef}
        className="w-full cursor-pointer transition-opacity duration-300"
        style={{ minHeight: '48px' }}
      />
    </div>
  );
});

Waveform.displayName = 'Waveform';
