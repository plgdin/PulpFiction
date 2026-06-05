import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Projects', path: '/' },
    { name: 'Research', path: '/research' },
    { name: 'Studio', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ease-out ${
        scrolled
          ? 'py-3 px-4 md:px-6 bg-[#f5f5f4]/70 backdrop-blur-xl border-b border-neutral-200/40'
          : 'py-5 px-5 md:px-8 bg-transparent'
      }`}
    >
      <nav className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Logo / Wordmark */}
        <Link
          to="/"
          className="flex items-baseline gap-[2px] group"
        >
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-900 group-hover:text-black transition-colors duration-300"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            UNVEIL
          </span>
          <sup className="text-[7px] font-medium text-neutral-400 group-hover:text-neutral-600 transition-colors duration-300 -ml-[1px]">®</sup>
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center gap-x-1">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname === item.path;

            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`relative flex items-center px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-all duration-300 rounded-full ${
                    isActive
                      ? 'bg-neutral-900 text-white nav-active-glow'
                      : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/40'
                  }`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
