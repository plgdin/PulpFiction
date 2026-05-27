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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl my-8 mx-auto rounded-[28px] overflow-hidden"
        style={{
          background: 'rgba(14, 14, 16, 0.68)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(245, 212, 103, 0.18)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(245,212,103,0.15) inset',
        }}
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
            "relative aspect-video w-full bg-transparent group",
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent flex flex-col justify-end p-5 sm:p-10 pointer-events-none">
              {/* Title */}
              <h2 
                className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-8 leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,1)] w-full sm:w-3/4"
                style={{ 
                  fontFamily: "'Antonio', sans-serif", 
                  letterSpacing: '0.04em', 
                  textTransform: 'uppercase'
                }}
              >
                {video.title}
              </h2>

              {/* Buttons Row */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
                    onClick={() => {
                      setIsPlayingFull(true);
                      setIsMuted(false);
                      seekToZero();

                      setTimeout(() => {
                        if (playerRef.current) {
                          if (typeof playerRef.current.play === 'function') {
                            const playPromise = playerRef.current.play();
                            if (playPromise !== undefined) {
                              playPromise.catch((e: any) => console.log('Play error:', e));
                            }
                          } else if (playerRef.current.getInternalPlayer) {
                            const internalPlayer = playerRef.current.getInternalPlayer();
                            if (internalPlayer && typeof internalPlayer.play === 'function') {
                               const playPromise = internalPlayer.play();
                               if (playPromise !== undefined) {
                                 playPromise.catch((e: any) => console.log('Play error:', e));
                               }
                            }
                          }
                        }
                      }, 50);

                      if (containerRef.current) {
                        try {
                          if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
                          else if ((containerRef.current as any).webkitRequestFullscreen) (containerRef.current as any).webkitRequestFullscreen();
                          else if ((containerRef.current as any).msRequestFullscreen) (containerRef.current as any).msRequestFullscreen();
                        } catch (e) {
                          console.log("Fullscreen not supported");
                        }
                      }
                    }}
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span 
                      className="font-bold text-[16px] sm:text-[18px] tracking-[0.2em] mt-0.5" 
                      style={{ fontFamily: "'Antonio', sans-serif" }}
                    >
                      PLAY
                    </span>
                  </button>

                  <button
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-105"
                    onClick={() => window.location.href = 'mailto:tarunkapoor97@gmail.com'}
                  >
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <button
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-105"
                    onClick={() => window.open('https://instagram.com/tarunkapoor2', '_blank')}
                  >
                    <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
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
        <div className="p-5 sm:p-10 pt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-5">
            <div 
              className="flex flex-wrap items-center gap-3 text-[14px] md:text-[16px] font-bold uppercase tracking-wider text-white/90"
              style={{ fontFamily: "'Antonio', sans-serif", letterSpacing: '0.08em' }}
            >
              <span className="px-3 py-1 rounded bg-white/10 border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-white font-extrabold">
                {video.year || '2024'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
              <span className="truncate text-white/80">{video.category?.replace('-', ' ')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
              <span className="text-primary font-extrabold drop-shadow-[0_0_8px_rgba(245,212,103,0.4)]">1080P</span>
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
          <div className="p-5 sm:p-10 pt-4">
            <h3 
              className="text-3xl sm:text-4xl font-bold text-white mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,1)]"
              style={{ fontFamily: "'Antonio', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}
            >
              MORE LIKE THIS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {moreVideos.map((v, index) => (
                <div
                  key={v.id}
                  className="video-card aspect-video cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handlePlayRelated(v)}
                >
                  <div className="group relative h-full w-full overflow-hidden rounded-[16px] bg-black/40 border border-white/10 shadow-lg shadow-black/50">
                    <img
                      src={v.thumbnail || (v.videoUrl?.includes('.b-cdn.net') ? v.videoUrl.replace('/play_720p.mp4', '/thumbnail.jpg').replace('/playlist.m3u8', '/thumbnail.jpg') : '/placeholder.svg')}
                      alt={v.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/40 to-transparent opacity-95" />
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] transform transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform transition-transform duration-300">
                      <h3 
                        className="text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,1)] line-clamp-2"
                        style={{ fontFamily: "'Antonio', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}
                      >
                        {v.title}
                      </h3>
                      
                      <div 
                        className="flex items-center gap-2 mt-2 text-[11px] font-bold text-white/70 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                        style={{ fontFamily: "'Antonio', sans-serif", letterSpacing: '0.08em' }}
                      >
                        <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-white">{v.year || '2024'}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30"></span>
                        <span className="text-primary drop-shadow-[0_0_4px_rgba(245,212,103,0.4)]">1080P</span>
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