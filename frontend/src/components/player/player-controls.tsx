'use client';

import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Repeat, Repeat1, Volume2, VolumeX } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBackward?: () => void;
  onSkipForward?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  repeatMode: 'off' | 'one';
  onToggleRepeat: () => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
  isMuted = false,
  onToggleMute,
  repeatMode,
  onToggleRepeat,
  primaryColor = '#e08d3c',
  secondaryColor = '#ffd7ab',
}) => {
  return (
    <div className="flex items-center justify-between w-full max-w-[300px] mx-auto px-1 py-1">
      {/* Repeat Track Toggle */}
      <button
        onClick={onToggleRepeat}
        title={repeatMode === 'one' ? 'حالت تکرار فعال است' : 'فعال‌سازی تکرار این قطعه'}
        className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${
          repeatMode === 'one'
            ? 'text-amber-800 bg-amber-100/90 shadow-xs'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100/70'
        }`}
        style={repeatMode === 'one' ? { color: primaryColor } : {}}
      >
        {repeatMode === 'one' ? (
          <Repeat1 className="w-4 h-4" />
        ) : (
          <Repeat className="w-4 h-4" />
        )}
      </button>

      {/* Skip Backward 10 Seconds */}
      <button
        onClick={onSkipBackward}
        title="۱۰ ثانیه به عقب"
        className="relative group p-2.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100/70 transition-all duration-200 active:scale-90 flex flex-col items-center justify-center"
      >
        <RotateCcw className="w-4.5 h-4.5" />
        <span className="text-[9px] font-bold font-mono leading-none mt-0.5 text-gray-400 group-hover:text-gray-700">
          ۱۰-
        </span>
      </button>

      {/* Prominent Center Play / Pause Button */}
      <button
        onClick={onPlayPause}
        title={isPlaying ? 'توقف' : 'پخش'}
        className="relative group p-4 rounded-2xl text-white transition-all duration-300 transform active:scale-95 hover:scale-105 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          boxShadow: `0 8px 24px -4px ${primaryColor}70`,
        }}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current translate-x-[-1px] rtl:translate-x-[1px]" />
        )}
      </button>

      {/* Skip Forward 10 Seconds */}
      <button
        onClick={onSkipForward}
        title="۱۰ ثانیه به جلو"
        className="relative group p-2.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100/70 transition-all duration-200 active:scale-90 flex flex-col items-center justify-center"
      >
        <RotateCw className="w-4.5 h-4.5" />
        <span className="text-[9px] font-bold font-mono leading-none mt-0.5 text-gray-400 group-hover:text-gray-700">
          ۱۰+
        </span>
      </button>

      {/* Mute / Unmute Toggle */}
      <button
        onClick={onToggleMute}
        title={isMuted ? 'وصل صدا' : 'قطع صدا (بی‌صدا)'}
        className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${
          isMuted
            ? 'text-rose-600 bg-rose-50 shadow-xs'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100/70'
        }`}
      >
        {isMuted ? (
          <VolumeX className="w-4.5 h-4.5" />
        ) : (
          <Volume2 className="w-4.5 h-4.5" />
        )}
      </button>
    </div>
  );
};
