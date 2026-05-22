import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, ChevronDown, ExternalLink, Plus } from 'lucide-react';
import { Video } from '@/types/video';
import { cn } from '@/lib/utils';
import { motion, type Transition } from 'framer-motion';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  index?: number;
}

const extractDominantColor = (imgSrc: string): Promise<string> => {
  return Promise.resolve('163, 230, 53');
};

const VideoCard = ({ video, onPlay, index = 0 }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [edgePos, setEdgePos] = useState<'center' | 'left' | 'right'>('center');
  const [dominantColor, setDominantColor] = useState('163, 230, 53');
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const cardRef = useRef<HTMLDivElement>(null);

  const thumbnailSrc =
    video.thumbnail ||
    (video.videoUrl?.includes('.b-cdn.net')
      ? video.videoUrl
          .replace('/play_720p.mp4', '/thumbnail.jpg')
          .replace('/playlist.m3u8', '/thumbnail.jpg')
      : '/placeholder.svg');

  useEffect(() => {
    if (thumbnailSrc) {
      extractDominantColor(thumbnailSrc).then(setDominantColor);
    }
  }, [thumbnailSrc]);

  // 3D Tilt Effect on Hover
  useEffect(() => {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice) return;

    const card = cardRef.current;
    if (!card || !isHovered) return;

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * 10;
        const rotateX = ((y - centerY) / centerY) * -10;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    const handleMouseLeave = () => {
      cancelAnimationFrame(rafId);
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };
  }, [isHovered]);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
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

  const springTransition: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 1,
  };

  const motionStyles = {
    left: { left: '0%', right: 'auto', x: '0%', y: '-50%' },
    right: { left: 'auto', right: '0%', x: '0%', y: '-50%' },
    center: { left: '50%', right: 'auto', x: '-50%', y: '-50%' },
  };

  return (
    <div
      className="relative w-full aspect-video flex justify-center items-center"
      style={{ zIndex: isHovered ? 50 : 1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Card */}
      <motion.div 
        initial={false}
        animate={{
          opacity: isHovered ? 0 : 1,
          scale: 1, 
        }}
        transition={springTransition}
        className="w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden cursor-pointer shadow-lg relative"
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
        
        {/* Mobile Info Overlay (Hidden on md and up) */}
        <div className="md:hidden absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
          <h3 
            className="text-white font-bold text-xl leading-tight drop-shadow-md" 
            style={{ fontFamily: "'Antonio', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            {video.title}
          </h3>
          <div 
            className="flex items-center gap-2 text-white/80 text-[10px] uppercase tracking-widest mt-1.5" 
            style={{ fontFamily: "'Lexend Peta', sans-serif" }}
          >
            <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10">{video.year || '2024'}</span>
            <span className="w-1 h-1 rounded-full bg-white/40"></span>
            <span>{video.duration}</span>
          </div>
        </div>
      </motion.div>

      {/* Expanded Hover Card - Liquid Glass + 3D Tilt */}
      <motion.div 
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.95,
          ...motionStyles[edgePos]
        }}
        transition={springTransition}
        className={cn(
          "absolute w-[125%] min-w-[320px] z-50 hidden md:block",
          isHovered ? "pointer-events-auto" : "pointer-events-none"
        )}
        style={{ top: '50%', perspective: '1000px' }}
      >
        {/* Cinematic Thumbnail Glow underneath */}
        <img 
          src={thumbnailSrc} 
          alt="" 
          className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-[40%] object-cover blur-[28px] saturate-[1.5] opacity-80 z-0"
        />

        <div 
          ref={cardRef}
          className={cn(
            "relative z-10 mx-auto w-full overflow-hidden transition-all duration-200 ease-out text-white",
            "bg-white/5 backdrop-blur-[40px] backdrop-saturate-[200%] border border-white/20 rounded-[2.5rem]",
            "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),_0_30px_60px_-15px_rgba(0,0,0,0.8)]"
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Dynamic Glare Overlay */}
          <div 
            className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.15), transparent)',
              mixBlendMode: 'overlay'
            }}
          />

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
            
            <div className="absolute bottom-5 left-6 w-[90%]">
              <motion.h3 
                initial={false}
                animate={{ 
                  y: isHovered ? 0 : 20, 
                  opacity: isHovered ? 1 : 0 
                }}
                transition={{ ...springTransition, delay: isHovered ? 0.1 : 0 }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]"
                style={{ 
                  fontFamily: "'Antonio', sans-serif", 
                  letterSpacing: '0.04em', 
                  textTransform: 'uppercase'
                }}
              >
                {video.title}
              </motion.h3>
            </div>

            <div 
              className="absolute top-5 right-5 bg-black/40 backdrop-blur-xl border border-white/10 text-white/90 text-xs px-3.5 py-1.5 rounded-full tracking-widest shadow-sm"
              style={{ fontFamily: "'Antonio', sans-serif" }}
            >
              {video.duration}
            </div>
          </div>

          {/* Bottom: Information Panel */}
          <div className="p-5 md:p-6 flex flex-col gap-4 md:gap-5 bg-black/20 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
                  onClick={() => onPlay(video)}
                  aria-label="Play"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span 
                    className="font-bold text-[14px] tracking-[0.2em] mt-0.5" 
                    style={{ fontFamily: "'Antonio', sans-serif" }}
                  >
                    PLAY
                  </span>
                </button>

                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-105 hidden sm:flex"
                  aria-label="View Portfolio"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open('https://vimeo.com/adityajangid', '_blank', 'noopener,noreferrer');
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span 
                    className="font-bold text-[13px] tracking-[0.15em] mt-0.5" 
                    style={{ fontFamily: "'Antonio', sans-serif" }}
                  >
                    PORTFOLIO
                  </span>
                </button>

                <button
                  className="flex sm:hidden items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-105"
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
              className="flex items-center gap-3 text-[10px] md:text-[11px] font-semibold text-white/80 uppercase tracking-widest"
              style={{ fontFamily: "'Lexend Peta', sans-serif" }}
            >
              <span className="bg-white/10 px-2.5 py-1 rounded border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                {video.year || '2024'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="drop-shadow-md truncate">{video.category?.replace('-', ' ')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="text-primary/90 drop-shadow-[0_0_8px_rgba(245,212,103,0.5)]">Cinematic</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoCard;