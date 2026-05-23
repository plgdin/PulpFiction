import { useState, useEffect } from 'react';
import { Search, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
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
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
        isScrolled
          ? "bg-black/40 backdrop-blur-lg"
          : "bg-transparent pt-[0.55rem]"
      )}
    >
      <div className="px-[1.15rem] md:px-14 py-[1.15rem]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-9">
            <Link to="/" className="block">
              <h1 className="font-display text-[1.4rem] sm:text-[1.72rem] md:text-[2.16rem] text-primary text-shadow-glow tracking-wider hover:text-primary/90 transition-colors cursor-pointer">
                TARUN KAPOOR
              </h1>
            </Link>

            {/* Category links - Desktop */}
            <div className="hidden lg:flex items-center gap-7">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryClick(category)}
                  className="text-base font-medium font-header uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors text-shadow-glow"
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-5">
            {/* Behance link */}
            <a
              href="https://www.behance.net/tarunkapoor2"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-primary font-medium text-shadow-glow hover:text-primary/80 transition-colors"
            >
              <span className="text-base text-shadow-glow">Behance</span>
              <ExternalLink className="w-[1.15rem] h-[1.15rem] drop-shadow-[0_0_8px_rgba(245,212,103,0.8)]" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
