import { useState, useRef, useEffect } from 'react';
import { X, Play, Plus, ThumbsUp, Volume2, VolumeX } from 'lucide-react';
import { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactPlayer from 'react-player';

const Player = ReactPlayer as any;

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
}

const VideoPlayer = ({ video, onClose }: VideoPlayerProps) => {
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when video changes
    setIsPlayingFull(false);
    setIsMuted(true);
  }, [video]);

  if (!video) return null;

  const seekToZero = () => {
    if (playerRef.current) {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(0);
      } else if (playerRef.current.getInternalPlayer && typeof playerRef.current.getInternalPlayer()?.currentTime !== 'undefined') {
        playerRef.current.getInternalPlayer().currentTime = 0;
      } else if (typeof playerRef.current.currentTime !== 'undefined') {
        playerRef.current.currentTime = 0;
      }
    }
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    if (!isPlayingFull && state.playedSeconds >= 30) {
      seekToZero();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-0 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-[#181818] rounded-xl overflow-hidden shadow-2xl my-8 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white/70 hover:text-white hover:bg-[#181818]/60 rounded-full bg-[#181818]/40"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Video Player */}
        <div ref={containerRef} className="relative aspect-video w-full bg-black group">
          {video.videoUrl ? (
            <Player
              ref={playerRef}
              url={video.videoUrl}
              width="100%"
              height="100%"
              playing={true}
              muted={isMuted}
              controls={isPlayingFull}
              onProgress={handleProgress as any}
              style={{ pointerEvents: isPlayingFull ? 'auto' : 'none' }}
              config={{
                file: {
                  forceHLS: true,
                  attributes: {
                    crossOrigin: 'anonymous'
                  }
                }
              }}
            />
          ) : (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover opacity-70"
            />
          )}

          {/* Overlay for Preview Mode */}
          {!isPlayingFull && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent flex flex-col justify-end p-10 pointer-events-none">
              {/* Title */}
              <h2 className="text-5xl sm:text-7xl font-black mb-8 drop-shadow-lg tracking-tight w-3/4 leading-none" style={{ color: '#F5D467' }}>
                {video.title}
              </h2>
              
              {/* Buttons Row */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <div className="flex items-center gap-3">
                  <Button 
                    className="bg-white text-black hover:bg-white/80 font-bold px-8 py-6 text-xl gap-3 rounded-md"
                    onClick={() => {
                      setIsPlayingFull(true);
                      setIsMuted(false);
                      seekToZero();
                      
                      // Request fullscreen
                      if (containerRef.current) {
                        if (containerRef.current.requestFullscreen) {
                          containerRef.current.requestFullscreen();
                        } else if ((containerRef.current as any).webkitRequestFullscreen) {
                          (containerRef.current as any).webkitRequestFullscreen();
                        } else if ((containerRef.current as any).msRequestFullscreen) {
                          (containerRef.current as any).msRequestFullscreen();
                        }
                      }
                    }}
                  >
                    <Play className="w-7 h-7 fill-black" />
                    Play
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-2 border-white/50 text-white hover:border-white hover:bg-white/10 bg-[#2a2a2a]/60">
                    <Plus className="w-6 h-6" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-2 border-white/50 text-white hover:border-white hover:bg-white/10 bg-[#2a2a2a]/60">
                    <ThumbsUp className="w-5 h-5" />
                  </Button>
                </div>

                {/* Mute Toggle */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full w-12 h-12 border-2 border-white/50 text-white hover:border-white hover:bg-white/10 bg-[#2a2a2a]/60 transition-opacity opacity-0 group-hover:opacity-100"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-10 pt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3 text-base font-medium">
              <span className="text-[#46d369] font-semibold">98% Match</span>
              <span className="text-white/90">{video.year}</span>
              <span className="text-white/90">{video.duration}</span>
              <span className="border border-white/40 px-1.5 py-0 rounded text-xs text-white/90">HD</span>
            </div>
            <p className="text-white text-base leading-relaxed sm:text-lg">
              {video.description}
            </p>
          </div>
          <div className="space-y-4 text-sm leading-relaxed">
            <div>
              <span className="text-[#777]">Cast: </span>
              <span className="text-white hover:underline cursor-pointer">Director's Cut</span>, <span className="text-white hover:underline cursor-pointer">Various</span>
            </div>
            <div>
              <span className="text-[#777]">Genres: </span>
              <span className="text-white capitalize hover:underline cursor-pointer">{video.category.replace('-', ' ')}</span>
            </div>
            <div>
              <span className="text-[#777]">This video is: </span>
              <span className="text-white hover:underline cursor-pointer">Visually Striking</span>, <span className="text-white hover:underline cursor-pointer">Creative</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
