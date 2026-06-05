import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/research';

  return (
    <footer 
      className={`w-full px-6 md:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-4 bg-transparent ${
        isHome 
          ? 'fixed bottom-0 left-0 z-10 pointer-events-none' 
          : 'mt-12 border-t border-neutral-100'
      }`}
    >
      <div className="flex gap-x-4 text-[10px] uppercase tracking-widest text-neutral-400 font-mono pointer-events-auto">
        <a href="/cookie-policy" className="hover:text-black transition-colors">Cookie Policy</a>
        <a href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</a>
        <a href="/legal-notice" className="hover:text-black transition-colors">Legal Notice</a>
      </div>
      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase pointer-events-auto">
        © 2026 UNVEIL® Studio
      </span>
    </footer>
  );
}
