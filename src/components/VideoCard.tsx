import { useState } from 'react';
import { Play, Clock } from 'lucide-react';
import { Video } from '@/types/video';
import { cn } from '@/lib/utils';
interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  index?: number;
}
const VideoCard = ({
  video,
  onPlay,
  index = 0
}: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return <div className={cn("video-card group cursor-pointer flex-shrink-0", "w-[280px] md:w-[320px] lg:w-[360px] aspect-video")} style={{
    animationDelay: `${index * 0.1}s`
  }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => onPlay(video)}>
      {/* Thumbnail */}
      <div className="relative w-full h-full overflow-hidden rounded bg-black/40">
        <img 
          src={video.thumbnail || (video.videoUrl?.includes('.b-cdn.net') ? video.videoUrl.replace('/play_720p.mp4', '/thumbnail.jpg').replace('/playlist.m3u8', '/thumbnail.jpg') : '/placeholder.svg')} 
          alt={video.title} 
          className={cn("w-full h-full object-cover transition-transform duration-500", isHovered && "scale-110")} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Overlay gradient */}
        <div className={cn("absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent", "opacity-60 transition-opacity duration-300")} />

        {/* Play button overlay */}
        <div className={cn("absolute inset-0 flex items-center justify-center", "opacity-0 group-hover:opacity-100 transition-opacity duration-300")}>
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center animate-pulse-glow">
            <Play className="w-8 h-8 text-primary-foreground fill-primary-foreground ml-1" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-xs font-medium text-primary">
            <Clock className="w-3 h-3" />
            {video.duration}
          </div>
        </div>

        {/* Info overlay */}
        <div className={cn("absolute bottom-0 left-0 right-0 p-4", "transform transition-transform duration-300", isHovered ? "translate-y-0" : "translate-y-2")}>
          <h3 className="font-display tracking-wide truncate text-primary bg-primary-foreground text-sm text-center">
            {video.title}
          </h3>
          <p className={cn("text-sm text-muted-foreground mt-1 line-clamp-2", "opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100")}>
            {video.description}
          </p>
          <div className={cn("flex items-center gap-2 mt-2 text-xs text-primary/70", "opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150")}>
            <span>{video.year}</span>
            <span>•</span>
            <span className="capitalize">{video.category.replace('-', ' ')}</span>
          </div>
        </div>
      </div>
    </div>;
};
export default VideoCard;