import { useState } from 'react';
import { Play } from 'lucide-react';
import { Video } from '@/types/video';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  index?: number;
}

const VideoCard = ({ video, onPlay, index = 0 }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const thumbnailSrc =
    video.thumbnail ||
    (video.videoUrl?.includes('.b-cdn.net')
      ? video.videoUrl
          .replace('/play_720p.mp4', '/thumbnail.jpg')
          .replace('/playlist.m3u8', '/thumbnail.jpg')
      : '/placeholder.svg');

  return (
    <div 
      className="relative cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:scale-[1.05] hover:z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay(video)}
    >
      {/* Pixel Frame Card */}
      <div className="w-full aspect-video bg-zinc-900 overflow-hidden pixel-border-gold p-1.5 relative transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(245,212,103,0.5)]">
        {/* 8-bit Corner Brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
        
        {/* Thumbnail */}
        <img 
          src={thumbnailSrc} 
          alt={video.title} 
          loading="lazy"
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 contrast-125 saturate-150 transition-all duration-300"
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 bg-primary/80 flex items-center justify-center border-2 border-primary shadow-[0_0_16px_rgba(245,212,103,0.5)]">
            <Play className="w-6 h-6 text-black fill-black ml-0.5" />
          </div>
        </div>

        {/* Bottom gradient for title readability */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* Info Strip */}
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-[10px] md:text-xs font-bold text-primary retro uppercase tracking-wide leading-tight truncate">
          {video.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-stone-500 font-mono tracking-widest uppercase">
            {video.year || '2024'}
          </span>
          {video.duration && (
            <span className="text-[9px] text-stone-600 font-mono">
              [{video.duration}]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;