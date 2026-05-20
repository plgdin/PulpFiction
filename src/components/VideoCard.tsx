import { useState, useRef, useCallback } from 'react';
import { Play, Plus, ThumbsUp, ChevronDown, VolumeX } from 'lucide-react';
import { Video } from '@/types/video';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  index?: number;
}

const VideoCard = ({ video, onPlay, index = 0 }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = useCallback(() => {
    // Slight delay for hover per user request
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 250);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  }, []);

  const thumbnailSrc =
    video.thumbnail ||
    (video.videoUrl?.includes('.b-cdn.net')
      ? video.videoUrl
          .replace('/play_720p.mp4', '/thumbnail.jpg')
          .replace('/playlist.m3u8', '/thumbnail.jpg')
      : '/placeholder.svg');

  return (
    <div
      className="vc-wrapper"
      style={{ animationDelay: `${index * 0.08}s` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base card — always visible, takes space in flow */}
      <div className="vc-base" onClick={() => onPlay(video)}>
        <img
          src={thumbnailSrc}
          alt={video.title}
          className="vc-poster"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {/* Title strip at bottom of poster */}
        <div className="vc-title-strip">
          <h3 className="vc-title">{video.title}</h3>
        </div>
      </div>

      {/* Expanded hover card — floats above, no layout shift */}
      <div className={cn('vc-expand', isHovered && 'vc-expand--active')}>
        {/* Top: image portion */}
        <div className="vc-expand-poster" onClick={() => onPlay(video)}>
          <img
            src={thumbnailSrc}
            alt={video.title}
            className="vc-poster"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 vc-expand-poster-gradient transition-opacity duration-300" />
          
          {/* Title overlay inside poster */}
          <div className="absolute bottom-2 left-3 z-10 w-[80%]">
            <h3 
              className="text-lg leading-tight font-bold text-white drop-shadow-md"
              style={{ fontFamily: "'Antonio', sans-serif", letterSpacing: '0.02em', textTransform: 'uppercase' }}
            >
              {video.title}
            </h3>
          </div>

          {/* Duration Badge */}
          <div className="vc-duration">
            {video.duration}
          </div>

          {/* Play Overlay Center */}
          <div className="vc-play-overlay">
            <div className="vc-play-btn">
              <Play className="w-6 h-6 fill-current ml-1" />
            </div>
          </div>
        </div>

        {/* Bottom: info panel */}
        <div className="vc-info">
          {/* Action buttons row */}
          <div className="vc-actions">
            <button
              className="vc-action-btn vc-action-btn--primary"
              onClick={() => onPlay(video)}
              aria-label="Play"
            >
              <Play className="h-4 w-4 fill-current ml-0.5" />
            </button>
            <button className="vc-action-btn" aria-label="Add to list">
              <Plus className="h-4 w-4" />
            </button>
            <button className="vc-action-btn" aria-label="Like">
              <ThumbsUp className="h-4 w-4 pl-0.5 pb-0.5" />
            </button>
            <button
              className="vc-action-btn vc-action-btn--expand"
              aria-label="More info"
              onClick={() => onPlay(video)}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Metadata */}
          <div className="vc-meta">
            <span className="vc-meta-badge">A</span>
            <span className="vc-meta-dur">{video.duration}</span>
            <span className="vc-meta-badge">HD</span>
            <span className="vc-meta-year">{video.year || '2023'}</span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-white/75 line-clamp-2 mt-1.5 mb-2 font-medium leading-relaxed font-sans">
            {video.description}
          </p>

          {/* Genre / category tag */}
          <div className="vc-genre">
            {video.category.replace('-', ' ')} • Cinematic • Visual
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;