import { useMemo, useState, useEffect, useRef, type CSSProperties, type SyntheticEvent } from 'react';
import { Play, ExternalLink, Volume2, VolumeX, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Video } from '@/types/video';
import { HeroContent } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import heroBg from '@/assets/hero-bg.jpg';

const CONTENT_COLLAPSE_DELAY_MS = 7000;
const TITLE_MOTION_MS = 1400;
const FRAME_SAMPLE_INTERVAL_MS = 1000;
const PALETTE_EASE_AMOUNT = 0.045;
const PALETTE_UPDATE_THRESHOLD = 120;
const BRIGHT_DOMINANT_COUNT_THRESHOLD = 50;
const OLA_VIDEO_ID = 'ad-5';
const OLA_VIDEO_STREAM =
  'https://vz-5e858353-fc6.b-cdn.net/6a889e8c-7d03-44de-938d-1c5a7ddd2e0b/playlist.m3u8';

type RgbColor = { r: number; g: number; b: number };
type RgbQuad = [RgbColor, RgbColor, RgbColor, RgbColor];

type HeroPalette = {
  accent: string;
  accentSoft: string;
  accentDeep: string;
  secondary: string;
  secondarySoft: string;
  highlight: string;
  shadow: string;
  dominantStops: [string, string, string, string];
  titleGradient: string;
};

interface HeroSectionProps {
  video: Video;
  videos: Video[];
  heroContent: HeroContent;
  onPlay: (video: Video) => void;
}

type HeroSlide = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  previewUrl: string;
  hasVideoPreview: boolean;
  video: Video;
};

const DEFAULT_PALETTE: HeroPalette = {
  accent: '255 205 82',
  accentSoft: '255 227 154',
  accentDeep: '202 92 34',
  secondary: '245 101 72',
  secondarySoft: '255 170 112',
  highlight: '255 244 205',
  shadow: '32 10 5',
  dominantStops: [
    '255 244 205',
    '255 227 154',
    '255 205 82',
    '245 101 72',
  ],
  titleGradient:
    'linear-gradient(120deg, rgb(255 244 205 / 0.98) 0%, rgb(255 227 154 / 0.96) 18%, rgb(255 205 82 / 0.98) 48%, rgb(245 101 72 / 0.95) 82%, rgb(255 235 200 / 0.98) 100%)',
};

const isPlayableHeroVideo = (url: string) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('.m3u8') || lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov');
};

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const mixRgb = (base: RgbColor, overlay: RgbColor, amount: number): RgbColor => ({
  r: clampChannel(base.r + (overlay.r - base.r) * amount),
  g: clampChannel(base.g + (overlay.g - base.g) * amount),
  b: clampChannel(base.b + (overlay.b - base.b) * amount),
});

const brighten = (color: RgbColor, amount: number) => mixRgb(color, { r: 255, g: 255, b: 255 }, amount);

const deepen = (color: RgbColor, amount: number) => mixRgb(color, { r: 12, g: 10, b: 18 }, amount);

const colorDistance = (first: RgbColor, second: RgbColor) =>
  Math.abs(first.r - second.r) + Math.abs(first.g - second.g) + Math.abs(first.b - second.b);

const luminance = ({ r, g, b }: RgbColor) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const saturation = ({ r, g, b }: RgbColor) => Math.max(r, g, b) - Math.min(r, g, b);

const hue = ({ r, g, b }: RgbColor) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) return 0;

  let value = 0;
  if (max === red) {
    value = ((green - blue) / delta) % 6;
  } else if (max === green) {
    value = (blue - red) / delta + 2;
  } else {
    value = (red - green) / delta + 4;
  }

  return (value * 60 + 360) % 360;
};

const hueDistance = (first: number, second: number) => {
  const difference = Math.abs(first - second);
  return Math.min(difference, 360 - difference);
};

const toTriplet = ({ r, g, b }: RgbColor) => `${r} ${g} ${b}`;

const fromTriplet = (triplet: string): RgbColor => {
  const [r = '255', g = '205', b = '82'] = triplet.split(/\s+/);
  return {
    r: Number(r),
    g: Number(g),
    b: Number(b),
  };
};

const toHslString = ({ r, g, b }: RgbColor) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return `0 0% ${Math.round(lightness * 100)}%`;
  }

  const saturation =
    delta / (1 - Math.abs(2 * lightness - 1));
  let hueValue = 0;

  if (max === red) {
    hueValue = ((green - blue) / delta) % 6;
  } else if (max === green) {
    hueValue = (blue - red) / delta + 2;
  } else {
    hueValue = (red - green) / delta + 4;
  }

  const normalizedHue = Math.round((hueValue * 60 + 360) % 360);
  return `${normalizedHue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
};

const paletteDistance = (first: HeroPalette, second: HeroPalette) => {
  return first.dominantStops.reduce((total, stop, index) => {
    return total + colorDistance(fromTriplet(stop), fromTriplet(second.dominantStops[index]));
  }, 0);
};

const interpolateColor = (from: RgbColor, to: RgbColor, amount: number) =>
  mixRgb(from, to, amount);

const interpolatePalette = (from: HeroPalette, to: HeroPalette, amount: number) => {
  const nextDominants = from.dominantStops.map((stop, index) =>
    interpolateColor(fromTriplet(stop), fromTriplet(to.dominantStops[index]), amount)
  ) as RgbQuad;

  return buildPalette(nextDominants);
};

const buildPaletteFromStops = (dominantStops: RgbQuad): HeroPalette => {
  const accent = dominantStops[1];
  const accentSoft = brighten(dominantStops[0], 0.14);
  const accentDeep = deepen(dominantStops[2], 0.16);
  const secondary = dominantStops[2];
  const secondarySoft = brighten(dominantStops[2], 0.2);
  const highlight = brighten(mixRgb(dominantStops[0], dominantStops[1], 0.5), 0.08);
  const shadow = deepen(mixRgb(dominantStops[3], { r: 10, g: 10, b: 18 }, 0.45), 0.28);

  return {
    accent: toTriplet(accent),
    accentSoft: toTriplet(accentSoft),
    accentDeep: toTriplet(accentDeep),
    secondary: toTriplet(secondary),
    secondarySoft: toTriplet(secondarySoft),
    highlight: toTriplet(highlight),
    shadow: toTriplet(shadow),
    dominantStops: dominantStops.map((stop) => toTriplet(stop)) as [string, string, string, string],
    titleGradient: `linear-gradient(118deg, rgb(${toTriplet(dominantStops[0])} / 0.98) 0%, rgb(${toTriplet(
      dominantStops[1]
    )} / 0.97) 28%, rgb(${toTriplet(dominantStops[2])} / 0.98) 62%, rgb(${toTriplet(
      dominantStops[3]
    )} / 0.96) 100%)`,
  };
};

const buildFocusedPalette = (dominantSource: RgbColor, deepToneSource?: RgbColor): HeroPalette => {
  const toneHue = hue(dominantSource);
  const deepBase =
    deepToneSource ||
    (toneHue <= 28 || toneHue >= 340
      ? mixRgb(dominantSource, { r: 96, g: 18, b: 18 }, 0.42)
      : deepen(dominantSource, 0.18));
  const focusedStops: RgbQuad =
    toneHue <= 28 || toneHue >= 340
      ? [
          brighten(dominantSource, 0.08),
          mixRgb(dominantSource, deepBase, 0.12),
          mixRgb(dominantSource, deepBase, 0.42),
          deepen(deepBase, 0.08),
        ]
      : [
          brighten(dominantSource, 0.2),
          brighten(dominantSource, 0.08),
          mixRgb(dominantSource, deepBase, 0.28),
          deepen(deepBase, 0.06),
        ];

  return buildPaletteFromStops(focusedStops);
};

const buildPalette = (
  dominantSources: RgbQuad | RgbColor[],
): HeroPalette => {
  const fallback: RgbQuad = [
    fromTriplet(DEFAULT_PALETTE.dominantStops[0]),
    fromTriplet(DEFAULT_PALETTE.dominantStops[1]),
    fromTriplet(DEFAULT_PALETTE.dominantStops[2]),
    fromTriplet(DEFAULT_PALETTE.dominantStops[3]),
  ];

  const sources = [
    dominantSources[0] || fallback[0],
    dominantSources[1] || dominantSources[0] || fallback[1],
    dominantSources[2] || dominantSources[1] || dominantSources[0] || fallback[2],
    dominantSources[3] || dominantSources[2] || dominantSources[1] || fallback[3],
  ] as RgbQuad;

  const dominantStops: RgbQuad = [
    toTriplet(brighten(sources[0], 0.12)),
    toTriplet(brighten(sources[1], 0.08)),
    toTriplet(brighten(sources[2], 0.06)),
    toTriplet(brighten(sources[3], 0.04)),
  ].map((stop) => fromTriplet(stop)) as RgbQuad;

  return buildPaletteFromStops(dominantStops);
};

const extractPaletteFromSource = (
  source: CanvasImageSource,
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): HeroPalette => {
  context.canvas.width = width;
  context.canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, width, height);
  const buckets = new Map<string, { color: RgbColor; score: number; count: number }>();

  for (let index = 0; index < data.length; index += 16) {
    const alpha = data[index + 3];
    if (alpha < 160) continue;

    const color = {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
    };

    const lightness = luminance(color);
    const vividness = saturation(color);
    if (lightness < 22 || lightness > 248 || vividness < 18) continue;

    const pixelIndex = index / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const xCenterDistance = Math.abs(x - width / 2) / (width / 2);
    const yFromBottom = y / height;
    const positionalWeight = 1 + (1 - xCenterDistance) * 0.65 + yFromBottom * 0.35;
    const colorHue = hue(color);
    const warmHueBias = colorHue <= 32 || colorHue >= 340 ? 42 : colorHue <= 52 ? 20 : 0;
    const redPresence = Math.max(color.r - Math.max(color.g, color.b), 0) * 0.7;
    const warmPresence = Math.max(color.r - color.b, 0) * 0.3 + Math.max(color.g - color.b, 0) * 0.08;
    const neutralPenalty = vividness < 44 ? (44 - vividness) * 2.4 : 0;
    const brightNeutralPenalty = lightness > 210 && vividness < 72 ? (lightness - 210) * 1.85 : 0;
    const whiteBiasPenalty = lightness > 228 ? (lightness - 228) * 3.2 : 0;

    const quantized = {
      r: Math.round(color.r / 20) * 20,
      g: Math.round(color.g / 20) * 20,
      b: Math.round(color.b / 20) * 20,
    };
    const key = `${quantized.r}-${quantized.g}-${quantized.b}`;
    const rawScore =
      vividness * 1.45 +
      Math.max(lightness - 42, 0) * 0.12 +
      warmHueBias +
      redPresence +
      warmPresence -
      neutralPenalty -
      brightNeutralPenalty -
      whiteBiasPenalty;
    const boost = Math.max(rawScore, 0) * positionalWeight;
    const current = buckets.get(key);

    if (current) {
      current.score += boost;
      current.count += 1;
    } else {
      buckets.set(key, {
        color: {
          r: clampChannel(quantized.r),
          g: clampChannel(quantized.g),
          b: clampChannel(quantized.b),
        },
        score: boost,
        count: 1,
      });
    }
  }

  const rankedColors = [...buckets.values()]
    .map((entry) => ({
      color: entry.color,
      score: entry.score + entry.count * 3,
      count: entry.count,
    }))
    .sort((first, second) => second.score - first.score);

  if (rankedColors.length === 0) {
    return DEFAULT_PALETTE;
  }

  const brightDominantColor = rankedColors.find(({ color, count }) => {
    const lightness = luminance(color);
    const vividness = saturation(color);
    return (
      count >= BRIGHT_DOMINANT_COUNT_THRESHOLD &&
      vividness >= 72 &&
      lightness >= 70 &&
      lightness <= 220
    );
  });

  if (brightDominantColor) {
    const dominantHue = hue(brightDominantColor.color);
    const deeperCompanion = rankedColors
      .filter(({ color }) => {
        const candidateHue = hue(color);
        const candidateLightness = luminance(color);
        const candidateSaturation = saturation(color);

        return (
          hueDistance(candidateHue, dominantHue) <= 22 &&
          candidateSaturation >= 54 &&
          candidateLightness < luminance(brightDominantColor.color) - 10
        );
      })
      .sort((first, second) => second.score - first.score)[0]?.color;

    return buildFocusedPalette(brightDominantColor.color, deeperCompanion);
  }

  const vibrantDistinctColors = rankedColors
    .filter(({ color }) => {
      const lightness = luminance(color);
      const vividness = saturation(color);
      return vividness >= 42 && lightness <= 228;
    })
    .reduce<RgbColor[]>((selected, { color }) => {
      if (selected.some((existing) => colorDistance(existing, color) < 76)) {
        return selected;
      }
      return [...selected, color];
    }, []);

  const fallbackDistinctColors = rankedColors.reduce<RgbColor[]>((selected, { color }) => {
    if (selected.some((existing) => colorDistance(existing, color) < 72)) {
      return selected;
    }
    return [...selected, color];
  }, []);

  const dominantColors = [...vibrantDistinctColors, ...fallbackDistinctColors]
    .slice(0, 4);

  while (dominantColors.length < 4) {
    dominantColors.push(fromTriplet(DEFAULT_PALETTE.dominantStops[dominantColors.length]));
  }

  return buildPalette(dominantColors as [RgbColor, RgbColor, RgbColor, RgbColor]);
};

const extractPaletteFromThumbnail = async (src: string): Promise<HeroPalette> => {
  if (!src || src.includes('behance.net')) return DEFAULT_PALETTE;

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.decoding = 'async';

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return DEFAULT_PALETTE;

  return extractPaletteFromSource(image, context, 40, 40);
};

const HeroSection = ({
  video,
  videos,
  heroContent,
  onPlay,
}: HeroSectionProps) => {
  const slides = useMemo<HeroSlide[]>(() => {
    const cmsSlides = (heroContent.slideshowVideos || [])
      .map((videoId) => videos.find((item) => item.id === videoId))
      .filter((item): item is Video => Boolean(item));

    const olaSourceVideo =
      videos.find((item) => item.id === OLA_VIDEO_ID) ||
      videos.find((item) => item.videoUrl === OLA_VIDEO_STREAM) ||
      videos.find((item) => item.title.toLowerCase().includes('ola'));

    const orderedVideos: Video[] = cmsSlides.length > 0
      ? cmsSlides
      : olaSourceVideo
        ? [olaSourceVideo, ...videos.filter((item) => item.id !== olaSourceVideo.id)]
        : [...videos];

    const playableVideos = orderedVideos.filter((item) => isPlayableHeroVideo(item.videoUrl));
    const selectedVideos = playableVideos.slice(0, 5);
    const safeVideos = selectedVideos.length > 0 ? selectedVideos : isPlayableHeroVideo(video.videoUrl) ? [video] : [];
    const fallbackImage =
      heroContent.backgroundImage ||
      heroContent.featuredVideoThumbnail ||
      heroBg;

    if (safeVideos.length === 0) {
      return [
        {
          id: 'hero-fallback',
          title: heroContent.title || video.title,
          description: heroContent.description || video.description,
          thumbnail: fallbackImage,
          previewUrl: '',
          hasVideoPreview: false,
          video,
        },
      ];
    }

    return safeVideos.map((item) => {
      const hasCdnVideo = item.videoUrl.includes('.b-cdn.net');
      const previewUrl = hasCdnVideo
        ? item.videoUrl.replace('/playlist.m3u8', '/play_720p.mp4')
        : item.videoUrl;

      return {
        id: item.id,
        title: item.title || heroContent.title || video.title,
        description: item.description || heroContent.description || video.description,
        thumbnail: item.thumbnail || fallbackImage,
        previewUrl,
        hasVideoPreview: isPlayableHeroVideo(previewUrl),
        video: item,
      };
    });
  }, [videos, video, heroContent]);

  const paletteCacheRef = useRef<Record<string, HeroPalette>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const frameSamplerRef = useRef<number | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isTitleCompact, setIsTitleCompact] = useState(false);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [targetPalette, setTargetPalette] = useState<HeroPalette>(DEFAULT_PALETTE);
  const [heroPalette, setHeroPalette] = useState<HeroPalette>(DEFAULT_PALETTE);

  const dominantColor = heroPalette.accent.replace(/\s+/g, ', ');

  const activeSlide = slides[activeSlideIndex] || slides[0];

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [slides.length]);

  useEffect(() => {
    setIsTitleCompact(false);
    setIsDescriptionVisible(true);
  }, [activeSlideIndex]);

  useEffect(() => {
    if (!activeSlide || activeSlide.hasVideoPreview) return undefined;

    const timer = window.setTimeout(() => {
      setIsDescriptionVisible(false);
      setIsTitleCompact(true);
    }, CONTENT_COLLAPSE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [activeSlide]);

  useEffect(() => {
    if (!activeSlide) return undefined;

    let cancelled = false;
    const paletteKey = activeSlide.thumbnail || activeSlide.previewUrl || activeSlide.id;
    const cachedPalette = paletteCacheRef.current[paletteKey];

    if (cachedPalette) {
      setTargetPalette(cachedPalette);
      return undefined;
    }

    extractPaletteFromThumbnail(activeSlide.thumbnail)
      .then((palette) => {
        if (cancelled) return;
        paletteCacheRef.current[paletteKey] = palette;
        setTargetPalette(palette);
      })
      .catch(() => {
        if (cancelled) return;
        paletteCacheRef.current[paletteKey] = DEFAULT_PALETTE;
        setTargetPalette(DEFAULT_PALETTE);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSlide]);

  useEffect(() => {
    let frameId = 0;
    let isRunning = true;

    const animatePalette = () => {
      if (!isRunning) return;
      
      setHeroPalette((currentPalette) => {
        const difference = paletteDistance(currentPalette, targetPalette);
        if (difference <= 8) {
          isRunning = false;
          return targetPalette;
        }

        return interpolatePalette(currentPalette, targetPalette, PALETTE_EASE_AMOUNT);
      });

      if (isRunning) {
        frameId = window.requestAnimationFrame(animatePalette);
      }
    };

    frameId = window.requestAnimationFrame(animatePalette);

    return () => {
      isRunning = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [targetPalette]);

  useEffect(() => {
    const root = document.documentElement;
    const accent = fromTriplet(heroPalette.accent);
    const accentSoft = fromTriplet(heroPalette.accentSoft);
    const highlight = fromTriplet(heroPalette.highlight);
    const secondary = fromTriplet(heroPalette.secondary);

    root.style.setProperty('--primary', toHslString(accent));
    root.style.setProperty('--foreground', toHslString(highlight));
    root.style.setProperty('--muted-foreground', toHslString(mixRgb(accentSoft, highlight, 0.36)));
    root.style.setProperty('--accent', toHslString(secondary));
    root.style.setProperty('--ring', toHslString(accent));
    root.style.setProperty('--dynamic-primary-rgb', heroPalette.accent);
    root.style.setProperty('--dynamic-secondary-rgb', heroPalette.secondary);
    root.style.setProperty('--dynamic-highlight-rgb', heroPalette.highlight);
  }, [heroPalette]);

  useEffect(() => {
    if (!activeSlide?.hasVideoPreview) return undefined;

    const activeVideo = videoRefs.current[activeSlide.id];
    if (!activeVideo) return undefined;

    if (!frameCanvasRef.current) {
      frameCanvasRef.current = document.createElement('canvas');
    }

    const sampleCanvas = frameCanvasRef.current;
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!sampleContext) return undefined;

    let disposed = false;
    let lastSampleTime = 0;

    const sampleFrame = (timestamp: number) => {
      if (disposed) return;

      const nextFrameId = window.requestAnimationFrame(sampleFrame);
      frameSamplerRef.current = nextFrameId;

      if (timestamp - lastSampleTime < FRAME_SAMPLE_INTERVAL_MS) return;
      if (activeVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      if (activeVideo.paused || activeVideo.ended || activeVideo.videoWidth === 0 || activeVideo.videoHeight === 0) {
        return;
      }

      lastSampleTime = timestamp;

      try {
        const nextPalette = extractPaletteFromSource(activeVideo, sampleContext, 40, 40);
        setTargetPalette((previousPalette) =>
          paletteDistance(previousPalette, nextPalette) < PALETTE_UPDATE_THRESHOLD
            ? previousPalette
            : nextPalette
        );
      } catch {
        // Cross-origin video frames may block canvas reads, in which case we keep the thumbnail palette.
      }
    };

    frameSamplerRef.current = window.requestAnimationFrame(sampleFrame);

    return () => {
      disposed = true;
      if (frameSamplerRef.current !== null) {
        window.cancelAnimationFrame(frameSamplerRef.current);
        frameSamplerRef.current = null;
      }
    };
  }, [activeSlide?.id, activeSlide?.hasVideoPreview]);

  const heroStyle = {
    '--hero-accent': heroPalette.accent,
    '--hero-accent-soft': heroPalette.accentSoft,
    '--hero-accent-deep': heroPalette.accentDeep,
    '--hero-secondary': heroPalette.secondary,
    '--hero-secondary-soft': heroPalette.secondarySoft,
    '--hero-highlight': heroPalette.highlight,
    '--hero-shadow': heroPalette.shadow,
    '--hero-title-gradient': heroPalette.titleGradient,
  } as CSSProperties;

  if (!activeSlide) return null;

  const handleViewPortfolio = () => {
    const url = heroContent.portfolioUrl?.trim();
    if (!url) return;
    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNextSlide = () => {
    if (slides.length <= 1) return;
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePreviousSlide = () => {
    if (slides.length <= 1) return;
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleVideoProgress = (slideIndex: number, event: SyntheticEvent<HTMLVideoElement>) => {
    if (slideIndex !== activeSlideIndex || isTitleCompact) return;

    const playedSeconds = event.currentTarget.currentTime;
    if (playedSeconds >= 7) {
      setIsDescriptionVisible(false);
      setIsTitleCompact(true);
    }
  };

  return (
    <section
      className="hero-synced-shell relative flex min-h-screen min-h-[100svh] w-full items-end overflow-hidden"
      style={heroStyle}
    >
      {/* SVG Liquid Glass Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <filter id="hero-glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves={1} seed={17} result="turbulence" />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
            <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
            <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
          <feSpecularLighting in="softMap" surfaceScale={5} specularConstant={1} specularExponent={100} lightingColor="white" result="specLight">
            <fePointLight x={-200} y={-200} z={300} />
          </feSpecularLighting>
          <feComposite in="specLight" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="litImage" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale={200} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="absolute inset-0">
        {slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          return (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 transition-opacity ease-out',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
              style={{ transitionDuration: '1600ms' }}
            >
              {isActive && slide.hasVideoPreview ? (
                <video
                  ref={(element) => {
                    videoRefs.current[slide.id] = element;
                  }}
                  src={slide.previewUrl}
                  poster={slide.thumbnail}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover"
                  autoPlay
                  muted={isMuted}
                  loop={false}
                  playsInline
                  onTimeUpdate={(event) => handleVideoProgress(index, event)}
                  onEnded={handleNextSlide}
                />
              ) : (
                <img
                  src={slide.thumbnail || heroBg}
                  alt={`${slide.title} background`}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="hero-synced-aura hero-synced-aura-left absolute left-[-12%] top-[8%] h-[28rem] w-[28rem] rounded-full blur-3xl" />
      <div className="hero-synced-aura hero-synced-aura-right absolute bottom-[14%] right-[-10%] h-[24rem] w-[24rem] rounded-full blur-3xl" />
      <div className="hero-synced-aura hero-synced-aura-center absolute left-1/2 top-[18%] h-[20rem] w-[42rem] -translate-x-1/2 rounded-full blur-3xl" />

      <div className="relative z-20 flex h-full w-full items-end px-4 pb-24 pt-28 md:px-12 md:pb-56 md:pt-36">
        <div className="hero-synced-copy relative max-w-5xl">
          <div className="hero-synced-copy-glow absolute -left-10 bottom-0 top-0 w-[min(62vw,44rem)] blur-3xl" />

          <div
            className="mb-4 will-change-transform"
            style={{
              transformOrigin: 'bottom left',
              transform: isTitleCompact ? 'scale(0.72)' : 'scale(1)',
              transition: `transform ${TITLE_MOTION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            <h1
              key={activeSlide.id}
              className="hero-synced-title font-display text-[clamp(2.5rem,10vw,8.1rem)] leading-[0.9] tracking-[0.02em] py-2"
            >
              {activeSlide.title || video.title}
            </h1>
            <p
              key={`${activeSlide.id}-description`}
              className="hero-synced-description mt-4 max-w-2xl text-base leading-relaxed md:text-lg"
              style={{
                opacity: isDescriptionVisible ? 1 : 0,
                transition: `opacity ${TITLE_MOTION_MS * 0.4}ms ease-out`,
              }}
            >
              {activeSlide.description || video.description}
            </p>
          </div>

        {/* Liquid Glass Buttons Row */}
        <div
          className="flex flex-col gap-4 animate-fade-in-up sm:flex-row sm:items-center"
          style={{ animationDelay: '0.5s' }}
        >
          <button
            className="relative flex items-center gap-3 px-8 py-3.5 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 group sm:w-auto w-full justify-center"
            onClick={() => onPlay(activeSlide?.video || video)}
            style={{
              boxShadow: `0 6px 6px rgba(0,0,0,0.2), 0 0 20px rgba(0,0,0,0.1), 0 0 40px rgba(${dominantColor}, 0.15)`,
            }}
          >
            <div className="absolute inset-0 z-0 rounded-full overflow-hidden"
              style={{ backdropFilter: 'blur(3px)', filter: 'url(#hero-glass-distortion)', isolation: 'isolate' }}
            />
            <div className="absolute inset-0 z-[1] rounded-full bg-white/90" />
            <div className="absolute inset-0 z-[2] rounded-full overflow-hidden"
              style={{ boxShadow: 'inset 2px 2px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 1px 1px rgba(255,255,255,0.5)' }}
            />
            <Play className="relative z-[3] h-5 w-5 fill-current text-black" />
            <span
              className="relative z-[3] font-bold text-black text-lg tracking-[0.15em]"
              style={{ fontFamily: "'Antonio', sans-serif" }}
            >
              {heroContent.ctaPrimaryText || 'VIEW REEL'}
            </span>
          </button>

          <button
            className="relative flex items-center gap-3 px-8 py-3.5 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 group sm:w-auto w-full justify-center"
            onClick={handleViewPortfolio}
            style={{
              boxShadow: `0 6px 6px rgba(0,0,0,0.2), 0 0 20px rgba(0,0,0,0.1)`,
            }}
          >
            <div className="absolute inset-0 z-0 rounded-full overflow-hidden"
              style={{ backdropFilter: 'blur(10px)', filter: 'url(#hero-glass-distortion)', isolation: 'isolate' }}
            />
            <div className="absolute inset-0 z-[1] rounded-full" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
            <div className="absolute inset-0 z-[2] rounded-full overflow-hidden border border-white/25"
              style={{ boxShadow: 'inset 2px 2px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 1px 1px rgba(255,255,255,0.2)' }}
            />
            <ExternalLink className="relative z-[3] h-5 w-5 text-white" />
            <span
              className="relative z-[3] font-bold text-white text-lg tracking-[0.15em]"
              style={{ fontFamily: "'Antonio', sans-serif" }}
            >
              {heroContent.ctaSecondaryText || 'PORTFOLIO'}
            </span>
          </button>

          <button
            className="relative hidden sm:flex items-center justify-center w-12 h-12 rounded-full overflow-hidden transition-all duration-500 hover:scale-110"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <div className="absolute inset-0 z-0 rounded-full overflow-hidden"
              style={{ backdropFilter: 'blur(10px)', filter: 'url(#hero-glass-distortion)', isolation: 'isolate' }}
            />
            <div className="absolute inset-0 z-[1] rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
            <div className="absolute inset-0 z-[2] rounded-full overflow-hidden border border-white/20"
              style={{ boxShadow: 'inset 1px 1px 1px 0 rgba(255,255,255,0.3)' }}
            />
            <Plus className="relative z-[3] h-5 w-5 text-white" />
          </button>
        </div>
        </div>
      </div>

      {activeSlide.hasVideoPreview && (
        <Button
          variant="ghost"
          size="icon"
          className="hero-synced-icon-button absolute bottom-20 right-4 z-50 h-12 w-12 rounded-full border-2 md:bottom-24 md:right-10"
          onClick={() => setIsMuted((prev) => !prev)}
          aria-label={isMuted ? 'Unmute hero video' : 'Mute hero video'}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="hero-synced-arrow absolute left-3 top-1/2 z-50 -translate-y-1/2 bg-transparent p-0 md:left-8"
            onClick={handlePreviousSlide}
            aria-label="Previous hero video"
          >
            <ChevronLeft className="h-11 w-11" />
          </button>
          <button
            type="button"
            className="hero-synced-arrow absolute right-3 top-1/2 z-50 -translate-y-1/2 bg-transparent p-0 md:right-8"
            onClick={handleNextSlide}
            aria-label="Next hero video"
          >
            <ChevronRight className="h-11 w-11" />
          </button>
        </>
      )}
    </section>
  );
};

export default HeroSection;