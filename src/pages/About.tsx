import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
const Footer = lazy(() => import("@/components/Footer"));
import { useCms } from "@/context/CmsContext";
import { Mail, Instagram, Youtube, ExternalLink } from "lucide-react";
import heroBg from "@/assets/hero-bg.webp";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";

/* ==========================================
   Letter-by-Letter Split Reveal Component
   ========================================== */
const SplitTextReveal = ({ text, className = "", delayOffset = 0 }: { text: string; className?: string; delayOffset?: number }) => {
  const letters = Array.from(text);

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delayOffset * 0.2 },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 100,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span 
          variants={child} 
          key={index} 
          style={{ 
            display: "inline-block",
            textShadow: "3px 4px 8px rgba(0, 0, 0, 0.9), 0 10px 20px rgba(0, 0, 0, 0.8)"
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

/* ==========================================
   Word-by-Word Reveal Component
   ========================================== */
const SplitWordReveal = ({ text, className = "", delayOffset = 0 }: { text: string; className?: string; delayOffset?: number }) => {
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delayOffset },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(5px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={`flex flex-wrap ${className}`}
    >
      {words.map((word, index) => (
        <motion.span 
          variants={child} 
          key={index} 
          className="mr-[0.25em] inline-block"
          style={{ 
            textShadow: "1px 2px 4px rgba(0, 0, 0, 0.9), 0 4px 8px rgba(0, 0, 0, 0.7)"
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

/* ==========================================
   Parallax Background Image
   ========================================== */
const ParallaxImage = ({ src, alt, className = "" }: { src: string; alt: string; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);

  return (
    <div ref={ref} className="absolute inset-0 z-0 overflow-hidden">
      <motion.img
        style={{ y, scale }}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover object-center ${className}`}
      />
    </div>
  );
};

/* ==========================================
   About Typewriter Component
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
    <motion.h1
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className={`leading-[0.9] font-serif tracking-tight text-center text-primary text-shadow-glow ${className}`}
      style={{ 
        fontFamily: "'Antonio', sans-serif",
        textShadow: "3px 4px 8px rgba(0, 0, 0, 0.9), 0 10px 20px rgba(0, 0, 0, 0.8), 0 0 15px hsl(var(--primary) / 0.3)"
      }}
    >
      {renderText()}
    </motion.h1>
  );
};

/* ==========================================
   About Page
   ========================================== */
const About = () => {
  const { data } = useCms();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Global Scroll Progress for Color Transitions
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress to a background color transition (Zinc -> Dark Amber -> Deep Blue)
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.4, 0.8],
    ["#09090b", "#1c140a", "#050e1c"]
  );

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
    <motion.div 
      ref={containerRef}
      style={{ backgroundColor }}
      className="text-stone-100 font-sans selection:bg-stone-100 selection:text-zinc-950 min-h-screen transition-colors duration-700 ease-out"
    >
      <Navbar categories={data.categories || []} onSearch={handleSearch} onCategoryClick={handleCategoryClick} />

      <main style={{ textShadow: "2px 2px 6px rgba(0, 0, 0, 0.9), 0 4px 12px rgba(0, 0, 0, 0.8)" }}>
        {/* ================= SECTION 1: HERO ================= */}
        <section className="relative w-full min-h-screen flex flex-col justify-end px-6 py-12 md:p-12 overflow-hidden">
          <ParallaxImage 
            src={data.aboutContent.section1Image || heroBg} 
            alt="Hero Portrait" 
            className="opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 z-0"></div>

          <div className="relative z-10 w-full">
            <div className="mb-12 md:mb-16 flex justify-center pb-2">
              <AboutTypewriter 
                targetBase={data.aboutContent.name.toUpperCase()} 
                className="text-[12vw] md:text-[8vw] lg:text-[7vw]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mt-12 md:mt-0 border-t border-stone-100/20 pt-8">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
                className="md:col-span-2 text-stone-500 italic font-serif text-2xl"
                style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
              >
                (§1)
              </motion.div>
              
              <div className="md:col-span-5 md:col-start-7 text-lg md:text-2xl font-serif leading-relaxed">
                <motion.span 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xs tracking-widest uppercase font-sans text-stone-500 block mb-4"
                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {data.aboutContent.title1}
                </motion.span>
                <SplitWordReveal text={data.aboutContent.description1} delayOffset={0.6} />
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: STORY ================= */}
        <section className="relative w-full min-h-screen flex flex-col justify-center px-6 py-24 md:p-12 overflow-hidden">
          <ParallaxImage 
            src={data.aboutContent.section2Image || "https://a.storyblok.com/f/277682/3000x3751/eaee60f06a/otto-van-den-toorn-profile-02.jpg/m/1440x0/filters:quality(60)"} 
            alt="Story Background" 
            className="opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 z-0 bg-black/30 backdrop-blur-sm"></div>

          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <SplitTextReveal 
              text="STORY" 
              className="text-[20vw] md:text-[12vw] leading-none font-serif tracking-tighter text-stone-200/90 mb-12 md:mb-24"
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div 
                className="md:col-span-2 text-stone-500 italic font-serif text-2xl md:text-3xl"
                style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
              >
                (§2)
              </div>
              
              <div className="md:col-span-8 md:col-start-4 text-xl md:text-4xl font-serif leading-snug whitespace-pre-line">
                <motion.span 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="text-xs tracking-widest uppercase font-sans text-stone-500 block mb-8"
                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {data.aboutContent.title2}
                </motion.span>
                <SplitWordReveal text={data.aboutContent.description2a} delayOffset={0.2} />
                
                <div className="mt-12 md:mt-24 pt-12 border-t border-stone-100/10">
                  <SplitWordReveal text={data.aboutContent.description2b} delayOffset={0.4} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: CONTACT ================= */}
        <section className="relative w-full min-h-screen flex flex-col justify-between px-6 py-24 md:p-12 overflow-hidden">
          <ParallaxImage 
            src={data.aboutContent.section3Image || heroBg} 
            alt="Contact Background" 
            className="opacity-20 grayscale"
          />

          <div className="relative z-10 flex flex-col h-full grow justify-center w-full max-w-7xl mx-auto">
            <SplitTextReveal 
              text="CONTACT" 
              className="text-[18vw] md:text-[12vw] leading-none font-serif tracking-tighter text-stone-200/90 mb-12"
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div 
                className="md:col-span-2 text-stone-500 italic font-serif text-2xl md:text-3xl"
                style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
              >
                (§3)
              </div>
              
              <div className="md:col-span-6 md:col-start-4 text-lg md:text-2xl font-serif leading-relaxed">
                <motion.span 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-xs tracking-widest uppercase font-sans text-stone-500 block mb-6"
                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {data.aboutContent.title3}
                </motion.span>
                
                <SplitWordReveal text={data.aboutContent.description3} />
                
                {/* Social Links Reveal */}
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1, delayChildren: 0.8 }
                    }
                  }}
                  className="mt-16 flex items-center gap-6 flex-wrap"
                >
                  {[
                    { icon: ExternalLink, url: data.siteSettings.behanceUrl, title: "Behance" },
                    { icon: Mail, url: data.siteSettings.email ? `mailto:${data.siteSettings.email}` : "#", title: "Email" },
                    { icon: Instagram, url: data.siteSettings.instagramUrl, title: "Instagram" },
                    { icon: Youtube, url: data.siteSettings.youtubeUrl, title: "YouTube" }
                  ].map((social, idx) => (
                    <motion.a
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, scale: 0.5, rotate: -20 },
                        visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring" } }
                      }}
                      whileHover={{ scale: 1.1, backgroundColor: "#e7e5e4", color: "#09090b" }}
                      href={social.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="w-16 h-16 rounded-full border border-stone-500/30 flex items-center justify-center text-stone-300 transition-colors duration-300"
                      title={social.title}
                    >
                      <social.icon className="w-6 h-6 stroke-[1.5]" />
                    </motion.a>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Massive Quote Section */}
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
              className="mt-32 md:mt-48 mb-12 text-center"
              style={{ textShadow: "3px 4px 10px rgba(0, 0, 0, 0.9), 0 10px 20px rgba(0, 0, 0, 0.8)" }}
            >
              <p className="text-4xl md:text-6xl lg:text-8xl font-serif italic max-w-5xl mx-auto leading-tight text-stone-400">
                "{data.aboutContent.quote}"
              </p>
              <p className="mt-12 text-xs md:text-sm uppercase tracking-widest text-stone-600 font-sans">
                {data.aboutContent.quoteAuthor}
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </motion.div>
  );
};

export default About;
