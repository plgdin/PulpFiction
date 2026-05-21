import { useState, useRef, useCallback } from 'react';
import { Play, ChevronDown, Plus } from 'lucide-react';
import { Video } from '@/types/video';
import { cn } from '@/lib/utils';
import { motion, type Transition } from 'framer-motion';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  index?: number;
}

const VideoCard = ({ video, onPlay, index = 0 }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  // Tracks if the card is on the left edge, right edge, or center of screen
  const [edgePos, setEdgePos] = useState<'center' | 'left' | 'right'>('center');
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Grab the physical screen coordinates of the card before it expands
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // 2. Determine edge proximity (15% buffer)
    if (rect.left < viewportWidth * 0.15) {
      setEdgePos('left');
    } else if (rect.right > viewportWidth * 0.85) {
      setEdgePos('right');
    } else {
      setEdgePos('center');
    }

    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 300);
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

  const springTransition: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 1,
  };

  // Maps the edge detection to explicit Framer Motion positional coordinates
  const motionStyles = {
    left: { left: '0%', right: 'auto', x: '0%', y: '-50%' },
    right: { left: 'auto', right: '0%', x: '0%', y: '-50%' },
    center: { left: '50%', right: 'auto', x: '-50%', y: '-50%' },
  };

  return (
    <div
      className="relative w-full aspect-video group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Card */}
      <motion.div 
        initial={false}
        animate={{
          opacity: isHovered ? 0 : 1,
          scale: isHovered ? 0.9 : 1,
        }}
        transition={springTransition}
        className="w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden cursor-pointer shadow-lg"
        onClick={() => onPlay(video)}
      >
        <img
          src={thumbnailSrc}
          alt="Thumbnail"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </motion.div>

      {/* Expanded Hover Card - Liquid Glass */}
      <motion.div 
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.95,
          // Inject edge-aware coordinates here
          ...motionStyles[edgePos]
        }}
        transition={springTransition}
        className={cn(
          "absolute w-[115%] z-50 overflow-hidden",
          "bg-white/5 backdrop-blur-[40px] backdrop-saturate-[200%] border border-white/20 rounded-[2.5rem]",
          "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),_0_30px_60px_-15px_rgba(0,0,0,0.8)]",
          isHovered ? "pointer-events-auto" : "pointer-events-none"
        )}
        style={{ top: '50%' }}
      >
        {/* Top: Video Poster Area */}
        <div className="relative w-full aspect-video cursor-pointer overflow-hidden" onClick={() => onPlay(video)}>
          <motion.img
            src={thumbnailSrc}
            alt={video.title}
            initial={false}
            animate={{ scale: isHovered ? 1 : 1.1 }}
            transition={{ type: "tween", duration: 1.5, ease: "easeOut" }}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          
          <div className="absolute bottom-5 left-6 w-[90%] overflow-hidden">
            <motion.h3 
              initial={false}
              animate={{ 
                y: isHovered ? 0 : 20, 
                opacity: isHovered ? 1 : 0 
              }}
              transition={{ ...springTransition, delay: isHovered ? 0.1 : 0 }}
              className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)] line-clamp-2"
            >
              {video.title}
            </motion.h3>
          </div>

          <div 
            className="absolute top-5 right-5 bg-black/40 backdrop-blur-xl border border-white/10 text-white/90 text-xs px-3.5 py-1.5 rounded-full tracking-widest shadow-sm font-display"
          >
            {video.duration}
          </div>
        </div>

        {/* Bottom: Information Panel */}
        <div className="p-5 md:p-6 flex flex-col gap-4 md:gap-5 bg-gradient-to-b from-transparent to-black/30">
          
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              
              <button
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
                onClick={() => onPlay(video)}
                aria-label="Play"
              >
                <Play className="h-5 w-5 fill-current" />
                <span 
                  className="font-bold text-[14px] tracking-[0.2em] mt-0.5 font-display" 
                >
                  PLAY
                </span>
              </button>

              <button
                className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-105"
                aria-label="Add to list"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            <button
              className="flex items-center justify-center w-11 h-11 rounded-full bg-black/30 text-white hover:bg-white/10 border border-white/10 transition-all duration-300"
              aria-label="More info"
              onClick={() => onPlay(video)}
            >
              <ChevronDown className="h-5 w-5 opacity-80" />
            </button>
          </div>

          <div 
            className="flex items-center gap-3 text-[10px] md:text-[11px] font-semibold text-white/80 uppercase tracking-widest font-body"
          >
            <span className="bg-white/10 px-2.5 py-1 rounded border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              {video.year || '2024'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            <span className="drop-shadow-md">{video.category.replace('-', ' ')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            <span className="text-primary/90 drop-shadow-[0_0_8px_rgba(245,212,103,0.5)]">Cinematic</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoCard;