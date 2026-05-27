import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Mail, Instagram, Youtube } from 'lucide-react';

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
    <h3 ref={containerRef} className="font-display text-2xl text-primary mb-4 whitespace-pre-wrap">
      {renderText()}
    </h3>
  );
};

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 px-4 md:px-12 mt-12 font-footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <FooterTypewriter />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Crafting visual stories that move, inspire, and captivate.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-footer uppercase tracking-wider font-bold text-lg text-primary mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <a href="#ad-films" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Ad Films
                </a>
              </li>
              <li>
                <a href="#music-videos" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Music Videos
                </a>
              </li>
              <li>
                <a href="#brand-films" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Brand Films
                </a>
              </li>
              <li>
                <a href="#short-films" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Short Films
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-footer uppercase tracking-wider font-bold text-lg text-primary mb-4">Connect</h4>
            <div className="flex items-center gap-4">
              <a
                href="https://www.behance.net/tarunkapoor2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@tarunkapoor.com"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Tarun Kapoor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
