import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Video } from '@/types/video';
import VideoCard from './VideoCard';

interface CategoryRowProps {
  title: string;
  videos: Video[];
  onPlayVideo: (video: Video) => void;
  stageNumber?: number;
}

const CategoryRow = ({ title, videos, onPlayVideo, stageNumber = 1 }: CategoryRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const timeoutId = setTimeout(checkScroll, 500);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkScroll);
    };
  }, [videos]);

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
    <section className="relative py-6 md:py-8 max-w-7xl mx-auto px-4 md:px-12">
      {/* Section Header */}
      <div className="w-full flex justify-between items-center border-b-2 border-stone-800 pb-3 mb-6">
        <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">
          {title.toUpperCase()}
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

        {/* Scrollable Video Row */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide py-4 px-4 md:px-12 -mx-4 md:-mx-12"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {videos.map((video, index) => (
            <div key={video.id} className="flex-none w-[80vw] sm:w-[280px] md:w-[320px] lg:w-[360px]" style={{ scrollSnapAlign: 'start' }}>
              <VideoCard
                video={video}
                onPlay={onPlayVideo}
                index={index}
              />
            </div>
          ))}
          <div className="flex-none w-4 md:w-12 shrink-0 opacity-0 pointer-events-none" aria-hidden="true">
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
  );
};

export default CategoryRow;