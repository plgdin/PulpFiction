import { useState, useEffect } from 'react';
import { Search, X, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VideoCategory } from '@/types/video';

interface NavbarProps {
  categories: VideoCategory[];
  onSearch: (query: string) => void;
  onCategoryClick: (category: VideoCategory) => void;
}

const Navbar = ({ categories, onSearch, onCategoryClick }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "hidden md:block fixed top-0 left-0 right-0 z-40 transition-all duration-500",
        isScrolled 
          ? "bg-black/40 backdrop-blur-lg" 
          : "bg-transparent pt-2"
      )}
    >
      <div className="px-4 md:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <h1 className="font-display text-2xl md:text-3xl text-primary text-shadow-glow tracking-wider">
              TARUN KAPOOR
            </h1>

            {/* Category links - Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryClick(category)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Behance link */}
            <a
              href="https://www.behance.net/tarunkapoor2"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-primary font-medium text-shadow-glow hover:text-primary/80 transition-colors"
            >
              <span className="text-sm">Behance</span>
              <ExternalLink className="w-4 h-4 drop-shadow-[0_0_8px_rgba(245,212,103,0.8)]" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
