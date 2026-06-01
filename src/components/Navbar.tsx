import { useState, useEffect, useRef } from 'react';
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
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let lastKnownScrollY = 0;
    let ticking = false;

    const updateScroll = () => {
      setIsScrolled(lastKnownScrollY > 50);
      ticking = false;
    };

    const handleScroll = () => {
      lastKnownScrollY = window.scrollY;
      if (!ticking) {
        rafRef.current = requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
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
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-colors text-shadow-glow"
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-5">
            {/* About link */}
            <Link
              to="/about"
              className="hidden md:flex items-center gap-2 text-primary font-medium text-shadow-glow hover:text-primary/80 transition-colors"
            >
              <span className="text-base text-shadow-glow">About</span>
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
