import { useNavigate } from 'react-router-dom';
import { VideoCategory } from '@/types/video';
import NavigationMenu, {
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/8bit-navigation-menu';

interface NavbarProps {
  categories: VideoCategory[];
  onSearch: (query: string) => void;
  onCategoryClick: (category: VideoCategory) => void;
}

const Navbar = ({ categories, onSearch, onCategoryClick }: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full border-b-4 border-primary/30 bg-black/80 backdrop-blur-md sticky top-0 z-[100] px-4 md:px-12 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Retro Logo */}
      <div 
        onClick={() => navigate("/")}
        className="cursor-pointer border-2 border-primary px-3 py-1 bg-primary/10 text-primary font-bold text-shadow-glow hover:scale-105 active:scale-95 transition-all retro text-xs md:text-sm tracking-wide"
      >
        TK.EXE
      </div>

      {/* 8-bit Custom Navigation Menu */}
      <NavigationMenu className="z-[110]">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="retro text-[10px] md:text-xs">SYSTEM</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 p-3 w-48 bg-zinc-950 border border-primary/20">
                <li>
                  <NavigationMenuLink 
                    className="block p-2 text-stone-300 hover:text-primary transition-colors cursor-pointer retro text-[10px]"
                    onClick={() => navigate("/")}
                  >
                    HOME_SITE
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink 
                    className="block p-2 text-stone-300 hover:text-primary transition-colors cursor-pointer retro text-[10px]"
                    onClick={() => navigate("/about")}
                  >
                    ABOUT_ME
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="retro text-[10px] md:text-xs">QUESTS</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 p-3 w-48 bg-zinc-950 border border-primary/20">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <NavigationMenuLink 
                      className="block p-2 text-stone-300 hover:text-primary transition-colors cursor-pointer retro text-[10px]"
                      onClick={() => onCategoryClick(cat)}
                    >
                      {cat.title.toUpperCase().replace(/ /g, '_')}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Floating Status */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-[10px] text-stone-500 retro">CREDITS: 99</span>
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
      </div>
    </div>
  );
};

export default Navbar;
