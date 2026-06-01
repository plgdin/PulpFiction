'use client';
import { useRef, useEffect, HTMLAttributes } from 'react';

interface SpotlightConfig {
  radius?: number;
  brightness?: number;
  color?: string;
  smoothing?: number;
}

const useSpotlightEffect = (config: SpotlightConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `${r},${g},${b}`;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouseX !== -1000 && mouseY !== -1000) {
        const radius = config.radius || 155;
        const rgbColor = hexToRgb(config.color || '#FFDE8A');

        // 1. Solid subtle stage atmosphere shadow (keeps background visible, no "turned off" feel)
        ctx.fillStyle = 'rgba(10, 10, 10, 0.42)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Punch a clean followspot circle using 'destination-out' (flat, focused lens light projection)
        ctx.globalCompositeOperation = 'destination-out';
        const holeGradient = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, radius
        );
        holeGradient.addColorStop(0, 'rgba(0, 0, 0, 1.0)');     // Flat lit core
        holeGradient.addColorStop(0.86, 'rgba(0, 0, 0, 0.98)'); // Flat lit core
        holeGradient.addColorStop(0.92, 'rgba(0, 0, 0, 0.85)'); // Focused lens edge transition start
        holeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');     // Edge cut-off
        
        ctx.fillStyle = holeGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Render additive chromatic diffraction edge halo representing focused stage light lens physics
        ctx.globalCompositeOperation = 'screen';
        const ringGradient = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, radius
        );
        ringGradient.addColorStop(0, `rgba(${rgbColor}, ${(config.brightness || 0.45) * 0.45})`);
        ringGradient.addColorStop(0.85, `rgba(${rgbColor}, ${(config.brightness || 0.45) * 0.38})`);
        ringGradient.addColorStop(0.90, `rgba(${rgbColor}, ${(config.brightness || 0.45) * 0.75})`); // Lens edge light highlight ring!
        ringGradient.addColorStop(0.96, `rgba(${rgbColor}, ${(config.brightness || 0.45) * 0.12})`);
        ringGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = ringGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.radius, config.brightness, config.color]);

  return canvasRef;
};

interface ComponentProps extends HTMLAttributes<HTMLCanvasElement> {
  config?: SpotlightConfig;
}

export const Component = ({
  config = {},
  className,
  ...rest
}: ComponentProps) => {
  const spotlightConfig = {
    radius: 155,
    brightness: 0.45,
    color: '#FFDE8A',
    smoothing: 0.1,
    ...config,
  };

  const canvasRef = useSpotlightEffect(spotlightConfig);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] w-full h-full ${className}`}
      {...rest}
    />
  );
};
