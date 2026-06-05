import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useCms } from '../context/CmsContext';
import VideoCard from '../components/VideoCard';

export default function Index() {
  const { tiles, loading } = useCms();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track view mode: 'flow' (3D diagonal gallery) or 'grid' (2D flat grid index)
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

  // Track current scroll progress (from 0 to tiles.length - 1)
  const scrollProgress = useMotionValue(0);
  
  // Smooth spring physics for 3D card movement
  const smoothProgress = useSpring(scrollProgress, {
    damping: 30,
    stiffness: 120,
    mass: 0.8
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Monitor window resize for responsive layout spacing
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update active index based on scroll progress
  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (latest) => {
      const index = Math.min(Math.max(Math.round(latest), 0), tiles.length - 1);
      setActiveIndex(index);
    });
    return () => unsubscribe();
  }, [smoothProgress, tiles.length]);

  // Handle wheel events (scroll vertically or horizontally to slide gallery)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (viewMode !== 'flow') return; // Only intercept wheel events in 3D mode
    e.preventDefault();
    const speed = 0.0015;
    const change = (e.deltaY || e.deltaX) * speed;
    const current = scrollProgress.get();
    const target = Math.min(Math.max(current + change, 0), tiles.length - 1);
    scrollProgress.set(target);
  }, [scrollProgress, tiles.length, viewMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel, viewMode]);

  // Handle key navigation (Left/Right arrows)
  useEffect(() => {
    if (viewMode !== 'flow') return;
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
  }, [scrollProgress, tiles.length, viewMode]);

  // Drag handlers for 3D track
  const dragStartX = useRef(0);
  const dragStartProgress = useRef(0);
  const isDragging = useRef(false);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (viewMode !== 'flow') return;
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragStartProgress.current = scrollProgress.get();
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || viewMode !== 'flow') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = dragStartX.current - clientX;
    
    const sensitivity = windowWidth < 768 ? 0.008 : 0.004;
    const target = Math.min(
      Math.max(dragStartProgress.current + deltaX * sensitivity, 0),
      tiles.length - 1
    );
    scrollProgress.set(target);
  }, [scrollProgress, tiles.length, windowWidth, viewMode]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current || viewMode !== 'flow') return;
    isDragging.current = false;
    
    // Snap to nearest card
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

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#fafafa] z-50">
        <div className="flex flex-col items-center gap-y-2">
          <span className="text-[10px] uppercase tracking-widest text-black/40 animate-pulse font-mono">
            Loading Arena
          </span>
        </div>
      </div>
    );
  }

  const isMobile = windowWidth < 768;
  const gapX = isMobile ? 150 : 260;
  const gapY = isMobile ? -50 : -100;
  const gapZ = isMobile ? -120 : -190;

  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      
      {/* Dynamic View Container */}
      <AnimatePresence mode="wait">
        {viewMode === 'flow' ? (
          /* 3D PERSPECTIVE GALLERY VIEW */
          <motion.div
            key="3d-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
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
                    scrollProgress.set(index);
                  }}
                />
              ))}
            </div>

            {/* Pagination & Instructions HUD */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-y-2 z-10 pointer-events-none">
              <div className="flex gap-x-1.5">
                {tiles.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
                      activeIndex === index ? 'bg-black scale-125' : 'bg-black/10 hover:bg-black/30'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollProgress.set(index);
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] uppercase tracking-widest font-mono text-neutral-400">
                Scroll or Drag to Explore
              </span>
            </div>
          </motion.div>
        ) : (
          /* 2D FLAT INDEX GRID VIEW */
          <motion.div
            key="2d-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto px-6 md:px-8 pb-32 pt-6"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tiles.map((tile) => (
                <div key={tile.id} className="w-full overflow-hidden rounded border border-neutral-100 bg-white/40 shadow-sm">
                  <VideoCard tile={tile} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERVIEW / INDEX TOGGLE CONTROL HUD */}
      <div className="fixed bottom-6 right-6 z-50 flex border border-neutral-200 bg-white/70 backdrop-blur-md rounded overflow-hidden shadow-sm pointer-events-auto">
        <button
          type="button"
          onClick={() => handleToggleMode('flow')}
          className={`px-4 py-2 text-[9px] font-mono tracking-widest uppercase transition-all duration-300 ${
            viewMode === 'flow'
              ? 'bg-black text-white border-black font-semibold'
              : 'text-neutral-400 hover:text-black hover:bg-neutral-50'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => handleToggleMode('grid')}
          className={`px-4 py-2 text-[9px] font-mono tracking-widest uppercase border-l border-neutral-200 transition-all duration-300 ${
            viewMode === 'grid'
              ? 'bg-black text-white border-black font-semibold'
              : 'text-neutral-400 hover:text-black hover:bg-neutral-50'
          }`}
        >
          Index
        </button>
      </div>

    </div>
  );
}

interface Card3DProps {
  tile: any;
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

  const baseRotateY = -35; 
  const baseRotateX = 8;
  const baseRotateZ = -2;

  const tiltRotateY = isHovered ? mousePos.x * 12 : 0;
  const tiltRotateX = isHovered ? -mousePos.y * 12 : 0;

  const ratioStr = tile.aspect_ratio || '1.77';
  const aspectRatio = parseFloat(ratioStr) || 1.77;

  const cardHeight = 365; 
  const cardWidth = cardHeight * aspectRatio;

  const x = useTransform(smoothProgress, (val: number) => (index - val) * gapX);
  const y = useTransform(smoothProgress, (val: number) => (index - val) * gapY);
  const baseZ = useTransform(smoothProgress, (val: number) => (index - val) * gapZ);
  
  const hoverZOffset = useSpring(isHovered ? 45 : 0, { stiffness: 120, damping: 20 });
  
  useEffect(() => {
    hoverZOffset.set(isHovered ? 45 : 0);
  }, [isHovered, hoverZOffset]);

  const z = useTransform([baseZ, hoverZOffset], ([zVal, offsetVal]) => (zVal as number) + (offsetVal as number));

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
      className={`absolute preserve-3d pointer-events-auto cursor-pointer rounded-lg overflow-hidden border border-white/20 transition-shadow duration-500 ${
        isHovered ? 'shadow-[0_25px_60px_rgba(0,0,0,0.3)]' : 'shadow-[0_15px_35px_rgba(0,0,0,0.15)]'
      }`}
      style={{
        width: cardWidth,
        height: cardHeight,
        x,
        y,
        z,
      }}
      animate={{
        rotateY: baseRotateY + tiltRotateY,
        rotateX: baseRotateX + tiltRotateX,
        rotateZ: baseRotateZ,
      }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 22,
        mass: 0.8
      }}
    >
      <div className="absolute inset-0 bg-neutral-950/5 pointer-events-none select-none z-[1]" />
      
      <div 
        className="absolute inset-0 pointer-events-none z-[2] transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${50 + mousePos.x * 100}% ${50 + mousePos.y * 100}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
          opacity: isHovered ? 1 : 0
        }}
      />

      <picture className="absolute inset-0 w-full h-full pointer-events-none select-none">
        {tile.webp_url && <source srcSet={tile.webp_url} type="image/webp" />}
        <img
          src={tile.thumbnail_url}
          alt={tile.title || ''}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? 'scale-[1.04]' : 'scale-100'
          }`}
          loading="lazy"
        />
      </picture>

      <div className="absolute inset-0 border border-white/25 rounded-lg pointer-events-none z-[3]" />

      <div className="absolute inset-0 flex items-center justify-center z-[4] pointer-events-none">
        <div 
          className={`px-6 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded transition-all duration-500 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <span className="text-[10px] text-white font-mono uppercase tracking-[0.25em] whitespace-nowrap">
            {tile.title}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
