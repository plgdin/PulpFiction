import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'UNVEIL ® PROJECTS', path: '/' },
    { name: 'RESEARCH', path: '/research' },
    { name: 'STUDIO', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full p-6 bg-transparent pointer-events-none">
      <nav className="flex pointer-events-auto">
        <ul className="flex items-center gap-x-2 flex-wrap gap-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name} className="flex">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-all duration-300 rounded border ${
                    isActive 
                      ? 'border-black bg-black text-white shadow-sm' 
                      : 'border-neutral-200 bg-white/60 text-neutral-400 hover:text-black hover:border-black/50 hover:bg-white/80'
                  }`}
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
