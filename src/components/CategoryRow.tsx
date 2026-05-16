import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Video } from '@/types/video';
import VideoCard from './VideoCard';
import { Button } from '@/components/ui/button';

interface CategoryRowProps {
  title: string;
  videos: Video[];
  onPlayVideo: (video: Video) => void;
}

const CategoryRow = ({ title, videos, onPlayVideo }: CategoryRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
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
      <h2 className="font-display text-2xl md:text-3xl text-primary mb-4 px-4 md:px-12 text-shadow-cinematic">
        {title}
      </h2>

      {/* Scroll container wrapper */}
      <div className="relative group">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full w-12 rounded-none bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-8 h-8 text-primary" />
        </Button>

        {/* Videos scroll row */}
        <div
          ref={scrollRef}
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
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full w-12 rounded-none bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-8 h-8 text-primary" />
        </Button>
      </div>
    </section>
  );
};

export default CategoryRow;
