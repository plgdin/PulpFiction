import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Mail, Instagram, Youtube } from 'lucide-react';
import { useCms } from '@/context/CmsContext';

const FooterTypewriter = () => {
  const [baseText, setBaseText] = useState('');
  const [prefixText, setPrefixText] = useState('');

  type Mode = 'TYPE_BASE' | 'MOVE_CURSOR' | 'TYPE_PREFIX' | 'DELETE_PREFIX' | 'PAUSE';
  const [mode, setMode] = useState<Mode>('TYPE_BASE');

  const [cursorIndex, setCursorIndex] = useState(0);

  const roles = ["Writer", "Actor", "Director"];
  const [roleIndex, setRoleIndex] = useState(0);
  const targetBase = "TARUN\u00A0KAPOOR";

  // Only run the typewriter when the footer is visible
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return; // Pause when off-screen

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
  }, [baseText, prefixText, mode, cursorIndex, roleIndex, isVisible]);

  const Cursor = () => (
    <span className="inline-flex w-0 justify-center overflow-visible align-baseline">
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
    <h3 ref={containerRef} className="text-xl md:text-2xl text-primary mb-4 whitespace-pre-wrap retro">
      {renderText()}
    </h3>
  );
};

const Footer = () => {
  const { data } = useCms();

  return (
    <footer className="bg-zinc-950 border-t-4 border-primary/30 py-12 px-4 md:px-12 mt-12 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <FooterTypewriter />
            <p className="text-stone-400 text-sm leading-relaxed retro-text text-[16px]">
              Crafting visual stories that move, inspire, and captivate.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="retro uppercase tracking-wider font-bold text-[10px] md:text-xs text-primary mb-4">QUEST_LOG</h4>
            <ul className="space-y-2">
              <li>
                <a href="#ad-films" className="text-stone-400 hover:text-primary transition-colors text-[13px] retro-text tracking-wider">
                  {'>'} AD_FILMS
                </a>
              </li>
              <li>
                <a href="#music-videos" className="text-stone-400 hover:text-primary transition-colors text-[13px] retro-text tracking-wider">
                  {'>'} MUSIC_VIDEOS
                </a>
              </li>
              <li>
                <a href="#brand-films" className="text-stone-400 hover:text-primary transition-colors text-[13px] retro-text tracking-wider">
                  {'>'} BRAND_FILMS
                </a>
              </li>
              <li>
                <a href="#short-films" className="text-stone-400 hover:text-primary transition-colors text-[13px] retro-text tracking-wider">
                  {'>'} SHORT_FILMS
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="retro uppercase tracking-wider font-bold text-[10px] md:text-xs text-primary mb-4">CHANNELS</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "EMAIL", icon: Mail, url: data.siteSettings.email ? `mailto:${data.siteSettings.email}` : "#" },
                { label: "BEHANCE", icon: ExternalLink, url: data.siteSettings.behanceUrl },
                { label: "INSTA", icon: Instagram, url: data.siteSettings.instagramUrl },
                { label: "YOUTUBE", icon: Youtube, url: data.siteSettings.youtubeUrl },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="pixel-btn text-center flex items-center justify-center gap-2 py-2 text-[8px]"
                >
                  <social.icon className="w-3 h-3" />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t-2 border-stone-800">
          <p className="text-center text-[10px] text-stone-500 retro tracking-widest">
            © {new Date().getFullYear()} TARUN_KAPOOR.EXE // ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
