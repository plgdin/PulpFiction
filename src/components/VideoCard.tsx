import React from 'react';
import type { VideoTile } from '../types/video';

interface VideoCardProps {
  tile: VideoTile;
}

export default function VideoCard({ tile }: VideoCardProps) {
  const targetRatio = tile.aspect_ratio || '1';

  return (
    <button
      type="button"
      className="relative w-full flex flex-col items-stretch overflow-hidden group bg-neutral-100 transition-opacity duration-300 hover:opacity-95 cursor-zoom-in"
      style={{ aspectRatio: targetRatio }}
    >
      <picture className="absolute inset-0 h-full w-full pointer-events-none select-none">
        {tile.webp_url && <source srcSet={tile.webp_url} type="image/webp" />}
        <img
          src={tile.thumbnail_url}
          alt={tile.title || ''}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      </picture>
      
      {/* Editorial tracking title block reveal on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
        <span className="text-[9px] text-white font-mono uppercase tracking-widest line-clamp-1 truncate translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          {tile.title}
        </span>
      </div>
    </button>
  );
}