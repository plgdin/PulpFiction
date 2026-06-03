import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCms } from "@/context/CmsContext";
import { Mail, Instagram, Youtube, ExternalLink, Play, Sparkles, Trophy, Flame, Swords, Shield } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { motion, AnimatePresence } from "framer-motion";
import NavigationMenu, {
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/8bit-navigation-menu";

/* ==========================================
   Retro CRT Scanline Scan Overlay
   ========================================== */
const CrtScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative crt-overlay bg-black min-h-screen text-stone-100 font-mono overflow-hidden">
      {/* Glare effect inside screen */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-tr from-transparent via-white/5 to-transparent mix-blend-overlay"></div>
      {children}
    </div>
  );
};

/* ==========================================
   RPG Dialogue Box / Text Typing Reveal
   ========================================== */
const PixelDialogueBox = ({ 
  title, 
  text, 
  icon: Icon,
  accentColor = "#f5d467" 
}: { 
  title: string; 
  text: string; 
  icon?: any;
  accentColor?: string;
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

/* ==========================================
   RPG Stats / Character Display Component
   ========================================== */
const CharacterStats = ({ accent = "#f5d467" }) => {
  const stats = [
    { name: "CINEMATOGRAPHY", level: 99, icon: Trophy },
    { name: "STORYTELLING", level: 95, icon: Swords },
    { name: "CREATIVE VISION", level: 98, icon: Flame },
    { name: "RELIABILITY", level: 100, icon: Shield },
  ];

  return (
    <div className="w-full bg-zinc-950 p-6 pixel-border-gold flex flex-col gap-5 text-left">
      <div className="border-b border-primary/20 pb-3 flex justify-between items-center">
        <span className="text-[12px] md:text-sm font-bold uppercase text-primary retro">CHARACTER STATS</span>
        <span className="text-[10px] text-stone-500 font-mono tracking-widest">LVL. 99</span>
      </div>

      <div className="flex flex-col gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] md:text-[12px] font-bold text-stone-300 retro">
              <span className="flex items-center gap-2">
                <stat.icon className="w-3.5 h-3.5 text-primary" />
                {stat.name}
              </span>
              <span className="text-primary font-bold">LVL {stat.level}</span>
            </div>
            {/* 8-bit Progress Bar */}
            <div className="h-6 w-full border-2 border-stone-800 bg-black p-0.5 relative overflow-hidden">
              <div 
                className="h-full bg-primary shadow-[inset_-4px_0px_0px_0px_#d9b841]" 
                style={{ width: `${stat.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
   About Page - Retro Variant
   ========================================== */
const About = () => {
  const { data } = useCms();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (category: any) => {
    navigate(`/?category=${category.slug}`);
  };

  return (
    <CrtScreen>
      {/* 8-bit styled retro topbar navigation */}
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
                  <li>
                    <NavigationMenuLink 
                      className="block p-2 text-stone-300 hover:text-primary transition-colors cursor-pointer retro text-[10px]"
                      onClick={() => navigate("/#ad-films")}
                    >
                      AD_FILMS
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink 
                      className="block p-2 text-stone-300 hover:text-primary transition-colors cursor-pointer retro text-[10px]"
                      onClick={() => navigate("/#music-videos")}
                    >
                      MUSIC_CLIPS
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Floating Play / Action Hint */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[10px] text-stone-500 retro">CREDITS: 99</span>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-12 py-16 flex flex-col gap-24 relative z-20">
        
        {/* ================= HERO: CHARACTER SELECT SCREEN ================= */}
        <section className="w-full flex flex-col gap-12 items-center">
          <div className="w-full flex justify-between items-center border-b-2 border-stone-800 pb-3">
            <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">SELECT CHARACTER</span>
          </div>

          <RetroRoleTypewriter targetName={data.aboutContent.name.toUpperCase()} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start mt-6">
            
            {/* Left: Pixel Frame Portrait */}
            <div className="lg:col-span-5 flex flex-col gap-4 items-center justify-center">
              <div className="w-full max-w-[400px] aspect-[4/5] bg-zinc-900 overflow-hidden pixel-border-gold p-2 relative group">
                {/* 8-bit Bracket overlay highlights */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary z-30 group-hover:scale-110 transition-transform"></div>
                
                <img 
                  src={data.aboutContent.section1Image || heroBg} 
                  alt="Tarun Kapoor Portrait" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 contrast-125 saturate-150 transition-all duration-300"
                />
              </div>
              <span className="text-[10px] text-stone-500 tracking-widest font-mono uppercase">TARUN_KAPOOR_PROFILE.JPG [512x640]</span>
            </div>

            {/* Right: RPG Dialogue Panel & Stats */}
            <div className="lg:col-span-7 flex flex-col gap-8 w-full">
              <PixelDialogueBox 
                title="BIO_LOG.TXT" 
                text={data.aboutContent.description1} 
                icon={Play}
              />
              <CharacterStats />
            </div>
          </div>
        </section>

        {/* ================= STORY: ACTIVE QUEST LOG ================= */}
        <section className="w-full flex flex-col gap-12 items-center">
          <div className="w-full flex justify-between items-center border-b-2 border-stone-800 pb-3">
            <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">QUEST LOG</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
            
            {/* Story Dialogue Columns */}
            <div className="lg:col-span-7 flex flex-col gap-8 order-2 lg:order-1">
              <PixelDialogueBox 
                title="STORY_ACT_I.TXT" 
                text={data.aboutContent.description2a} 
                icon={Sparkles}
              />

              <div className="mt-4">
                <PixelDialogueBox 
                  title="STORY_ACT_II.TXT" 
                  text={data.aboutContent.description2b} 
                />
              </div>
            </div>

            {/* Story Image / Pixel Frames */}
            <div className="lg:col-span-5 flex flex-col gap-4 items-center justify-center order-1 lg:order-2">
              <div className="w-full max-w-[400px] aspect-[4/5] bg-zinc-900 overflow-hidden pixel-border-gold p-2 relative group">
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary z-30"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary z-30"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary z-30"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary z-30"></div>
                
                <img 
                  src={data.aboutContent.section2Image || "https://a.storyblok.com/f/277682/3000x3751/eaee60f06a/otto-van-den-toorn-profile-02.jpg/m/1440x0/filters:quality(60)"} 
                  alt="Story Visual" 
                  className="w-full h-full object-cover grayscale contrast-125 saturate-150 group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <span className="text-[10px] text-stone-500 tracking-widest font-mono uppercase">STORY_STILL_02.JPG [512x640]</span>
            </div>

          </div>
        </section>

        {/* ================= CONTACT: LEVEL COMPLETED / CONNECT ================= */}
        <section className="w-full flex flex-col gap-12 items-center">
          <div className="w-full flex justify-between items-center border-b-2 border-stone-800 pb-3">
            <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">LEVEL COMPLETED</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
            
            {/* Contact Visual Frame */}
            <div className="lg:col-span-5 flex flex-col gap-4 items-center justify-center">
              <div className="w-full max-w-[400px] aspect-[4/5] bg-zinc-900 overflow-hidden pixel-border-gold p-2 relative group">
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary z-30"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary z-30"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary z-30"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary z-30"></div>
                
                <img 
                  src={data.aboutContent.section3Image || heroBg} 
                  alt="Contact Visual" 
                  className="w-full h-full object-cover grayscale contrast-125 saturate-150 group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <span className="text-[10px] text-stone-500 tracking-widest font-mono uppercase">CONTACT_STILL_03.JPG [512x640]</span>
            </div>

            {/* RPG Dialogue Connect Log */}
            <div className="lg:col-span-7 flex flex-col gap-8 w-full">
              <PixelDialogueBox 
                title="CONNECT_LOG.TXT" 
                text={data.aboutContent.description3} 
              />

              {/* Action Buttons styled like retro pixel menus */}
              <div className="flex flex-col gap-4 w-full bg-zinc-950 p-6 pixel-border-gold text-left mt-2">
                <span className="text-[10px] font-bold text-stone-400 mb-2 retro uppercase block">SELECT ACTION CHANNEL:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "SEND_EMAIL", icon: Mail, url: data.siteSettings.email ? `mailto:${data.siteSettings.email}` : "#" },
                    { label: "INSTAGRAM", icon: Instagram, url: data.siteSettings.instagramUrl },
                    { label: "BEHANCE_PORTFOLIO", icon: ExternalLink, url: data.siteSettings.behanceUrl },
                    { label: "YOUTUBE_REELS", icon: Youtube, url: data.siteSettings.youtubeUrl },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="pixel-btn text-center flex items-center justify-center gap-3 py-3"
                    >
                      <social.icon className="w-4 h-4" />
                      <span>{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= ITEM FOUND: LEGENDARY QUOTE BOX ================= */}
        <section className="w-full py-12 flex justify-center">
          <div className="w-full max-w-4xl bg-zinc-950 p-8 md:p-12 pixel-border-gold relative text-center flex flex-col gap-6 shadow-[0_0_40px_rgba(245,212,103,0.15)]">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-4 py-1.5 border-2 border-primary text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary retro">
              ★ ITEM FOUND: WISDOM ★
            </div>
            
            <p className="text-2xl md:text-4xl lg:text-5xl font-bold italic tracking-wide leading-snug retro-text text-stone-200 mt-4">
              "{data.aboutContent.quote}"
            </p>
            
            <div className="flex items-center justify-center gap-3 text-stone-500 font-bold text-xs uppercase tracking-widest retro">
              <span>-- AUTHOR:</span>
              <span className="text-primary font-bold">{data.aboutContent.quoteAuthor}</span>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </CrtScreen>
  );
};

export default About;
