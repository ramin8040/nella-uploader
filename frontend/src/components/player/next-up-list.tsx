'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { NextUpTrack } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import Link from 'next/link';

interface NextUpListProps {
  tracks: NextUpTrack[];
  onSelectTrack?: (slug: string) => void;
  primaryColor?: string;
}

export const NextUpList: React.FC<NextUpListProps> = ({
  tracks,
  onSelectTrack,
  primaryColor = '#ff6b35',
}) => {
  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="w-full mt-6 pt-5 border-t border-gray-100/80">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          قطعات بعدی
        </h3>
        <span className="text-[11px] text-gray-400">
          {tracks.length} قطعه
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tracks.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/60 hover:bg-white/95 border border-white/80 hover:border-orange-200/50 transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Link
                href={`/music/${item.slug}`}
                onClick={(e) => {
                  if (onSelectTrack) {
                    e.preventDefault();
                    onSelectTrack(item.slug);
                  }
                }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100/90 group-hover:bg-orange-500 flex items-center justify-center text-gray-600 group-hover:text-white transition-all duration-200 shadow-xs"
                style={{
                  // Accent on hover
                }}
              >
                <Play className="w-3.5 h-3.5 fill-current translate-x-[-0.5px] rtl:translate-x-[0.5px]" />
              </Link>

              <div className="flex flex-col text-right truncate">
                <Link
                  href={`/music/${item.slug}`}
                  onClick={(e) => {
                    if (onSelectTrack) {
                      e.preventDefault();
                      onSelectTrack(item.slug);
                    }
                  }}
                  className="text-xs font-semibold text-gray-800 hover:text-orange-600 truncate transition-colors"
                >
                  {item.title}
                </Link>
                <span className="text-[11px] text-gray-400 truncate mt-0.5">
                  {item.artist}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 font-medium pl-1 flex-shrink-0">
              {formatDuration(item.duration)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
