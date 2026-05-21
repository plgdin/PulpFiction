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
      // Use a 2px tolerance for rounding issues
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
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
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative py-6">
      {/* Category title */}
      <h2 className="font-display text-2xl md:text-3xl text-primary -mb-2 px-4 md:px-12 text-shadow-cinematic relative z-10">
        {title}
      </h2>

      {/* Scroll container wrapper */}
      <div className="relative group">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            className="hidden md:block absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            onClick={() => scroll('left')}
          >
            <ChevronLeft 
              className={cn(
                "w-12 h-12 text-primary drop-shadow-[0_0_8px_rgba(245,212,103,0.8)] transition-all duration-300",
                animatingLeft ? "-translate-x-4 opacity-0 scale-90" : "translate-x-0 opacity-100 scale-100 hover:scale-110"
              )} 
            />
          </button>
        )}

        {/* Videos scroll row */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="scroll-row px-4 md:px-12 gap-4"
        >
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onPlayVideo}
              index={index}
            />
          ))}
        </div>

        {/* Right scroll button */}
        {/* Right scroll button */}
        {canScrollRight && (
          <button
            className="hidden md:block absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            onClick={() => scroll('right')}
          >
            <ChevronRight 
              className={cn(
                "w-12 h-12 text-primary drop-shadow-[0_0_8px_rgba(245,212,103,0.8)] transition-all duration-300",
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
