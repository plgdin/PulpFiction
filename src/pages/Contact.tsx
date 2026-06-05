import React from 'react';

export default function Contact() {
  return (
    <div className="max-w-[42rem] mx-auto pt-12">
      <h2 className="text-xs uppercase tracking-widest font-mono mb-6 text-neutral-400">
        Inquiries — UNVEIL®
      </h2>
      <p className="text-sm leading-relaxed text-black font-light text-justify mb-8">
        We are always open to new collaborative projects, creative opportunities, 
        and visual explorations. Reach out directly to discuss how we can partner on 
        your next production.
      </p>
      <div className="font-mono text-xs uppercase tracking-widest flex flex-col gap-y-2 border-t border-neutral-100 pt-6">
        <div className="flex justify-between">
          <span className="text-neutral-400">Email</span>
          <a href="mailto:hello@unveil.studio" className="hover:text-neutral-500 transition-colors">hello@unveil.studio</a>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Instagram</span>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-neutral-500 transition-colors">@unveil.studio</a>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Location</span>
          <span className="text-black">Bangalore, India</span>
        </div>
      </div>
    </div>
  );
}
