import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Video } from '@/types/video';
import VideoCard from './VideoCard';
import { cn } from '@/lib/utils';

interface CategoryRowProps {
  title: string;
  videos: Video[];
  onPlayVideo: (video: Video) => void;
}

const CategoryRow = ({ title, videos, onPlayVideo }: CategoryRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [animatingLeft, setAnimatingLeft] = useState(false);
  const [animatingRight, setAnimatingRight] = useState(false);
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
    <section className="relative py-2 md:py-4 -mb-20 md:-mb-32">
      <h2 
        className="text-2xl md:text-3xl px-4 md:px-12 text-shadow-cinematic absolute top-0 left-0 z-20 font-display font-bold text-primary" 
      >
        {title}
      </h2>

      <div className="relative group pt-10">
        {canScrollLeft && (
          <button
            className="hidden md:block absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-[110] p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            onClick={() => scroll('left')}
          >
            <ChevronLeft 
              className={cn(
                "w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(245,212,103,0.8)] transition-all duration-300",
                animatingLeft ? "-translate-x-4 opacity-0 scale-90" : "translate-x-0 opacity-100 scale-100 hover:scale-110"
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
          {videos.map((video, index) => (
            <div key={video.id} className="flex-none w-[85vw] sm:w-[320px] md:w-[360px] lg:w-[420px] xl:w-[460px] 2xl:w-[500px] relative" style={{ scrollSnapAlign: 'start' }}>
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

        {canScrollRight && (
          <button
            className="hidden md:block absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-[110] p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            onClick={() => scroll('right')}
          >
            <ChevronRight 
              className={cn(
                "w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(245,212,103,0.8)] transition-all duration-300",
                animatingRight ? "translate-x-4 opacity-0 scale-90" : "translate-x-0 opacity-100 scale-100 hover:scale-110"
              )} 
            />
          </button>
        )}
      </div>
    </section>
  );
};

export default CategoryRow;