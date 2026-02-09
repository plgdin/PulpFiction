import { Play, ExternalLink } from 'lucide-react';
import { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';
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
        {/* Featured badge */}
        <div className="mb-4 animate-fade-in-up" style={{
        animationDelay: '0.1s'
      }}>
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest bg-accent text-accent-foreground rounded">
            Director Actor & writer    
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-primary leading-tight text-shadow-cinematic animate-fade-in-up" style={{
        animationDelay: '0.2s'
      }}>
          {video.title}
        </h1>

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
        <div className="flex flex-wrap gap-4 mt-8 animate-fade-in-up" style={{
        animationDelay: '0.5s'
      }}>
          <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg px-8" onClick={() => onPlay(video)}>
            <Play className="w-5 h-5 fill-current" />
            View Reel
          </Button>
          <Button variant="outline" size="lg" className="gap-2 border-primary/50 text-primary hover:bg-primary/10 font-display text-lg px-8" onClick={handleViewPortfolio}>
            <ExternalLink className="w-5 h-5" />
            Full Portfolio
          </Button>
        </div>
      </div>
    </section>;
};
export default HeroSection;