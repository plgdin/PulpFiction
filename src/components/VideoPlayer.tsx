import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { X, Play, Volume2, VolumeX, Mail, Instagram } from 'lucide-react';
import { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCms } from '@/context/CmsContext';
import { useSearchParams } from 'react-router-dom';

const Player = lazy(() => import('react-player')) as any;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl my-8 mx-auto bg-zinc-950 p-6 pixel-border-gold flex flex-col gap-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tab */}
        <div className="absolute -top-6 left-6 bg-black px-4 py-1.5 border-2 border-primary text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary retro">
          VIEW_REEL.EXE
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-6 right-6 pixel-btn text-center flex items-center justify-center gap-2 py-1 px-3"
        >
          <X className="w-3 h-3" />
          <span>CLOSE</span>
        </button>

        {/* Video Player */}
        <div
          ref={containerRef}
          className={cn(
            "relative aspect-video w-full bg-zinc-900 border-4 border-stone-800 p-1 relative overflow-hidden group",
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
              <Suspense fallback={<div className="w-full h-full bg-zinc-950 flex items-center justify-center retro text-stone-500">LOADING_DECODER...</div>}>
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
                  config={PLAYER_CONFIG as any}
                />
              </Suspense>
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
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex flex-col justify-end p-6 pointer-events-none z-20">
              {/* Title */}
              <h2 
                className="text-2xl sm:text-4xl font-bold text-primary mb-6 leading-none retro tracking-wide text-shadow-glow"
              >
                {video.title.toUpperCase()}
              </h2>

              {/* Buttons Row */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <div className="flex items-center gap-3">
                  <button
                    className="pixel-btn flex items-center gap-2 py-2 px-5"
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
                    <Play className="w-4 h-4 text-black fill-black" />
                    <span>PLAY</span>
                  </button>

                  <button
                    className="pixel-btn flex items-center justify-center p-2.5"
                    onClick={() => window.location.href = 'mailto:tarunkapoor97@gmail.com'}
                  >
                    <Mail className="w-4 h-4" />
                  </button>

                  <button
                    className="pixel-btn flex items-center justify-center p-2.5"
                    onClick={() => window.open('https://instagram.com/tarunkapoor2', '_blank')}
                  >
                    <Instagram className="w-4 h-4" />
                  </button>
                </div>

                {/* Mute Toggle */}
                <button
                  className="pixel-btn flex items-center justify-center p-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-zinc-950 p-6 pixel-border-gold relative flex flex-col gap-4 text-left">
          <div className="absolute -top-6 left-6 bg-black px-4 py-1.5 border-2 border-primary text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary retro">
            QUEST_LOG.TXT
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 mt-2 retro">
            <span className="text-primary">
              YEAR: {video.year || '2024'}
            </span>
            <span>//</span>
            <span>CAT: {video.category?.replace('-', ' ').toUpperCase()}</span>
            <span>//</span>
            <span className="text-emerald-500">1080P_OK</span>
          </div>

          <p className="text-[18px] md:text-[24px] retro-text leading-relaxed tracking-wider text-stone-200">
            {video.description}
          </p>
        </div>

        {/* More Like This Section */}
        {moreVideos.length > 0 && (
          <div className="w-full flex flex-col gap-6">
            <div className="w-full flex justify-between items-center border-b-2 border-stone-800 pb-3">
              <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">MORE LIKE THIS</span>
              <span className="text-primary/70 text-xs font-mono">RECOMMENDED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreVideos.slice(0, 3).map((v, index) => {
                const relatedThumb = v.thumbnail || (v.videoUrl?.includes('.b-cdn.net') ? v.videoUrl.replace('/play_720p.mp4', '/thumbnail.jpg').replace('/playlist.m3u8', '/thumbnail.jpg') : '/placeholder.svg');
                return (
                  <div
                    key={v.id}
                    className="relative cursor-pointer group"
                    onClick={() => handlePlayRelated(v)}
                  >
                    <div className="w-full aspect-video bg-zinc-900 overflow-hidden pixel-border-gold p-1.5 relative">
                      <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
                      <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
                      <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
                      <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
                      
                      <img
                        src={relatedThumb}
                        alt={v.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 contrast-125 saturate-150 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-primary/80 flex items-center justify-center border-2 border-primary shadow-[0_0_12px_rgba(245,212,103,0.5)]">
                          <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-1">
                      <h3 className="text-[10px] md:text-xs font-bold text-primary retro uppercase tracking-wide truncate">
                        {v.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;