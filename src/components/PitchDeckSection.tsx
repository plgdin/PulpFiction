import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, X, Presentation, ExternalLink, Maximize2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, type Transition } from 'framer-motion';

import { PitchDeck } from '@/types/cms';
/**
 * Lazy iframe that only mounts on click (Facade pattern).
 * This completely prevents Canva apps from loading until explicitly requested.
 */
const LazyIframe = memo(({ src, title, style, className, thumbnail }: {
  src: string;
  title: string;
  style?: React.CSSProperties;
  className?: string;
  thumbnail?: string;
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={className} style={style}>
      {!isRevealed ? (
        <div 
          className="absolute inset-0 w-full h-full cursor-pointer group flex items-center justify-center bg-zinc-800 overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            setIsRevealed(true);
          }}
        >
          {thumbnail && (
            <img 
              src={thumbnail} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            />
          )}
          <div className="relative z-10 w-16 h-16 rounded-full bg-black/50 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      ) : (
        <iframe
          src={src}
          className={cn("absolute border-0 transition-opacity duration-700 ease-in-out", isLoaded ? "opacity-100" : "opacity-0")}
          loading="lazy"
          title={title}
          tabIndex={-1}
          onLoad={() => setIsLoaded(true)}
          style={{
            pointerEvents: 'none',
            top: '-5%',
            left: '-2%',
            width: '104%',
            height: '115%',
          }}
        />
      )}
    </div>
  );
});

LazyIframe.displayName = 'LazyIframe';

const PitchDeckCard = memo(({
  deck,
  index,
  onOpen,
}: {
  deck: PitchDeck;
  index: number;
  onOpen: (deck: PitchDeck) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [edgePos, setEdgePos] = useState<'center' | 'left' | 'right'>('center');
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Effect on Hover (Optimized)
  useEffect(() => {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice) return;

    const card = cardRef.current;
    if (!card || !isHovered) return;

    let rafId: number;
    let ticking = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateY = ((x - centerX) / centerX) * 8;
          const rotateX = ((y - centerY) / centerY) * -8;

          card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseLeaveCard = () => {
      cancelAnimationFrame(rafId);
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      ticking = false;
    };

    card.addEventListener('mousemove', handleMouseMove, { passive: true });
    card.addEventListener('mouseleave', handleMouseLeaveCard);

    return () => {
      cancelAnimationFrame(rafId);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeaveCard);
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
      ref={containerRef}
      className="relative w-full aspect-video flex justify-center items-center group"
      style={{ zIndex: isHovered ? 50 : 1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Dummy placeholder to preserve layout space while the real card is absolute */}
      <div className="w-full h-full" />

      {/* 2. The ONE actual card that animates to 125% width */}
      <motion.div
        initial={false}
        animate={{
          width: isHovered ? '125%' : '100%',
          ...(isHovered ? motionStyles[edgePos] : { left: '50%', x: '-50%', y: '-50%' })
        }}
        transition={springTransition}
        className={cn(
          "absolute top-1/2 z-10",
          isHovered ? "pointer-events-auto" : "pointer-events-none h-full"
        )}
        style={{ perspective: '1000px' }}
      >
        <div
          ref={cardRef}
          className={cn(
            "w-full h-full overflow-hidden shadow-lg transition-all duration-300",
            isHovered 
              ? "bg-white/5 backdrop-blur-[20px] backdrop-saturate-[150%] border border-white/20 rounded-[2.5rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),_0_30px_60px_-15px_rgba(0,0,0,0.8)]"
              : "rounded-2xl md:rounded-[2rem] border border-transparent"
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
        {/* Top: Deck Preview Area (always aspect-video) */}
        <div 
          className="relative w-full aspect-video cursor-pointer overflow-hidden pointer-events-auto" 
          onClick={() => onOpen(deck)}
        >
          <div className="absolute inset-0 overflow-hidden bg-zinc-900">
            {/* Fallback gradient behind iframe */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                background: `linear-gradient(135deg, ${deck.accent}30 0%, #1a1a1a 50%, ${deck.accent}15 100%)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Presentation className="w-10 h-10 text-white/20 animate-pulse" />
              </div>
            </div>
            
            {/* Canva first slide — lazy loaded, scaled up to crop out bottom controls */}
            <LazyIframe
              src={deck.embedUrl}
              title={`${deck.title} preview`}
              className="absolute inset-0 z-20"
              thumbnail={deck.thumbnail}
            />
          </div>
          
          {/* Base Card Mobile Info Overlay */}
          <motion.div 
            animate={{ opacity: isHovered ? 0 : 0.95 }}
            className="md:hidden absolute inset-0 bg-gradient-to-t from-black/100 via-black/40 to-transparent flex flex-col justify-end p-3 sm:p-4 z-10"
          >
            <h3 className="text-white font-bold text-lg sm:text-xl leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,1)] line-clamp-2" style={{ fontFamily: "'Antonio', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {deck.title}
            </h3>
            <div className="flex items-center gap-2 text-white/80 text-[10px] uppercase tracking-widest mt-1.5" style={{ fontFamily: "'Lexend Peta', sans-serif" }}>
              <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10">DECK</span>
              <span className="w-1 h-1 rounded-full bg-white/40"></span>
              <span>Canva</span>
            </div>
          </motion.div>

          {/* Hover Card Overlay Effects */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none"
          >
            <div
              className="absolute inset-0 z-20 mix-blend-overlay"
              style={{
                background: 'radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.12), transparent)'
              }}
            />
            <div className="absolute top-5 right-5 bg-black/40 backdrop-blur-xl border border-white/10 text-white/90 text-xs px-3.5 py-1.5 rounded-full tracking-widest shadow-sm">
              PITCH DECK
            </div>
            <div className="absolute bottom-5 left-6 w-[90%]">
              <motion.h3
                initial={false}
                animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                transition={{ ...springTransition, delay: isHovered ? 0.1 : 0 }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]"
                style={{ fontFamily: "'Antonio', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                {deck.title}
              </motion.h3>
            </div>
          </motion.div>
        </div>

        {/* Bottom: Information Panel (only visible on hover) */}
        <motion.div
          animate={{
            height: isHovered ? 'auto' : 0,
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="p-5 md:p-6 flex flex-col gap-4 md:gap-5 bg-black/20 relative z-10 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
                  onClick={() => onOpen(deck)}
                >
                  <Presentation className="h-5 w-5" />
                  <span className="font-bold text-[14px] tracking-[0.2em] mt-0.5" style={{ fontFamily: "'Antonio', sans-serif" }}>VIEW</span>
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-105 hidden sm:flex"
                  onClick={(e) => { e.stopPropagation(); window.open(deck.originalUrl, '_blank', 'noopener,noreferrer'); }}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-bold text-[13px] tracking-[0.15em] mt-0.5" style={{ fontFamily: "'Antonio', sans-serif" }}>CANVA</span>
                </button>
              </div>
              <button
                className="flex items-center justify-center w-11 h-11 rounded-full bg-black/30 text-white hover:bg-white/10 border border-white/10 transition-all duration-300"
                onClick={() => onOpen(deck)}
              >
                <ChevronDown className="h-5 w-5 opacity-80" />
              </button>
            </div>
            <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-semibold text-white/80 uppercase tracking-widest" style={{ fontFamily: "'Lexend Peta', sans-serif" }}>
              <span className="bg-white/10 px-2.5 py-1 rounded border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">2024</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="drop-shadow-md truncate">Pitch Deck</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="drop-shadow-[0_0_8px_rgba(245,212,103,0.5)]" style={{ color: deck.accent }}>Canva</span>
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </div>
  );
});

PitchDeckCard.displayName = 'PitchDeckCard';

const PitchDeckModal = ({
  deck,
  onClose,
}: {
  deck: PitchDeck;
  onClose: () => void;
}) => {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[95vw] h-[85vh] md:w-[90vw] md:h-[88vh] max-w-7xl rounded-2xl overflow-hidden border border-white/10"
        style={{
          boxShadow: `0 0 80px ${deck.accent}15, 0 25px 50px rgba(0,0,0,0.5)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3 bg-black/70 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${deck.accent}25` }}
            >
              <Presentation className="w-4 h-4" style={{ color: deck.accent }} />
            </div>
            <h3
              className="text-sm md:text-base font-bold tracking-[0.1em] text-white/90"
              style={{ fontFamily: "'Antonio', sans-serif", textTransform: 'uppercase' }}
            >
              {deck.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={deck.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs tracking-wider transition-all duration-200"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">OPEN IN CANVA</span>
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canva Embed */}
        <iframe
          src={deck.embedUrl}
          className="w-full h-full bg-zinc-900"
          allowFullScreen
          allow="fullscreen"
          loading="lazy"
          title={deck.title}
        />
      </motion.div>
    </motion.div>
  );
};

const PitchDeckSection = ({ pitchDecks }: { pitchDecks: PitchDeck[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [animatingLeft, setAnimatingLeft] = useState(false);
  const [animatingRight, setAnimatingRight] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<PitchDeck | null>(null);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const timeoutId = setTimeout(checkScroll, 500);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setAnimatingLeft(true);
      setTimeout(() => setAnimatingLeft(false), 300);
    } else {
      setAnimatingRight(true);
      setTimeout(() => setAnimatingRight(false), 300);
    }

    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.8 : 800;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <>
      <section className="relative py-2 md:py-4 -mb-20 md:-mb-32 z-40">
        <h2
          className="text-2xl md:text-3xl px-4 md:px-12 text-shadow-cinematic absolute top-0 left-0 z-20"
          style={{
            fontFamily: "'Antonio', sans-serif",
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'hsl(var(--primary))',
          }}
        >
          Pitch Decks
        </h2>

        <div className="relative group pt-10">
          {canScrollLeft && (
            <button
              className="hidden md:block absolute left-2 md:left-6 top-[38%] z-[110] p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
              onClick={() => scroll('left')}
            >
              <ChevronLeft
                className={cn(
                  'w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(245,212,103,0.8)] transition-all duration-300',
                  animatingLeft
                    ? '-translate-x-4 opacity-0 scale-90'
                    : 'translate-x-0 opacity-100 scale-100 hover:scale-110'
                )}
              />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="pl-4 md:pl-12 pt-16 pb-36 md:pt-24 md:pb-52 flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide -mt-6 md:-mt-8"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {pitchDecks.map((deck, index) => (
              <div
                key={deck.id}
                className="flex-none w-[85vw] sm:w-[320px] md:w-[360px] lg:w-[420px] xl:w-[460px] 2xl:w-[500px] relative"
                style={{ scrollSnapAlign: 'start' }}
              >
                <PitchDeckCard deck={deck} index={index} onOpen={setSelectedDeck} />
              </div>
            ))}
            <div
              className="flex-none w-4 md:w-12 shrink-0 opacity-0 pointer-events-none"
              aria-hidden="true"
            >
              &nbsp;
            </div>
          </div>

          {canScrollRight && (
            <button
              className="hidden md:block absolute right-2 md:right-6 top-[38%] z-[110] p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
              onClick={() => scroll('right')}
            >
              <ChevronRight
                className={cn(
                  'w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(245,212,103,0.8)] transition-all duration-300',
                  animatingRight
                    ? 'translate-x-4 opacity-0 scale-90'
                    : 'translate-x-0 opacity-100 scale-100 hover:scale-110'
                )}
              />
            </button>
          )}
        </div>
      </section>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {selectedDeck && (
          <PitchDeckModal deck={selectedDeck} onClose={() => setSelectedDeck(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default PitchDeckSection;
