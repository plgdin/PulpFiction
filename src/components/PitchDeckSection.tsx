import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight, X, Presentation, ExternalLink, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { PitchDeck } from '@/types/cms';

/**
 * Lazy iframe that only mounts on click (Facade pattern).
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
          className="absolute inset-0 w-full h-full cursor-pointer group/iframe flex items-center justify-center bg-zinc-900 overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            setIsRevealed(true);
          }}
        >
          {thumbnail && (
            <img 
              src={thumbnail} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover/iframe:opacity-90 transition-opacity grayscale group-hover/iframe:grayscale-0"
            />
          )}
          <div className="relative z-10 w-14 h-14 bg-primary/80 flex items-center justify-center border-2 border-primary shadow-[0_0_16px_rgba(245,212,103,0.5)] group-hover/iframe:scale-110 transition-transform">
            <Play className="w-7 h-7 text-black fill-black ml-0.5" />
          </div>
        </div>
      ) : (
        <iframe
          src={src}
          className="absolute border-0 transition-opacity duration-700 ease-in-out"
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
            opacity: isLoaded ? 1 : 0,
          }}
        />
      )}
    </div>
  );
});

LazyIframe.displayName = 'LazyIframe';

/* ==========================================
   Retro Pitch Deck Card
   ========================================== */
const PitchDeckCard = memo(({
  deck,
  index,
  onOpen,
}: {
  deck: PitchDeck;
  index: number;
  onOpen: (deck: PitchDeck) => void;
}) => {
  return (
    <div
      className="relative cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:scale-[1.05] hover:z-50"
      onClick={() => onOpen(deck)}
    >
      {/* Pixel Frame Card */}
      <div className="w-full aspect-[4/3] bg-zinc-900 overflow-hidden pixel-border-gold p-1.5 relative transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(245,212,103,0.5)]">
        {/* 8-bit Corner Brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>

        {/* Iframe Preview */}
        <LazyIframe
          src={deck.embedUrl}
          title={deck.title}
          thumbnail={deck.thumbnail}
          className="absolute inset-0 w-full h-full"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
          <div className="w-12 h-12 bg-primary/80 flex items-center justify-center border-2 border-primary shadow-[0_0_16px_rgba(245,212,103,0.5)]">
            <ExternalLink className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      {/* Info Strip */}
      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-[10px] md:text-xs font-bold text-primary retro uppercase tracking-wide">
          {deck.title}
        </h3>
        <span className="text-[9px] text-stone-500 font-mono tracking-widest">
          DECK_{String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
});

PitchDeckCard.displayName = 'PitchDeckCard';

/* ==========================================
   Fullscreen Modal
   ========================================== */
const PitchDeckModal = ({ deck, onClose }: { deck: PitchDeck; onClose: () => void }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b-4 border-primary/30 bg-black/80">
        <div className="flex items-center gap-3">
          <Presentation className="w-4 h-4 text-primary" />
          <span className="text-xs retro text-primary uppercase">{deck.title}</span>
        </div>
        <button
          onClick={onClose}
          className="pixel-btn text-center flex items-center justify-center gap-2 py-1.5 px-3"
        >
          <X className="w-3 h-3" />
          <span>CLOSE</span>
        </button>
      </div>

      {/* Iframe */}
      <motion.div
        className="flex-1 relative"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
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

/* ==========================================
   PitchDeckSection — RPG Item Collection
   ========================================== */
const PitchDeckSection = ({ pitchDecks }: { pitchDecks: PitchDeck[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
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
      <section className="relative py-6 md:py-8 max-w-7xl mx-auto px-4 md:px-12">
        {/* Section Header */}
        <div className="w-full flex justify-between items-center border-b-2 border-stone-800 pb-3 mb-6">
          <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">
            PITCH DECKS
          </span>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-[110] w-10 h-10 items-center justify-center border-2 border-primary bg-black/80 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-black"
              style={{ left: '-48px' }}
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Scrollable Deck Row */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide py-4 px-4 md:px-12 -mx-4 md:-mx-12"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {pitchDecks.map((deck, index) => (
              <div
                key={deck.id}
                className="flex-none w-[80vw] sm:w-[280px] md:w-[320px] lg:w-[360px]"
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

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-[110] w-10 h-10 items-center justify-center border-2 border-primary bg-black/80 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-black"
              style={{ right: '-48px' }}
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-6 h-6" />
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
