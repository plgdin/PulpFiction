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
   RPG Dialogue Box
   ========================================== */
const PixelDialogueBox = ({ 
  title, 
  text, 
  icon: Icon
}: { 
  title: string; 
  text: string; 
  icon?: any;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [text, isVisible]);

  return (
    <div 
      ref={containerRef}
      className="w-full bg-zinc-950 p-6 md:p-8 pixel-border-gold relative flex flex-col gap-4 text-left"
    >
      {/* Glowing Header Tab */}
      <div className="absolute -top-6 left-6 bg-black px-4 py-1.5 border-2 border-primary text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary retro">
        {title}
      </div>

      <div className="flex items-start gap-4 mt-2">
        {Icon && (
          <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded shadow-[0_0_12px_rgba(245,212,103,0.3)] shrink-0">
            <Icon className="w-6 h-6 animate-pulse" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-[18px] md:text-[24px] retro-text leading-relaxed tracking-wider text-stone-200">
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-2.5 h-4 bg-primary ml-1 animate-blink" />
            )}
          </p>
        </div>
      </div>
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
    <section className="w-full flex flex-col gap-12 items-center max-w-7xl mx-auto px-4 md:px-12 pt-16 pb-8">
      {/* Stage Header */}
      <div className="w-full flex justify-between items-center border-b-2 border-stone-800 pb-3">
        <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">STG. 00 // MAIN REEL</span>
        <span className="text-primary/70 text-xs font-mono">OK-PLAY_2026</span>
      </div>

      {/* Retro Name Typewriter */}
      <RetroRoleTypewriter targetName="TARUN KAPOOR" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start mt-6">
        
        {/* Left: Pixel Frame Featured Thumbnail */}
        <div className="lg:col-span-5 flex flex-col gap-4 items-center justify-center">
          <div 
            className="w-full max-w-[480px] aspect-video bg-zinc-900 overflow-hidden pixel-border-gold p-2 relative group cursor-pointer"
            onClick={() => onPlay(video)}
          >
            {/* 8-bit Bracket overlay highlights */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
            
            <img 
              src={thumbnailSrc} 
              alt={video.title} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 contrast-125 saturate-150 transition-all duration-300"
            />

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 bg-primary/80 flex items-center justify-center border-2 border-primary shadow-[0_0_20px_rgba(245,212,103,0.5)]">
                <Play className="w-8 h-8 text-black fill-black ml-1" />
              </div>
            </div>
          </div>
          <span className="text-[10px] text-stone-500 tracking-widest font-mono uppercase">FEATURED_REEL.MP4 [1920x1080]</span>
        </div>

        {/* Right: RPG Dialogue Panel + CTA */}
        <div className="lg:col-span-7 flex flex-col gap-8 w-full">
          <PixelDialogueBox 
            title="REEL_INFO.TXT" 
            text={heroContent.description || video.description} 
            icon={Play}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="pixel-btn text-center flex items-center justify-center gap-3 py-3 px-6"
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
                className="pixel-btn text-center flex items-center justify-center gap-3 py-3 px-6"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{heroContent.ctaSecondaryText || 'PORTFOLIO'}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;