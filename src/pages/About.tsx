import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCms } from "@/context/CmsContext";
import { Mail, Instagram, Youtube, ExternalLink } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

/* ==========================================
   Scroll Reveal Hook
   ========================================== */
const useScrollReveal = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // only animate once
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

/* ==========================================
   Parallax Background Hook
   ========================================== */
const useParallax = (speed = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollProgress = rect.top / window.innerHeight;
    const translateY = scrollProgress * speed * 100;
    const img = el.querySelector('img');
    if (img) {
      img.style.transform = `translateY(${translateY}px) scale(1.1)`;
    }
  }, [speed]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return ref;
};

/* ==========================================
   Scroll Reveal Wrapper Component
   ========================================== */
const Reveal = ({
  children,
  variant = 'fade-up',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in' | 'blur-in';
  delay?: number;
  className?: string;
}) => {
  const { ref, isVisible } = useScrollReveal();
  const delayClass = delay > 0 ? `delay-${delay}` : '';

  return (
    <div
      ref={ref}
      className={`scroll-reveal reveal-${variant} ${delayClass} ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

/* ==========================================
   About Typewriter
   ========================================== */
const AboutTypewriter = ({ className = '', targetBase = 'Tarun Kapoor' }: { className?: string, targetBase?: string }) => {
  const [baseText, setBaseText] = useState('');
  const [prefixText, setPrefixText] = useState('');

  type Mode = 'TYPE_BASE' | 'MOVE_CURSOR' | 'TYPE_PREFIX' | 'DELETE_PREFIX' | 'PAUSE';
  const [mode, setMode] = useState<Mode>('TYPE_BASE');
  const [cursorIndex, setCursorIndex] = useState(0);

  const roles = ['Writer', 'Actor', 'Director'];
  const [roleIndex, setRoleIndex] = useState(0);

  const containerRef = useRef<HTMLHeadingElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
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
    } else if (mode === 'MOVE_CURSOR') {
      if (cursorIndex > 0) {
        timer = setTimeout(() => setCursorIndex((prev) => prev - 1), 120);
      } else {
        timer = setTimeout(() => setMode('TYPE_PREFIX'), 400);
      }
    } else if (mode === 'TYPE_PREFIX') {
      const currentRole = roles[roleIndex].toUpperCase();
      if (prefixText.length < currentRole.length) {
        timer = setTimeout(
          () => setPrefixText(currentRole.slice(0, prefixText.length + 1)),
          100,
        );
      } else {
        setMode('PAUSE');
      }
    } else if (mode === 'PAUSE') {
      timer = setTimeout(() => setMode('DELETE_PREFIX'), roleIndex === 2 ? 3000 : 1500);
    } else if (mode === 'DELETE_PREFIX') {
      if (prefixText.length > 0) {
        timer = setTimeout(
          () => setPrefixText(prefixText.slice(0, prefixText.length - 1)),
          60,
        );
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
    if (mode === 'TYPE_BASE') return <>{baseText}<Cursor /></>;
    if (mode === 'MOVE_CURSOR') {
      return (
        <>
          {baseText.slice(0, cursorIndex)}<Cursor />{baseText.slice(cursorIndex)}
        </>
      );
    }
    return (
      <span className="flex flex-wrap justify-center items-center whitespace-pre-wrap">
        {prefixText}<Cursor />{prefixText.length > 0 ? '\u00A0' : ''}{baseText}
      </span>
    );
  };

  return (
    <h1
      ref={containerRef}
      className={`leading-none font-serif tracking-tight text-center text-primary text-shadow-glow ${className}`}
      style={{ fontFamily: "'Antonio', sans-serif" }}
    >
      {renderText()}
    </h1>
  );
};

/* ==========================================
   About Page
   ========================================== */
const About = () => {
  const { data } = useCms();
  const navigate = useNavigate();

  // Parallax refs for each section background
  const parallax1 = useParallax(0.12);
  const parallax2 = useParallax(0.15);
  const parallax3 = useParallax(0.1);

  // Make sure page always starts at top
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
    <div className="bg-zinc-950 text-stone-100 font-sans selection:bg-stone-100 selection:text-zinc-950 min-h-screen">
      <Navbar categories={data.categories || []} onSearch={handleSearch} onCategoryClick={handleCategoryClick} />

      <main>
        {/* Section 1: Tarun */}
        <section className="relative w-full min-h-screen flex flex-col justify-between px-6 py-24 md:p-12 overflow-hidden">
          <div ref={parallax1} className="absolute inset-0 z-0">
            <img
              src={data.aboutContent.section1Image || heroBg}
              alt={`${data.aboutContent.name} Profile`}
              className="w-full h-full object-cover object-center opacity-50 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full grow">

            <Reveal variant="scale-in" className="flex-grow flex flex-col justify-center items-center mt-24 md:mt-12 w-full px-4 overflow-hidden">
              <AboutTypewriter className="text-[14vw] md:text-[9vw]" targetBase={data.aboutContent.name} />
            </Reveal>

            <Reveal variant="fade-up" delay={2}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-12 md:mt-0 items-end">
                <div className="md:col-span-2 text-stone-500 italic font-serif text-2xl md:text-3xl">(§1)</div>
                <div className="md:col-span-5 md:col-start-7 text-lg md:text-2xl font-serif leading-relaxed">
                  <span className="text-xs tracking-widest uppercase font-sans text-stone-500 block mb-6">{data.aboutContent.title1}</span>
                  {data.aboutContent.description1}
                </div>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={3}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-16 md:mt-24 pt-8 border-t border-stone-100/20 text-xs md:text-sm uppercase tracking-widest">
                <div className="md:col-span-3">
                  <p className="leading-relaxed whitespace-pre-line">{data.aboutContent.location}</p>
                  <span className="text-stone-500 block mt-4">Location.</span>
                </div>
                <div className="md:col-span-3 md:col-start-10 mt-8 md:mt-0">
                  <p className="leading-relaxed whitespace-pre-line">{data.aboutContent.availability}</p>
                  <span className="text-stone-500 block mt-4">Availability.</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 2: Story */}
        <section className="relative w-full min-h-screen flex flex-col justify-between px-6 py-24 md:p-12 overflow-hidden">
          <div ref={parallax2} className="absolute inset-0 z-0">
            <img
              src={data.aboutContent.section2Image || "https://a.storyblok.com/f/277682/3000x3751/eaee60f06a/otto-van-den-toorn-profile-02.jpg/m/1440x0/filters:quality(60)"}
              alt="Story Background"
              className="w-full h-full object-cover object-center opacity-50 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/80"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full grow justify-center">
            <Reveal variant="blur-in" className="flex-grow flex flex-col justify-center items-center mt-12 md:mt-0">
              <h2 className="text-[25vw] md:text-[18vw] leading-none font-serif tracking-tight text-center text-primary" style={{ fontFamily: "'Antonio', sans-serif" }}>Story</h2>
            </Reveal>

            <Reveal variant="slide-right" delay={1}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-12 items-start">
                <div className="md:col-span-2 text-stone-500 italic font-serif text-2xl md:text-3xl">(§2)</div>
                <div className="md:col-span-5 md:col-start-7 text-lg md:text-2xl font-serif leading-relaxed whitespace-pre-line">
                  <span className="text-xs tracking-widest uppercase font-sans text-stone-500 block mb-6">{data.aboutContent.title2}</span>
                  {data.aboutContent.description2a}
                </div>
              </div>
            </Reveal>

            <Reveal variant="slide-right" delay={2}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-16 md:mt-24 pt-8 border-t border-stone-100/20">
                <div className="md:col-span-5 md:col-start-7 text-lg md:text-2xl font-serif leading-relaxed whitespace-pre-line">
                  {data.aboutContent.description2b}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 3: Contact */}
        <section className="relative w-full min-h-screen flex flex-col justify-between px-6 py-24 md:p-12 overflow-hidden">
          <div ref={parallax3} className="absolute inset-0 z-0">
            <img
              src={data.aboutContent.section3Image || heroBg}
              alt="Contact Background"
              className="w-full h-full object-cover object-center opacity-40 scale-110"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full grow justify-center">
            <Reveal variant="blur-in" className="flex-grow flex flex-col justify-center items-center mt-12 md:mt-0">
              <h2 className="text-[22vw] md:text-[15vw] leading-none font-serif tracking-tight text-center text-primary" style={{ fontFamily: "'Antonio', sans-serif" }}>Contact</h2>
            </Reveal>

            <Reveal variant="fade-up" delay={1}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-12 items-start">
                <div className="md:col-span-2 text-stone-500 italic font-serif text-2xl md:text-3xl">(§3)</div>
                <div className="md:col-span-5 md:col-start-7 text-lg md:text-2xl font-serif leading-relaxed">
                  <span className="text-xs tracking-widest uppercase font-sans text-stone-500 block mb-6">{data.aboutContent.title3}</span>
                  <span className="whitespace-pre-line">{data.aboutContent.description3}</span>
                  
                  <Reveal variant="fade-up" delay={3}>
                    <div className="mt-12 flex items-center gap-4 flex-wrap">
                      <a
                        href={data.siteSettings.behanceUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                        title="Behance"
                      >
                        <ExternalLink className="w-6 h-6" />
                      </a>
                      <a
                        href={data.siteSettings.email ? `mailto:${data.siteSettings.email}` : "#"}
                        className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                        title="Email"
                      >
                        <Mail className="w-6 h-6" />
                      </a>
                      <a
                        href={data.siteSettings.instagramUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                        title="Instagram"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                      <a
                        href={data.siteSettings.youtubeUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                        title="YouTube"
                      >
                        <Youtube className="w-6 h-6" />
                      </a>
                    </div>
                  </Reveal>
                </div>
              </div>
            </Reveal>

            <Reveal variant="blur-in" delay={4}>
              <div className="mt-32 md:mt-48 mb-12 text-center">
                <p className="text-3xl md:text-5xl lg:text-6xl font-serif italic max-w-4xl mx-auto leading-tight whitespace-pre-line">
                  {data.aboutContent.quote}
                </p>
                <p className="mt-12 text-xs md:text-sm uppercase tracking-widest text-stone-500">{data.aboutContent.quoteAuthor}</p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
