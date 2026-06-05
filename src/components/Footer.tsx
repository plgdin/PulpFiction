import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/research';

  return (
    <footer
      className={`w-full px-6 md:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-3 bg-transparent ${
        isHome
          ? 'fixed bottom-0 left-0 z-10 pointer-events-none'
          : 'mt-16 border-t border-neutral-200/40'
      }`}
    >
      <div className="flex gap-x-5 pointer-events-auto">
        {['Cookie Policy', 'Privacy Policy', 'Legal Notice'].map((label) => (
          <a
            key={label}
            href={`/${label.toLowerCase().replace(/\s/g, '-')}`}
            className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-700 transition-colors duration-300"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {label}
          </a>
        ))}
      </div>
      <span
        className="text-[9px] tracking-[0.2em] text-neutral-400 uppercase pointer-events-auto"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        © 2026 UNVEIL® Studio
      </span>
    </footer>
  );
}
