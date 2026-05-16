import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Volume2, VolumeX, Mail, Instagram } from 'lucide-react';
import { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactPlayer from 'react-player';
import { useCms } from '@/context/CmsContext';
import { useSearchParams } from 'react-router-dom';

const Player = ReactPlayer as any;

const PLAYER_CONFIG = {
  file: {
    attributes: {
      playsInline: true,
      crossOrigin: "anonymous",
    }
  }
};

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
}

const VideoPlayer = ({ video, onClose }: VideoPlayerProps) => {
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getVideosByCategory } = useCms();
  const [searchParams, setSearchParams] = useSearchParams();

  const moreVideos = video ? getVideosByCategory(video.category).filter(v => v.id !== video.id) : [];

  const handlePlayRelated = (v: Video) => {
    setSearchParams({ v: v.id });
    if (containerRef.current) {
      containerRef.current.parentElement?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
        <div 
          ref={containerRef} 
          className={cn(
            "relative aspect-video w-full bg-black group",
            !isPlayingFull && "preview-mode-video"
          )}
        >
          <style>{`
            .preview-mode-video video::-webkit-media-controls {
              display: none !important;
            }
            .preview-mode-video video::-moz-media-controls {
              display: none !important;
            }
            .preview-mode-video video {
              pointer-events: none;
            }
          `}</style>
          {video.videoUrl ? (
            video.videoUrl.includes('.b-cdn.net') ? (
              <video
                ref={playerRef}
                src={video.videoUrl.replace('/playlist.m3u8', '/play_720p.mp4')}
                className="w-full h-full object-contain"
                autoPlay={true}
                muted={isMuted}
                controls={isPlayingFull}
                playsInline
                loop={!isPlayingFull}
                onTimeUpdate={(e) => {
                  const target = e.target as HTMLVideoElement;
                  if (!isPlayingFull && target.currentTime >= 30) {
                    target.currentTime = 0;
                  }
                }}
              />
            ) : (
              <Player
                ref={playerRef}
                url={video.videoUrl}
                width="100%"
                height="100%"
                playing={true}
                muted={isMuted}
                controls={true}
                onProgress={handleProgress as any}
                onError={(e: any) => console.error("Video Player Error:", e)}
                onReady={() => console.log("Video Player Ready")}
                config={PLAYER_CONFIG}
              />
            )
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
              <h2 className="text-5xl sm:text-7xl font-display text-primary text-shadow-cinematic mb-8 tracking-tight w-3/4 leading-none">
                {video.title}
              </h2>
              
              {/* Buttons Row */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <div className="flex items-center gap-3">
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-6 text-xl gap-3 rounded-md"
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
                    <Play className="w-7 h-7 fill-current" />
                    Play
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full w-12 h-12 border-2 border-white/50 text-white hover:border-white hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] bg-[#2a2a2a]/60 transition-all duration-300"
                    onClick={() => window.location.href = 'mailto:tarunkapoor97@gmail.com'}
                  >
                    <Mail className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full w-12 h-12 border-2 border-white/50 text-white hover:border-white hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] bg-[#2a2a2a]/60 transition-all duration-300"
                    onClick={() => window.open('https://instagram.com/tarunkapoor2', '_blank')}
                  >
                    <Instagram className="w-5 h-5" />
                  </Button>
                </div>

                {/* Mute Toggle */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full w-12 h-12 border-2 border-white/50 text-white hover:border-white hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] bg-[#2a2a2a]/60 transition-all duration-300 opacity-0 group-hover:opacity-100"
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

        {/* More Like This Section */}
        {moreVideos.length > 0 && (
          <div className="p-10 pt-4">
            <h3 className="text-2xl font-bold text-white mb-6 font-display">More Like This</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreVideos.map((v, index) => (
                <div
                  key={v.id}
                  className="video-card aspect-video cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handlePlayRelated(v)}
                >
                  <div className="group relative h-full w-full overflow-hidden rounded bg-black/40">
                    <img
                      src={v.thumbnail || (v.videoUrl?.includes('.b-cdn.net') ? v.videoUrl.replace('/play_720p.mp4', '/thumbnail.jpg').replace('/playlist.m3u8', '/thumbnail.jpg') : '/placeholder.svg')}
                      alt={v.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                      <h3 className="font-display text-primary bg-primary-foreground text-sm truncate px-1 text-center">{v.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        <span>{v.year}</span>
                        <span>•</span>
                        <span>{v.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
