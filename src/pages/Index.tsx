import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useCms } from '../context/CmsContext';
import VideoCard from '../components/VideoCard';
import type { VideoTile } from '../types/video';

/* ═══════════════════════════════════════════════════
   LIGHTBOX COMPONENT
   Full-screen immersive image viewer with prev/next
   ═══════════════════════════════════════════════════ */

interface LightboxProps {
  tile: VideoTile;
  tiles: VideoTile[];
  onClose: () => void;
  onNavigate: (tile: VideoTile) => void;
}

function Lightbox({ tile, tiles, onClose, onNavigate }: LightboxProps) {
  const currentIndex = tiles.findIndex((t) => t.id === tile.id);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) onNavigate(tiles[currentIndex - 1]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < tiles.length - 1) onNavigate(tiles[currentIndex + 1]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(tiles[currentIndex - 1]);
      if (e.key === 'ArrowRight' && currentIndex < tiles.length - 1) onNavigate(tiles[currentIndex + 1]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, tiles, onClose, onNavigate]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-2xl cursor-pointer"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-300"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Counter */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40 uppercase tracking-[0.25em] z-10"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {String(currentIndex + 1).padStart(2, '0')} / {String(tiles.length).padStart(2, '0')}
      </div>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all duration-300"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {currentIndex < tiles.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all duration-300"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Image */}
      <motion.div
        key={tile.id}
        initial={{ opacity: 0, scale: 0.93, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-[85vw] max-h-[80vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <picture>
          {tile.webp_url && <source srcSet={tile.webp_url} type="image/webp" />}
          <img
            src={tile.thumbnail_url}
            alt={tile.alt || tile.title || ''}
            className="max-w-[85vw] max-h-[80vh] object-contain rounded shadow-2xl"
          />
        </picture>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-10"
      >
        <span
          className="text-[10px] text-white/60 uppercase tracking-[0.25em]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {tile.title}
        </span>
      </motion.div>
    </motion.div>
  );
}


/* ═══════════════════════════════════════════════════
   MAIN INDEX PAGE
   3D Flow gallery + 2D Masonry grid + Lightbox
   ═══════════════════════════════════════════════════ */

export default function Index() {
  const { tiles, loading } = useCms();
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxTile, setLightboxTile] = useState<VideoTile | null>(null);

  // View mode: 'flow' (3D gallery) or 'grid' (flat masonry)
  const [viewMode, setViewMode] = useState<'flow' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('unveil_view_mode') as 'flow' | 'grid') || 'flow';
    }
    return 'flow';
  });

  const handleToggleMode = (mode: 'flow' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('unveil_view_mode', mode);
  };

  // Scroll progress (0 → tiles.length - 1)
  const scrollProgress = useMotionValue(0);

  const smoothProgress = useSpring(scrollProgress, {
    damping: 35,
    stiffness: 100,
    mass: 0.6
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update active index
  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (latest) => {
      const index = Math.min(Math.max(Math.round(latest), 0), tiles.length - 1);
      setActiveIndex(index);
    });
    return () => unsubscribe();
  }, [smoothProgress, tiles.length]);

  // Wheel scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    if (viewMode !== 'flow' || lightboxTile) return;
    e.preventDefault();
    const speed = 0.0012;
    const change = (e.deltaY || e.deltaX) * speed;
    const current = scrollProgress.get();
    const target = Math.min(Math.max(current + change, 0), tiles.length - 1);
    scrollProgress.set(target);
  }, [scrollProgress, tiles.length, viewMode, lightboxTile]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel, viewMode]);

  // Keyboard navigation
  useEffect(() => {
    if (viewMode !== 'flow' || lightboxTile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const target = Math.min(scrollProgress.get() + 1, tiles.length - 1);
        scrollProgress.set(target);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const target = Math.max(scrollProgress.get() - 1, 0);
        scrollProgress.set(target);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollProgress, tiles.length, viewMode, lightboxTile]);

  // Drag handlers
  const dragStartX = useRef(0);
  const dragStartProgress = useRef(0);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (viewMode !== 'flow') return;
    isDragging.current = true;
    hasDragged.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragStartProgress.current = scrollProgress.get();
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || viewMode !== 'flow') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = dragStartX.current - clientX;

    if (Math.abs(deltaX) > 5) hasDragged.current = true;

    const sensitivity = windowWidth < 768 ? 0.007 : 0.003;
    const target = Math.min(
      Math.max(dragStartProgress.current + deltaX * sensitivity, 0),
      tiles.length - 1
    );
    scrollProgress.set(target);
  }, [scrollProgress, tiles.length, windowWidth, viewMode]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current || viewMode !== 'flow') return;
    isDragging.current = false;
    const current = scrollProgress.get();
    const nearest = Math.round(current);
    scrollProgress.set(nearest);
  }, [scrollProgress, viewMode]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // ── Loading state ───
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f5f5f4] z-50">
        <div className="flex flex-col items-center gap-y-3">
          <div className="w-6 h-6 border border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
          <span
            className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 loading-pulse"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Loading
          </span>
        </div>
      </div>
    );
  }

  // ── Responsive 3D gaps (TIGHTER than before) ───
  const isMobile = windowWidth < 768;
  const gapX = isMobile ? 120 : 210;
  const gapY = isMobile ? -40 : -75;
  const gapZ = isMobile ? -100 : -160;

  return (
    <div className="w-full min-h-screen bg-[#f5f5f4]">

      {/* ── Dynamic View Container ── */}
      <AnimatePresence mode="wait">
        {viewMode === 'flow' ? (
          /* ═══ 3D PERSPECTIVE GALLERY ═══ */
          <motion.div
            key="3d-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            ref={containerRef}
            className="fixed inset-0 w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center perspective-container z-[1]"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="relative w-full h-full flex items-center justify-center preserve-3d pointer-events-none">
              {tiles.map((tile, index) => (
                <Card3D
                  key={tile.id}
                  tile={tile}
                  index={index}
                  smoothProgress={smoothProgress}
                  gapX={gapX}
                  gapY={gapY}
                  gapZ={gapZ}
                  isHovered={hoveredIndex === index}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  isActive={activeIndex === index}
                  onClick={() => {
                    if (hasDragged.current) return;
                    scrollProgress.set(index);
                    setLightboxTile(tile);
                  }}
                />
              ))}
            </div>

            {/* ── Pagination HUD ── */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-y-3 z-10 pointer-events-none">
              {/* Counter */}
              <span
                className="text-[10px] text-neutral-800 uppercase tracking-[0.2em]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {String(activeIndex + 1).padStart(2, '0')}<span className="text-neutral-300 mx-1">/</span>{String(tiles.length).padStart(2, '0')}
              </span>
              {/* Progress bar */}
              <div className="w-32 h-[2px] bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-neutral-800 rounded-full"
                  style={{
                    width: `${((activeIndex + 1) / tiles.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <span
                className="text-[8px] uppercase tracking-[0.3em] text-neutral-400"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Scroll · Drag · Arrow Keys
              </span>
            </div>
          </motion.div>
        ) : (
          /* ═══ 2D MASONRY GRID ═══ */
          <motion.div
            key="2d-grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 pb-32 pt-4"
          >
            <div className="masonry-grid">
              {tiles.map((tile, index) => (
                <motion.div
                  key={tile.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.04, 0.6),
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="masonry-item"
                >
                  <VideoCard tile={tile} onClick={() => setLightboxTile(tile)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View Mode Toggle ── */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center border border-neutral-200/70 bg-white/60 backdrop-blur-xl rounded-full overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => handleToggleMode('flow')}
          className={`px-4 py-2 text-[9px] tracking-[0.2em] uppercase transition-all duration-300 rounded-full ${
            viewMode === 'flow'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => handleToggleMode('grid')}
          className={`px-4 py-2 text-[9px] tracking-[0.2em] uppercase transition-all duration-300 rounded-full ${
            viewMode === 'grid'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Index
        </button>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxTile && (
          <Lightbox
            tile={lightboxTile}
            tiles={tiles}
            onClose={() => setLightboxTile(null)}
            onNavigate={(t) => setLightboxTile(t)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   3D CARD COMPONENT
   Softer rotation, tighter spacing, dramatic hover
   ═══════════════════════════════════════════════════ */

interface Card3DProps {
  tile: VideoTile;
  index: number;
  smoothProgress: any;
  gapX: number;
  gapY: number;
  gapZ: number;
  isHovered: boolean;
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

function Card3D({
  tile,
  index,
  smoothProgress,
  gapX,
  gapY,
  gapZ,
  isHovered,
  isActive,
  onHoverStart,
  onHoverEnd,
  onClick
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    onHoverEnd();
  };

  // ── SOFTER rotation angles (was -35/8/-2, now -28/5/-1) ──
  const baseRotateY = -28;
  const baseRotateX = 5;
  const baseRotateZ = -1;

  // ── More responsive mouse tilt ──
  const tiltRotateY = isHovered ? mousePos.x * 15 : 0;
  const tiltRotateX = isHovered ? -mousePos.y * 15 : 0;

  const ratioStr = tile.aspect_ratio || '1.77';
  const aspectRatio = parseFloat(ratioStr) || 1.77;

  const cardHeight = 380;
  const cardWidth = cardHeight * aspectRatio;

  const x = useTransform(smoothProgress, (val: number) => (index - val) * gapX);
  const y = useTransform(smoothProgress, (val: number) => (index - val) * gapY);
  const baseZ = useTransform(smoothProgress, (val: number) => (index - val) * gapZ);

  // ── DRAMATIC hover lift (was 45, now 70) ──
  const hoverZOffset = useSpring(0, { stiffness: 140, damping: 18 });

  useEffect(() => {
    hoverZOffset.set(isHovered ? 70 : 0);
  }, [isHovered, hoverZOffset]);

  const z = useTransform([baseZ, hoverZOffset], ([zVal, offsetVal]) => (zVal as number) + (offsetVal as number));

  // ── Opacity based on distance from active ──
  const opacity = useTransform(smoothProgress, (val: number) => {
    const distance = Math.abs(index - val);
    if (distance < 1) return 1;
    if (distance < 3) return 0.85;
    if (distance < 5) return 0.6;
    return 0.35;
  });

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHoverStart}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute preserve-3d pointer-events-auto cursor-pointer overflow-hidden transition-shadow duration-600 rounded ${
        isHovered
          ? 'shadow-[0_30px_80px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.1)]'
          : isActive
            ? 'shadow-[0_20px_50px_rgba(0,0,0,0.15)]'
            : 'shadow-[0_12px_30px_rgba(0,0,0,0.08)]'
      }`}
      style={{
        width: cardWidth,
        height: cardHeight,
        x,
        y,
        z,
        opacity,
      }}
      animate={{
        rotateY: baseRotateY + tiltRotateY,
        rotateX: baseRotateX + tiltRotateX,
        rotateZ: baseRotateZ,
      }}
      transition={{
        type: 'spring',
        stiffness: 140,
        damping: 24,
        mass: 0.6,
      }}
    >
      {/* Edge highlight */}
      <div className="absolute inset-0 border border-white/15 rounded pointer-events-none z-[1]" />

      {/* Dynamic specular highlight following mouse */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] transition-opacity duration-400"
        style={{
          background: `radial-gradient(
            ellipse at ${50 + mousePos.x * 80}% ${50 + mousePos.y * 80}%,
            rgba(255,255,255,0.25) 0%,
            rgba(255,255,255,0.08) 30%,
            transparent 70%
          )`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Image */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none select-none">
        {tile.webp_url && <source srcSet={tile.webp_url} type="image/webp" />}
        <img
          src={tile.thumbnail_url}
          alt={tile.alt || tile.title || ''}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? 'scale-[1.06]' : 'scale-100'
          }`}
          loading="lazy"
        />
      </picture>

      {/* Bottom gradient + title */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-4 pointer-events-none z-[4] transition-opacity duration-400 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-gradient-to-t from-black/50 via-black/15 to-transparent absolute inset-0 rounded" />
        <div className="relative flex items-center justify-between">
          <span
            className={`text-[10px] text-white/90 uppercase tracking-[0.2em] whitespace-nowrap transition-transform duration-400 ease-out ${
              isHovered ? 'translate-y-0' : 'translate-y-3'
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {tile.title}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"
            className={`opacity-50 transition-all duration-400 ${isHovered ? 'translate-x-0 opacity-50' : 'translate-x-2 opacity-0'}`}
          >
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
