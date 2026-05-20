import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  onComplete: () => void;
}

const ROLES = ['DIRECTOR', 'WRITER', 'ACTOR'];
const STATIC_WORDS = ['TARUN', 'KAPOOR'];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visibleCount, setVisibleCount] = useState(0); 
  const [rollState, setRollState] = useState(0); 
  // rollState:
  // 0: Box 1 (DIRECTOR front)
  // 1: Box 1 rolls UP (WRITER bottom)
  // 2: Swaps to Box 2 (WRITER front)
  // 3: Box 2 rolls LEFT (ACTOR right)
  
  const [progress, setProgress] = useState(0);
  const [isLifting, setIsLifting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

  // Animation Sequence
  useEffect(() => {
    if (visibleCount < 2) {
      // Phase 1: Bring in TARUN and KAPOOR faster
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else if (rollState === 0) {
      const timer = setTimeout(() => setRollState(1), 600); // Roll UP faster
      return () => clearTimeout(timer);
    } else if (rollState === 1) {
      const timer = setTimeout(() => setRollState(2), 800); // Swap to Box 2
      return () => clearTimeout(timer);
    } else if (rollState === 2) {
      const timer = setTimeout(() => setRollState(3), 50); // Roll LEFT
      return () => clearTimeout(timer);
    } else if (rollState === 3) {
      const liftTimer = setTimeout(() => setIsLifting(true), 1000);
      return () => clearTimeout(liftTimer);
    }
  }, [visibleCount, rollState]);

  // Progress Counter (Sync with sequence length ~3400ms total)
  useEffect(() => {
    const totalDuration = 3400;
    const interval = 20;
    const steps = totalDuration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.floor((currentStep / steps) * 100));
      setProgress(nextProgress);
      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Unmount after lift
  useEffect(() => {
    if (isLifting) {
      const unmountTimer = setTimeout(() => {
        setIsUnmounted(true);
        onComplete();
      }, 1000);
      return () => clearTimeout(unmountTimer);
    }
  }, [isLifting, onComplete]);

  if (isUnmounted) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] text-white',
        'transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]',
        isLifting ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="flex w-full items-center justify-center overflow-visible px-4">
        
        {/* The 3D Rolling Text (Invisible Block) */}
        <div style={{ perspective: '1200px' }} className="w-[16rem] md:w-[24rem] h-[4rem] md:h-[6rem] z-20 relative mr-4">
          
          {/* BOX 1: Rolls UP (DIRECTOR -> WRITER) */}
          {(rollState === 0 || rollState === 1) && (
            <div 
              style={{
                transformStyle: 'preserve-3d',
                transform: rollState === 1 ? 'translateZ(-3rem) rotateX(90deg)' : 'translateZ(-3rem) rotateX(0deg)',
              }}
              className="w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]"
            >
              {/* Front face (DIRECTOR) */}
              <div 
                style={{ transform: 'translateZ(3rem)' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="font-display text-4xl md:text-5xl lg:text-6xl tracking-widest text-white">DIRECTOR</span>
              </div>
              
              {/* Bottom face (WRITER) */}
              <div 
                style={{ transform: 'rotateX(-90deg) translateZ(3rem)' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="font-display text-4xl md:text-5xl lg:text-6xl tracking-widest text-white">WRITER</span>
              </div>
            </div>
          )}

          {/* BOX 2: Rolls LEFT (WRITER -> ACTOR) */}
          {(rollState === 2 || rollState === 3) && (
            <div 
              style={{
                transformStyle: 'preserve-3d',
                transform: rollState === 3 ? 'translateZ(-12rem) rotateY(-90deg)' : 'translateZ(-12rem) rotateY(0deg)',
              }}
              className="w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]"
            >
              {/* Front face (WRITER) */}
              <div 
                style={{ transform: 'translateZ(12rem)' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="font-display text-4xl md:text-5xl lg:text-6xl tracking-widest text-white">WRITER</span>
              </div>
              
              {/* Right face (ACTOR) */}
              <div 
                style={{ transform: 'rotateY(90deg) translateZ(12rem)' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="font-display text-4xl md:text-5xl lg:text-6xl tracking-widest text-white">ACTOR</span>
              </div>
            </div>
          )}
        </div>

        {/* The Static Words (TARUN KAPOOR) */}
        {STATIC_WORDS.map((word, index) => {
          const isVisible = visibleCount > index; 
          
          return (
            <div
              key={word}
              style={{
                gridTemplateColumns: isVisible ? '1fr' : '0fr',
                marginLeft: isVisible ? '1.5rem' : '0',
                opacity: isVisible ? 1 : 0,
              }}
              className="grid transition-all duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
            >
              <div 
                style={{ 
                  transform: isVisible ? 'translateX(0)' : 'translateX(4rem)' 
                }}
                className="min-w-0 overflow-hidden transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
              >
                <span className="block whitespace-nowrap font-display text-[2.5rem] md:text-5xl lg:text-6xl tracking-widest opacity-90">
                  {word}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Counter */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
        <span className="font-display text-xl tracking-widest opacity-70 md:text-2xl">
          {progress}%
        </span>
      </div>
    </div>
  );
}
