import { useState, useEffect, useRef } from 'react';
import { Play, ExternalLink, Sparkles } from 'lucide-react';
import { Video } from '@/types/video';
import { HeroContent } from '@/types/cms';
import heroBg from '@/assets/hero-bg.jpg';

/* ==========================================
   Retro Typewriter Component
   ========================================== */
const RetroRoleTypewriter = ({ targetName = "TARUN KAPOOR" }: { targetName?: string }) => {
  const [role, setRole] = useState("");
  const [roleIdx, setRoleIdx] = useState(0);
  const roles = ["DIRECTOR", "CINEMATOGRAPHER", "CREATOR", "STORYTELLER"];
  const [mode, setMode] = useState<"typing" | "deleting" | "pause">("typing");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const current = roles[roleIdx];

    if (mode === "typing") {
      if (role.length < current.length) {
        timer = setTimeout(() => {
          setRole(current.slice(0, role.length + 1));
        }, 100);
      } else {
        timer = setTimeout(() => setMode("pause"), 2000);
      }
    } else if (mode === "pause") {
      timer = setTimeout(() => setMode("deleting"), 1500);
    } else if (mode === "deleting") {
      if (role.length > 0) {
        timer = setTimeout(() => {
          setRole(role.slice(0, role.length - 1));
        }, 60);
      } else {
        setRoleIdx((prev) => (prev + 1) % roles.length);
        setMode("typing");
      }
    }

    return () => clearTimeout(timer);
  }, [role, mode, roleIdx]);

  return (
    <div className="flex flex-col items-center justify-center text-center gap-2">
      <h1 
        className="text-[8vw] md:text-[6vw] lg:text-[5vw] text-primary font-bold uppercase tracking-wider text-shadow-glow retro leading-none"
        style={{ textShadow: "4px 4px 0px #000, 0 0 20px rgba(245,212,103,0.3)" }}
      >
        {targetName}
      </h1>
      <div className="flex items-center gap-3 mt-4">
        <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">ACTIVE ROLE:</span>
        <span className="text-[20px] md:text-[28px] font-bold text-white tracking-widest retro-text bg-primary/10 border border-primary/20 px-4 py-1 flex items-center gap-2 shadow-[0_0_12px_rgba(245,212,103,0.15)]">
          <Sparkles className="w-4 h-4 text-primary animate-spin" />
          {role}
          <span className="inline-block w-2.5 h-5 bg-white ml-0.5 animate-blink" />
        </span>
      </div>
    </div>
  );
};

/* ==========================================
   CRT Television Component
   ========================================== */
const CrtTelevision = ({ 
  videoUrl,
  thumbnailSrc, 
  videoTitle, 
  onClick 
}: { 
  videoUrl: string;
  thumbnailSrc: string; 
  videoTitle: string; 
  onClick: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const getPlayableVideoUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('.b-cdn.net')) {
      return url.replace('/playlist.m3u8', '/play_720p.mp4');
    }
    // Fallback to OLA video if it is Behance / Youtube etc.
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('behance.net')) {
      return 'https://vz-dadaa479-fe6.b-cdn.net/ba463431-e658-4143-bc88-b8f8251521a0/play_720p.mp4';
    }
    return url;
  };

  const playableUrl = getPlayableVideoUrl(videoUrl);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => {
        console.log("CRT Television video autoplay failed or was blocked by browser:", err);
      });
    }
  }, [playableUrl]);

  return (
    <div className="crt-tv-wrapper" onClick={onClick}>
      {/* Antenna */}
      <div className="crt-tv-antenna">
        <div className="crt-tv-antenna-left"></div>
        <div className="crt-tv-antenna-right"></div>
        <div className="crt-tv-antenna-knob"></div>
      </div>

      {/* TV Body */}
      <div className="crt-tv-body">
        {/* Screen bezel */}
        <div className="crt-tv-bezel">
          {/* The actual screen */}
          <div className="crt-tv-screen group">
            {/* Play video if available, else thumbnail */}
            {playableUrl ? (
              <video 
                ref={videoRef}
                src={playableUrl} 
                className="crt-tv-video"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
              />
            ) : (
              <img 
                src={thumbnailSrc} 
                alt={videoTitle} 
                className="crt-tv-video"
              />
            )}

            {/* CRT screen effects stack */}
            <div className="crt-tv-scanlines"></div>
            <div className="crt-tv-rgb-pixels"></div>
            <div className="crt-tv-vignette"></div>
            <div className="crt-tv-flicker"></div>
            <div className="crt-tv-glare"></div>

            {/* Play overlay on hover */}
            <div className="crt-tv-play-overlay">
              <div className="crt-tv-play-btn">
                <Play className="w-8 h-8 text-black fill-black ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* TV Bottom Panel - Controls */}
        <div className="crt-tv-controls">
          {/* Brand label */}
          <div className="crt-tv-brand">
            <span className="retro text-[8px] md:text-[10px] tracking-[0.3em] text-stone-500">PULP·FICTION</span>
          </div>

          {/* Control knobs */}
          <div className="crt-tv-knobs">
            <div className="crt-tv-knob" title="Channel">
              <div className="crt-tv-knob-line"></div>
            </div>
            <div className="crt-tv-knob crt-tv-knob-sm" title="Volume">
              <div className="crt-tv-knob-line"></div>
            </div>
          </div>

          {/* Power LED */}
          <div className="crt-tv-power-led"></div>
        </div>
      </div>

      {/* TV Stand / Feet */}
      <div className="crt-tv-feet">
        <div className="crt-tv-foot-left"></div>
        <div className="crt-tv-foot-right"></div>
      </div>

      {/* Channel indicator overlay */}
      <div className="crt-tv-channel retro">CH-01</div>
    </div>
  );
};

interface HeroSectionProps {
  video: Video;
  videos: Video[];
  heroContent: HeroContent;
  onPlay: (video: Video) => void;
}

const HeroSection = ({ video, videos, heroContent, onPlay }: HeroSectionProps) => {
  const thumbnailSrc = video.thumbnail || heroBg;

  return (
    <section className="w-full flex flex-col gap-8 items-center max-w-7xl mx-auto px-4 md:px-12 pt-16 pb-8 text-center">
      {/* Section Header */}
      <div className="w-full flex justify-between items-center border-b-2 border-stone-800 pb-3">
        <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">MAIN REEL</span>
      </div>

      {/* Retro Name Typewriter */}
      <RetroRoleTypewriter targetName="TARUN KAPOOR" />

      {/* Centered CRT TV */}
      <div className="w-full flex flex-col items-center justify-center gap-6 mt-6">
        <CrtTelevision
          videoUrl={video.videoUrl}
          thumbnailSrc={thumbnailSrc}
          videoTitle={video.title}
          onClick={() => onPlay(video)}
        />
        <span className="text-[10px] text-stone-500 tracking-widest font-mono uppercase">FEATURED_REEL.MP4 [1920x1080]</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
        <button 
          className="pixel-btn text-center flex items-center justify-center gap-3 py-3 px-8"
          onClick={() => onPlay(video)}
        >
          <Play className="w-4 h-4" />
          <span>{heroContent.ctaPrimaryText || 'VIEW REEL'}</span>
        </button>

        {heroContent.portfolioUrl && (
          <a
            href={heroContent.portfolioUrl}
            target="_blank"
            rel="noreferrer"
            className="pixel-btn text-center flex items-center justify-center gap-3 py-3 px-8"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{heroContent.ctaSecondaryText || 'PORTFOLIO'}</span>
          </a>
        )}
      </div>
    </section>
  );
};

export default HeroSection;