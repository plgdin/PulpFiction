import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ContactModalProps {
  onClose: () => void;
}

export default function ContactModal({ onClose }: ContactModalProps) {
  const navigate = useNavigate();

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const contactItems = [
    { name: 'CONTACT@UNVEIL.FR', href: 'mailto:contact@unveil.fr' },
    { name: 'INSTAGRAM', href: 'https://instagram.com', isExternal: true },
    { name: '25 RUE HENRY MONNIER, 75009 PARIS', href: 'https://maps.google.com/?q=25+Rue+Henry+Monnier,+75009+Paris,+France', isExternal: true },
  ];

  return (
    <div 
      onClick={handleBackgroundClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-2xl cursor-pointer"
    >
      {/* Horizontal List of Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 px-4 cursor-default">
        {contactItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target={item.isExternal ? '_blank' : undefined}
            rel={item.isExternal ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center px-5 py-3 text-[10px] font-mono uppercase tracking-widest border border-neutral-200 bg-white/70 text-neutral-500 hover:text-black hover:border-black rounded transition-all duration-300 shadow-sm"
          >
            {item.name}
          </a>
        ))}
      </div>
    </div>
  );
}
