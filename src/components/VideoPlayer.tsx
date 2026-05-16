import { X, ExternalLink } from 'lucide-react';
import { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
}

const VideoPlayer = ({ video, onClose }: VideoPlayerProps) => {
  if (!video) return null;

  const handleViewOnBehance = () => {
    if (video.videoUrl) {
      window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-scale-in"
      onClick={onClose}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-primary hover:bg-primary/10"
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </Button>

      {/* Content */}
      <div 
        className="relative w-full max-w-5xl mx-4 md:mx-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video thumbnail preview */}
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play on Behance overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Button
              size="lg"
              className="gap-3 bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl px-10 py-6 animate-pulse-glow"
              onClick={handleViewOnBehance}
            >
              <ExternalLink className="w-6 h-6" />
              View on Behance
            </Button>
            <p className="text-muted-foreground mt-4 text-sm">
              Click to watch the full video on Behance
            </p>
          </div>
        </div>

        {/* Video info */}
        <div className="mt-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-primary text-shadow-cinematic">
            {video.title}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="text-primary font-semibold">{video.year}</span>
            <span>•</span>
            <span>{video.duration}</span>
            <span>•</span>
            <span className="capitalize">{video.category.replace('-', ' ')}</span>
          </div>
          <p className="mt-4 text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
