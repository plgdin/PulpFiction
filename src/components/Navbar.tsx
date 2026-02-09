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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled 
          ? "bg-background/95 backdrop-blur-md shadow-lg" 
          : "bg-gradient-to-b from-background/80 to-transparent"
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
            {/* Search */}
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 animate-slide-in-right">
                <Input
                  type="search"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 md:w-64 bg-secondary border-border focus:border-primary"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    onSearch('');
                  }}
                  className="text-primary hover:bg-primary/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="text-primary hover:bg-primary/10"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}

            {/* Behance link */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex gap-2 text-muted-foreground hover:text-primary"
              asChild
            >
              <a
                href="https://www.behance.net/tarunkapoor2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-sm">Behance</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
