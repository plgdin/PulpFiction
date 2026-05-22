import { useMemo, useState, useEffect, type SyntheticEvent } from 'react';
import { Play, ExternalLink, Volume2, VolumeX, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Video } from '@/types/video';
import { HeroContent } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import heroBg from '@/assets/hero-bg.jpg';

const CONTENT_COLLAPSE_DELAY_MS = 7000;
const TITLE_MOTION_MS = 1400;
const OLA_VIDEO_ID = 'ad-5';
const OLA_VIDEO_STREAM =
  'https://vz-5e858353-fc6.b-cdn.net/6a889e8c-7d03-44de-938d-1c5a7ddd2e0b/playlist.m3u8';

interface HeroSectionProps {
  video: Video;
  videos: Video[];
  heroContent: HeroContent;
  onPlay: (video: Video) => void;
}

type HeroSlide = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  previewUrl: string;
  hasVideoPreview: boolean;
  video: Video;
};

const isPlayableHeroVideo = (url: string) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('.m3u8') || lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov');
};

/** Extract the dominant color from an image via a tiny offscreen canvas */
const extractDominantColor = (imgSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 10;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('20, 20, 20'); return; }
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] + data[i+1] + data[i+2] > 60) {
            r += data[i]; g += data[i+1]; b += data[i+2]; count++;
          }
        }
        if (count === 0) { resolve('20, 20, 20'); return; }
        resolve(`${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)}`);
      } catch {
        resolve('20, 20, 20');
      }
    };
    img.onerror = () => resolve('20, 20, 20');
    img.src = imgSrc;
  });
};

const HeroSection = ({
  video,
  videos,
  heroContent,
  onPlay,
}: HeroSectionProps) => {
  const slides = useMemo<HeroSlide[]>(() => {
    const cmsSlides = (heroContent.slideshowVideos || [])
      .map((videoId) => videos.find((item) => item.id === videoId))
      .filter((item): item is Video => Boolean(item));

    const olaSourceVideo =
      videos.find((item) => item.id === OLA_VIDEO_ID) ||
      videos.find((item) => item.videoUrl === OLA_VIDEO_STREAM) ||
      videos.find((item) => item.title.toLowerCase().includes('ola'));

    const orderedVideos: Video[] = cmsSlides.length > 0
      ? cmsSlides
      : olaSourceVideo
        ? [olaSourceVideo, ...videos.filter((item) => item.id !== olaSourceVideo.id)]
        : [...videos];

    const playableVideos = orderedVideos.filter((item) => isPlayableHeroVideo(item.videoUrl));
    const selectedVideos = playableVideos.slice(0, 5);
    const safeVideos = selectedVideos.length > 0 ? selectedVideos : (isPlayableHeroVideo(video.videoUrl) ? [video] : []);
    const fallbackImage =
      heroContent.backgroundImage ||
      heroContent.featuredVideoThumbnail ||
      heroBg;

    if (safeVideos.length === 0) {
      return [
        {
          id: 'hero-fallback',
          title: heroContent.title || video.title,
          description: heroContent.description || video.description,
          thumbnail: fallbackImage,
          previewUrl: '',
          hasVideoPreview: false,
          video,
        },
      ];
    }

    return safeVideos.map((item) => {
      const hasCdnVideo = item.videoUrl.includes('.b-cdn.net');
      const previewUrl = hasCdnVideo
        ? item.videoUrl.replace('/playlist.m3u8', '/play_720p.mp4')
        : item.videoUrl;

      return {
        id: item.id,
        title: item.title || heroContent.title || video.title,
        description: item.description || heroContent.description || video.description,
        thumbnail: item.thumbnail || fallbackImage,
        previewUrl,
        hasVideoPreview: isPlayableHeroVideo(previewUrl),
        video: item,
      };
    });
  }, [videos, video, heroContent]);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isTitleCompact, setIsTitleCompact] = useState(false);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [dominantColor, setDominantColor] = useState('20, 20, 20');

  const activeSlide = slides[activeSlideIndex] || slides[0];

  if (!activeSlide) return null;

  useEffect(() => {
    if (activeSlide?.thumbnail) {
      extractDominantColor(activeSlide.thumbnail).then(setDominantColor);
    }
  }, [activeSlide?.thumbnail]);

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [slides.length]);

  useEffect(() => {
    setIsTitleCompact(false);
    setIsDescriptionVisible(true);
  }, [activeSlideIndex]);

  useEffect(() => {
    if (!activeSlide || activeSlide.hasVideoPreview) return undefined;

    const timer = window.setTimeout(() => {
      setIsDescriptionVisible(false);
      setIsTitleCompact(true);
    }, CONTENT_COLLAPSE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [activeSlide]);

  const handleViewPortfolio = () => {
    const url = heroContent.portfolioUrl?.trim();
    if (!url) return;
    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNextSlide = () => {
    if (slides.length <= 1) return;
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePreviousSlide = () => {
    if (slides.length <= 1) return;
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleVideoProgress = (slideIndex: number, event: SyntheticEvent<HTMLVideoElement>) => {
    if (slideIndex !== activeSlideIndex || isTitleCompact) return;

    const playedSeconds = event.currentTarget.currentTime;
    if (playedSeconds >= 7) {
      setIsDescriptionVisible(false);
      setIsTitleCompact(true);
    }
  };

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* SVG Liquid Glass Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <filter id="hero-glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves={1} seed={17} result="turbulence" />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
            <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
            <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
          <feSpecularLighting in="softMap" surfaceScale={5} specularConstant={1} specularExponent={100} lightingColor="white" result="specLight">
            <fePointLight x={-200} y={-200} z={300} />
          </feSpecularLighting>
          <feComposite in="specLight" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="litImage" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale={200} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="absolute inset-0">
        {slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          return (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-out',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
            >
              {isActive && slide.hasVideoPreview ? (
                <video
                  src={slide.previewUrl}
                  poster={slide.thumbnail}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted={isMuted}
                  loop={false}
                  playsInline
                  onTimeUpdate={(event) => handleVideoProgress(index, event)}
                  onEnded={handleNextSlide}
                />
              ) : (
                <img
                  src={slide.thumbnail || heroBg}
                  alt={`${slide.title} background`}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic color-tinted ambient glow behind the video (Underglow) */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, rgba(${dominantColor}, 0.25) 0%, transparent 70%)`,
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-background/70 via-background/38 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[62%] bg-gradient-to-r from-background/82 via-background/48 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-b from-transparent via-background/78 to-background" />

      <div className="relative z-20 flex h-full max-w-4xl flex-col justify-end px-4 pb-20 md:px-12 md:pb-[5.5rem]">

        <div
          className="mb-5 will-change-transform"
          style={{
            transformOrigin: 'bottom left',
            transform: isTitleCompact ? 'scale(0.72)' : 'scale(1)',
            transition: `transform ${TITLE_MOTION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          <h1
            className="font-display text-[56px] leading-[0.92] tracking-tight text-primary text-shadow-cinematic md:text-[90px]"
            style={{ fontFamily: "'Antonio', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            {activeSlide?.title || video.title}
          </h1>
          <p
            className="mt-3 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg"
            style={{
              opacity: isDescriptionVisible ? 1 : 0,
              transition: `opacity ${TITLE_MOTION_MS * 0.4}ms ease-out`,
              fontFamily: "'Antonio', sans-serif",
              letterSpacing: '0.02em',
            }}
          >
            {activeSlide?.description || video.description}
          </p>
        </div>

        {/* Liquid Glass Buttons Row */}
        <div
          className="flex flex-col gap-4 animate-fade-in-up sm:flex-row sm:items-center"
          style={{ animationDelay: '0.5s' }}
        >
          <button
            className="relative flex items-center gap-3 px-8 py-3.5 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 group sm:w-auto w-full justify-center"
            onClick={() => onPlay(activeSlide?.video || video)}
            style={{
              boxShadow: `0 6px 6px rgba(0,0,0,0.2), 0 0 20px rgba(0,0,0,0.1), 0 0 40px rgba(${dominantColor}, 0.15)`,
            }}
          >
            <div className="absolute inset-0 z-0 rounded-full overflow-hidden"
              style={{ backdropFilter: 'blur(3px)', filter: 'url(#hero-glass-distortion)', isolation: 'isolate' }}
            />
            <div className="absolute inset-0 z-[1] rounded-full bg-white/90" />
            <div className="absolute inset-0 z-[2] rounded-full overflow-hidden"
              style={{ boxShadow: 'inset 2px 2px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 1px 1px rgba(255,255,255,0.5)' }}
            />
            <Play className="relative z-[3] h-5 w-5 fill-current text-black" />
            <span
              className="relative z-[3] font-bold text-black text-lg tracking-[0.15em]"
              style={{ fontFamily: "'Antonio', sans-serif" }}
            >
              {heroContent.ctaPrimaryText || 'VIEW REEL'}
            </span>
          </button>

          <button
            className="relative flex items-center gap-3 px-8 py-3.5 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 group sm:w-auto w-full justify-center"
            onClick={handleViewPortfolio}
            style={{
              boxShadow: `0 6px 6px rgba(0,0,0,0.2), 0 0 20px rgba(0,0,0,0.1)`,
            }}
          >
            <div className="absolute inset-0 z-0 rounded-full overflow-hidden"
              style={{ backdropFilter: 'blur(10px)', filter: 'url(#hero-glass-distortion)', isolation: 'isolate' }}
            />
            <div className="absolute inset-0 z-[1] rounded-full" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
            <div className="absolute inset-0 z-[2] rounded-full overflow-hidden border border-white/25"
              style={{ boxShadow: 'inset 2px 2px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 1px 1px rgba(255,255,255,0.2)' }}
            />
            <ExternalLink className="relative z-[3] h-5 w-5 text-white" />
            <span
              className="relative z-[3] font-bold text-white text-lg tracking-[0.15em]"
              style={{ fontFamily: "'Antonio', sans-serif" }}
            >
              {heroContent.ctaSecondaryText || 'PORTFOLIO'}
            </span>
          </button>

          <button
            className="relative hidden sm:flex items-center justify-center w-12 h-12 rounded-full overflow-hidden transition-all duration-500 hover:scale-110"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <div className="absolute inset-0 z-0 rounded-full overflow-hidden"
              style={{ backdropFilter: 'blur(10px)', filter: 'url(#hero-glass-distortion)', isolation: 'isolate' }}
            />
            <div className="absolute inset-0 z-[1] rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
            <div className="absolute inset-0 z-[2] rounded-full overflow-hidden border border-white/20"
              style={{ boxShadow: 'inset 1px 1px 1px 0 rgba(255,255,255,0.3)' }}
            />
            <Plus className="relative z-[3] h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {activeSlide.hasVideoPreview && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-24 right-4 z-20 h-12 w-12 rounded-full border-2 border-primary/85 bg-black/35 text-primary transition-all duration-300 hover:bg-black/35 hover:text-primary hover:shadow-[0_0_24px_hsl(var(--primary)/0.65)] md:bottom-24 md:right-10"
          onClick={() => setIsMuted((prev) => !prev)}
          aria-label={isMuted ? 'Unmute hero video' : 'Mute hero video'}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 bg-transparent p-0 text-primary transition-all duration-300 hover:text-primary hover:drop-shadow-[0_0_16px_hsl(var(--primary)/0.95)] md:left-8"
            onClick={handlePreviousSlide}
            aria-label="Previous hero video"
          >
            <ChevronLeft className="h-11 w-11 drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 bg-transparent p-0 text-primary transition-all duration-300 hover:text-primary hover:drop-shadow-[0_0_16px_hsl(var(--primary)/0.95)] md:right-8"
            onClick={handleNextSlide}
            aria-label="Next hero video"
          >
            <ChevronRight className="h-11 w-11 drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
          </button>
        </>
      )}
    </section>
  );
};

export default HeroSection;