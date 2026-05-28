import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail, Instagram, Youtube, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCms } from '@/context/CmsContext';
import heroBg from '@/assets/hero-bg.jpg';

/* ─── Typewriter (same logic as Footer) ─── */
const AboutTypewriter = ({ className = '' }: { className?: string }) => {
  const [baseText, setBaseText] = useState('');
  const [prefixText, setPrefixText] = useState('');

  type Mode = 'TYPE_BASE' | 'MOVE_CURSOR' | 'TYPE_PREFIX' | 'DELETE_PREFIX' | 'PAUSE';
  const [mode, setMode] = useState<Mode>('TYPE_BASE');
  const [cursorIndex, setCursorIndex] = useState(0);

  const roles = ['Writer', 'Actor', 'Director'];
  const [roleIndex, setRoleIndex] = useState(0);
  const targetBase = 'TARUN\u00A0KAPOOR';

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
      <>
        {prefixText}<Cursor />{prefixText.length > 0 ? '\u00A0' : ''}{baseText}
      </>
    );
  };

  return (
    <h1
      ref={containerRef}
      className={`font-display text-primary text-shadow-glow tracking-wider whitespace-pre-wrap ${className}`}
    >
      {renderText()}
    </h1>
  );
};

/* ─── stat pill data ─── */
const stats = [
  { label: 'Years Experience', value: '8+' },
  { label: 'Films Directed', value: '40+' },
  { label: 'Brands Worked With', value: '25+' },
  { label: 'Awards', value: '6' },
];

const AboutContact = () => {
  const { data } = useCms();
  const { siteSettings } = data;

  /* ─── contact form (UI-only) ─── */
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend yet – just flash a success state
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col lg:flex-row">
      {/* ═══════════ LEFT: Portrait Photo ═══════════ */}
      <div className="relative w-full lg:w-1/2 h-[60vh] lg:h-screen flex-shrink-0">
        {/* Back button */}
        <Link
          to="/"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-primary/90 hover:text-primary transition-colors text-sm font-medium backdrop-blur-md bg-black/30 rounded-full px-4 py-2 border border-primary/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <img
          src={heroBg}
          alt="Tarun Kapoor — Director, Actor & Writer"
          className="w-full h-full object-cover object-center"
        />

        {/* cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black pointer-events-none" />

        {/* floating name on mobile (visible only < lg) */}
        <div className="absolute bottom-8 left-6 lg:hidden">
          <AboutTypewriter className="text-4xl" />
        </div>
      </div>

      {/* ═══════════ RIGHT: Content ═══════════ */}
      <div className="w-full lg:w-1/2 lg:h-screen lg:overflow-y-auto scrollbar-hide relative">
        {/* subtle ambient glow */}
        <div className="absolute top-0 left-0 w-full h-72 pointer-events-none bg-gradient-to-b from-primary/[0.04] to-transparent" />

        <div className="relative z-10 px-6 md:px-12 lg:px-14 py-12 lg:py-16 flex flex-col gap-14">
          {/* ─────── 1. ABOUT ME ─────── */}
          <section id="about-me" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Desktop name (hidden on mobile since it's on the photo) */}
            <div className="hidden lg:block mb-6">
              <AboutTypewriter className="text-5xl xl:text-6xl leading-none" />
            </div>

            <h2 className="font-display text-2xl text-primary/90 mb-4 tracking-wider">
              About Me
            </h2>

            {/* glassmorphism card */}
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                I'm a filmmaker with a relentless eye for cinematic storytelling.
                From directing ad films for top-tier brands to crafting emotionally
                charged short films, I believe every frame should make the audience
                <em className="text-primary/80"> feel</em> something. My work blends
                bold visuals, precise sound design, and authentic performances to
                create experiences that linger long after the credits roll.
              </p>

              {/* stat pills */}
              <div className="flex flex-wrap gap-3 mt-6">
                {stats.map((s) => (
                  <span
                    key={s.label}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-xs tracking-wide"
                  >
                    <span className="font-display text-primary text-sm">{s.value}</span>
                    <span className="text-muted-foreground">{s.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ─────── 2. SOCIALS ─────── */}
          <section id="socials" className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <h2 className="font-display text-2xl text-primary/90 mb-4 tracking-wider">
              Socials
            </h2>

            <div className="flex flex-wrap gap-4">
              {/* Behance */}
              {siteSettings.behanceUrl && (
                <a
                  href={siteSettings.behanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl px-5 py-3 transition-all hover:border-primary/30 hover:bg-primary/[0.06] hover:shadow-[0_0_24px_rgba(245,212,103,0.12)]"
                >
                  <ExternalLink className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-primary/90 transition-colors">
                    Behance
                  </span>
                </a>
              )}

              {/* Instagram */}
              {siteSettings.instagramUrl && (
                <a
                  href={siteSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl px-5 py-3 transition-all hover:border-primary/30 hover:bg-primary/[0.06] hover:shadow-[0_0_24px_rgba(245,212,103,0.12)]"
                >
                  <Instagram className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-primary/90 transition-colors">
                    Instagram
                  </span>
                </a>
              )}

              {/* YouTube */}
              {siteSettings.youtubeUrl && (
                <a
                  href={siteSettings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl px-5 py-3 transition-all hover:border-primary/30 hover:bg-primary/[0.06] hover:shadow-[0_0_24px_rgba(245,212,103,0.12)]"
                >
                  <Youtube className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-primary/90 transition-colors">
                    YouTube
                  </span>
                </a>
              )}

              {/* Email */}
              {siteSettings.email && (
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl px-5 py-3 transition-all hover:border-primary/30 hover:bg-primary/[0.06] hover:shadow-[0_0_24px_rgba(245,212,103,0.12)]"
                >
                  <Mail className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-primary/90 transition-colors">
                    {siteSettings.email}
                  </span>
                </a>
              )}
            </div>
          </section>

          {/* ─────── 3. CONTACT ─────── */}
          <section id="contact" className="animate-fade-in-up pb-8" style={{ animationDelay: '0.4s' }}>
            <h2 className="font-display text-2xl text-primary/90 mb-4 tracking-wider">
              Contact
            </h2>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-muted-foreground text-xs tracking-wider uppercase">
                    Name
                  </Label>
                  <Input
                    id="contact-name"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="bg-white/[0.04] border-white/[0.08] placeholder:text-muted-foreground/40 focus:border-primary/40 text-foreground"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-muted-foreground text-xs tracking-wider uppercase">
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="bg-white/[0.04] border-white/[0.08] placeholder:text-muted-foreground/40 focus:border-primary/40 text-foreground"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-muted-foreground text-xs tracking-wider uppercase">
                    Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder="Tell me about your project…"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="bg-white/[0.04] border-white/[0.08] placeholder:text-muted-foreground/40 focus:border-primary/40 text-foreground resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitted}
                  className="self-start gap-2 font-display tracking-wider uppercase text-sm px-8 py-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(245,212,103,0.25)] hover:shadow-[0_0_30px_rgba(245,212,103,0.4)] transition-all"
                >
                  {submitted ? (
                    'Sent ✓'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutContact;
