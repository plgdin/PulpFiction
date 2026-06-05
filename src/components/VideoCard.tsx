import React, { useState } from 'react';
import type { VideoTile } from '../types/video';

export interface VideoCardProps {
  tile: VideoTile;
  onClick?: () => void;
}

export default function VideoCard({ tile, onClick }: VideoCardProps) {
  const targetRatio = tile.aspect_ratio || '1';
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full flex flex-col items-stretch overflow-hidden group bg-neutral-200/50 transition-all duration-500 cursor-zoom-in rounded-sm"
      style={{ aspectRatio: targetRatio }}
    >
      {/* Skeleton Placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-200 loading-pulse" />
      )}

      <picture className="absolute inset-0 h-full w-full pointer-events-none select-none">
        {tile.webp_url && <source srcSet={tile.webp_url} type="image/webp" />}
        <img
          src={tile.thumbnail_url}
          alt={tile.alt || tile.title || ''}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      </picture>

      {/* Hover overlay with title */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-3 pointer-events-none">
        <span
          className="text-[9px] text-white/90 uppercase tracking-[0.2em] line-clamp-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-400 ease-out"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {tile.title}
        </span>
      </div>

      {/* Top-right zoom icon hint */}
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-70 transition-all duration-300 pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </div>
    </button>
  );
}