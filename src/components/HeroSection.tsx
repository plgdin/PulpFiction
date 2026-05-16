import { useState, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';

const TypewriterTitle = () => {
  const [baseText, setBaseText] = useState('');
  const [prefixText, setPrefixText] = useState('');

  type Mode = 'TYPE_BASE' | 'MOVE_CURSOR' | 'TYPE_PREFIX' | 'DELETE_PREFIX' | 'PAUSE';
  const [mode, setMode] = useState<Mode>('TYPE_BASE');

  const [cursorIndex, setCursorIndex] = useState(0);

  const roles = ["Writer", "Actor", "Director"];
  const [roleIndex, setRoleIndex] = useState(0);
  const targetBase = "TARUN\u00A0KAPOOR";

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (mode === 'TYPE_BASE') {
      if (baseText.length < targetBase.length) {
        timer = setTimeout(() => {
          setBaseText(targetBase.slice(0, baseText.length + 1));
          setCursorIndex(baseText.length + 1);
        }, 120);
      } else {
        timer = setTimeout(() => setMode('MOVE_CURSOR'), 1000);
      }
    }
    else if (mode === 'MOVE_CURSOR') {
      if (cursorIndex > 0) {
        timer = setTimeout(() => setCursorIndex(prev => prev - 1), 120);
      } else {
        timer = setTimeout(() => setMode('TYPE_PREFIX'), 400);
      }
    }
    else if (mode === 'TYPE_PREFIX') {
      const currentRole = roles[roleIndex].toUpperCase();
      if (prefixText.length < currentRole.length) {
        timer = setTimeout(() => setPrefixText(currentRole.slice(0, prefixText.length + 1)), 100);
      } else {
        setMode('PAUSE');
      }
    }
    else if (mode === 'PAUSE') {
      timer = setTimeout(() => setMode('DELETE_PREFIX'), roleIndex === 2 ? 3000 : 1500);
    }
    else if (mode === 'DELETE_PREFIX') {
      if (prefixText.length > 0) {
        timer = setTimeout(() => setPrefixText(prefixText.slice(0, prefixText.length - 1)), 60);
      } else {
        setRoleIndex((prev) => (prev + 1) % roles.length);
        setMode('TYPE_PREFIX');
      }
    }

    return () => clearTimeout(timer);
  }, [baseText, prefixText, mode, cursorIndex, roleIndex]);

  const Cursor = () => (
    <span className="inline-flex w-0 justify-center overflow-visible align-baseline">
      {/* 
        To adjust the vertical position of the cursor, change the '-translate-y-[0.1em]' value below. 
        Increase the number (e.g. 0.15em) to move it higher, decrease it (e.g. 0.05em) to move it lower.
      */}
      <span className="animate-blink font-light text-primary/80 -translate-y-[0.05em]">|</span>
    </span>
  );

  const renderText = () => {
    if (mode === 'TYPE_BASE') {
      return <>{baseText}<Cursor /></>;
    }

    if (mode === 'MOVE_CURSOR') {
      const beforeCursor = baseText.slice(0, cursorIndex);
      const afterCursor = baseText.slice(cursorIndex);
      return (
        <>
          {beforeCursor}<Cursor />{afterCursor}
        </>
      );
    }

    return (
      <>
        {prefixText}<Cursor />{prefixText.length > 0 ? '\u00A0' : ''}{baseText}
      </>
    );
  };

  return (
    <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-primary leading-tight text-shadow-cinematic animate-fade-in-up whitespace-pre-wrap" style={{ animationDelay: '0.2s' }}>
      {renderText()}
    </h1>
  );
};

interface HeroSectionProps {
  video: Video;
  onPlay: (video: Video) => void;
}

const HeroSection = ({
  video,
  onPlay
}: HeroSectionProps) => {
  const handleViewPortfolio = () => {
    window.open('https://www.behance.net/tarunkapoor2', '_blank', 'noopener,noreferrer');
  };
  return <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
    {/* Background image */}
    <div className="absolute inset-0">
      <img src={heroBg} alt="Featured video background" className="w-full h-full object-cover" />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute inset-0 bg-background/20" />
    </div>

    {/* Content */}
    <div className="relative h-full flex flex-col justify-end pb-24 px-4 md:px-12 max-w-4xl">

      {/* Title */}
      <TypewriterTitle />

      {/* Meta info */}
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground animate-fade-in-up" style={{
        animationDelay: '0.3s'
      }}>
        <span className="text-primary font-semibold">Bangalore, India</span>
        <span>•</span>
        <span>Available for Freelance & Fulltime</span>
      </div>

      {/* Description */}
      <p className="mt-4 text-base md:text-lg text-foreground/90 max-w-2xl leading-relaxed animate-fade-in-up" style={{
        animationDelay: '0.4s'
      }}>
        {video.description}
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in-up" style={{
        animationDelay: '0.5s'
      }}>
        <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary hover:shadow-[0_0_20px_hsl(var(--primary))] transition-all duration-300 font-display text-lg px-8" onClick={() => onPlay(video)}>
          <Play className="w-5 h-5 fill-current" />
          View Reel
        </Button>
        <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary))] transition-all duration-300 font-display text-lg px-8" onClick={handleViewPortfolio}>
          <ExternalLink className="w-5 h-5" />
          Full Portfolio
        </Button>
      </div>
    </div>
  </section>;
};
export default HeroSection;