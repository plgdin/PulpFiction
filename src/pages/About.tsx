import React from 'react';

export default function About() {
  const sections = [
    {
      title: 'Clients',
      items: [
        'BALENCIAGA', 'BOILER ROOM', 'BYREDO', 'COTY', 'DRIES VAN NOTEN',
        'HELIOT EMIL', 'ISABEL MARANT', 'LVMH GAÏA', 'MOËT & CHANDON',
        'NODALETO', 'PUMA', 'SALOMON', 'SILENCIO', 'WARP RECORDS'
      ]
    },
    {
      title: 'Services',
      items: [
        'CREATIVE DIRECTION', 'AI', 'GRAPHIC IDENTITY', 'DIGITAL DESIGN', 'STRATEGY'
      ]
    },
    {
      title: 'Press',
      items: [
        'THEBOLDWAY (PODCAST)', 'RESAMPL', 'THE BRAND IDENTITY', 'LITTLE BLACK BOOK'
      ]
    },
    {
      title: 'Recognitions',
      items: [
        'GEN:48 EDITION #2 : GRAND PRIX', 'GEN:48 EDITION #3 : JURY SELECTION'
      ]
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-8 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-x-16 gap-y-12 items-start">
        
        {/* Left Column: Manifesto & Section Lists */}
        <div className="flex flex-col">
          <p className="text-[12px] leading-relaxed text-black font-light text-justify tracking-wide uppercase max-w-xl mb-16">
            UNVEIL® is a creative studio using artificial intelligence to expand human
            creativity. The eye represents our most essential tool in a world overwhelmed with
            visual stimuli. We collaborate across diverse industries and cultural landscapes
            reflecting our belief that variety drives our creative process. Each project at
            UNVEIL® is backed by thorough research, ensuring that our creative decisions are
            deliberate and meaningful. No project is too small for us, we see each one as an
            opportunity to express ourselves. We love what we do.
          </p>

          {/* Section details */}
          <div className="flex flex-col gap-y-8 border-t border-neutral-100/50 pt-8">
            {sections.map((section) => (
              <div key={section.title} className="flex flex-col sm:flex-row gap-y-2 sm:gap-x-12">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 w-32 flex-shrink-0">
                  {section.title}
                </span>
                <div className="flex flex-col gap-y-1">
                  {section.items.map((item) => (
                    <span 
                      key={item} 
                      className="text-[10px] font-mono uppercase tracking-wider text-black"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Halftone Eye Visual Graphic */}
        <div className="relative w-full aspect-square lg:aspect-auto lg:h-[75vh] flex items-start justify-center overflow-hidden rounded border border-neutral-100 bg-neutral-50/50 shadow-sm group">
          <img 
            src="/halftone_eye.png" 
            alt="Halftone Eye Graphic - UNVEIL" 
            className="w-full h-full object-cover grayscale opacity-90 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            loading="lazy"
          />
          {/* Subtle reflection overlay on image container */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />
        </div>

      </div>
    </div>
  );
}
