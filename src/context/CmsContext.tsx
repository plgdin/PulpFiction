import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Video, VideoCategory } from '@/types/video';
import { CmsData, SiteSettings, HeroContent, FooterContent } from '@/types/cms';
import {
  videos as defaultVideos,
  categories as defaultCategories,
  featuredVideo as defaultFeaturedVideo,
} from '@/data/videos';

const CMS_STORAGE_KEY = 'pulpfiction_cms_data';
const CMS_PASSWORD_KEY = 'pulpfiction_cms_password';
const CMS_AUTH_KEY = 'pulpfiction_cms_auth';
const DEFAULT_PASSWORD = 'admin123';
const MAX_UNDO_HISTORY = 30;

const getDefaultData = (): CmsData => ({
  siteSettings: {
    siteName: 'TARUN KAPOOR',
    siteDescription: 'Director & Cinematographer',
    behanceUrl: 'https://www.behance.net/tarunkapoor2',
    email: 'contact@tarunkapoor.com',
    instagramUrl: '',
    youtubeUrl: '',
  },
  heroContent: {
    badge: 'Director Actor & Writer',
    title: defaultFeaturedVideo.title,
    location: 'Bangalore, India',
    availability: 'Available for Freelance & Fulltime',
    description: defaultFeaturedVideo.description,
    ctaPrimaryText: 'View Reel',
    ctaSecondaryText: 'Full Portfolio',
    portfolioUrl: 'https://www.behance.net/tarunkapoor2',
    featuredVideoUrl: defaultFeaturedVideo.videoUrl,
    featuredVideoThumbnail: defaultFeaturedVideo.thumbnail,
    backgroundImage: '',
  },
  categories: [...defaultCategories],
  videos: [...defaultVideos],
  footerContent: {
    description:
      'Director & Cinematographer crafting visual stories that move, inspire, and captivate.',
    copyright: '© {year} Tarun Kapoor. All rights reserved.',
  },
});

interface CmsContextType {
  data: CmsData;
  updateSiteSettings: (settings: SiteSettings) => void;
  updateHeroContent: (hero: HeroContent) => void;
  updateCategories: (categories: VideoCategory[]) => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, video: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  updateFooterContent: (footer: FooterContent) => void;
  getVideosByCategory: (category: string) => Video[];
  getFeaturedVideo: () => Video;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetToDefaults: () => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  updatePassword: (newPassword: string) => void;
  // Undo
  undo: () => void;
  canUndo: boolean;
  undoCount: number;
}

const CmsContext = createContext<CmsContextType | null>(null);

export const useCms = (): CmsContextType => {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error('useCms must be used within CmsProvider');
  return ctx;
};

const loadData = (): CmsData => {
  try {
    const stored = localStorage.getItem(CMS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const defaults = getDefaultData();
      return {
        ...defaults,
        ...parsed,
        siteSettings: { ...defaults.siteSettings, ...parsed.siteSettings },
        heroContent: { ...defaults.heroContent, ...parsed.heroContent },
        footerContent: { ...defaults.footerContent, ...parsed.footerContent },
      };
    }
  } catch (e) {
    console.error('Failed to load CMS data:', e);
  }
  return getDefaultData();
};

const saveData = (data: CmsData) => {
  try {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save CMS data:', e);
  }
};

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CmsData>(loadData);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(CMS_AUTH_KEY) === 'true';
  });

  // Undo history stack
  const [undoHistory, setUndoHistory] = useState<CmsData[]>([]);
  const skipHistoryRef = useRef(false);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Wraps setData to push current state to undo history first
  const updateWithHistory = useCallback((updater: (prev: CmsData) => CmsData) => {
    setData((prev) => {
      // Push current state to undo history before applying change
      setUndoHistory((history) => {
        const newHistory = [...history, prev];
        // Trim to max size
        if (newHistory.length > MAX_UNDO_HISTORY) {
          return newHistory.slice(newHistory.length - MAX_UNDO_HISTORY);
        }
        return newHistory;
      });
      return updater(prev);
    });
  }, []);

  const undo = useCallback(() => {
    setUndoHistory((history) => {
      if (history.length === 0) return history;
      const newHistory = [...history];
      const previousState = newHistory.pop()!;
      skipHistoryRef.current = true;
      setData(previousState);
      return newHistory;
    });
  }, []);

  const updateSiteSettings = useCallback(
    (settings: SiteSettings) => updateWithHistory((d) => ({ ...d, siteSettings: settings })),
    [updateWithHistory]
  );

  const updateHeroContent = useCallback(
    (hero: HeroContent) => updateWithHistory((d) => ({ ...d, heroContent: hero })),
    [updateWithHistory]
  );

  const updateCategories = useCallback(
    (categories: VideoCategory[]) => updateWithHistory((d) => ({ ...d, categories })),
    [updateWithHistory]
  );

  const addVideo = useCallback(
    (video: Video) => updateWithHistory((d) => ({ ...d, videos: [...d.videos, video] })),
    [updateWithHistory]
  );

  const updateVideo = useCallback(
    (id: string, videoUpdate: Partial<Video>) =>
      updateWithHistory((d) => ({
        ...d,
        videos: d.videos.map((v) => (v.id === id ? { ...v, ...videoUpdate } : v)),
      })),
    [updateWithHistory]
  );

  const deleteVideo = useCallback(
    (id: string) => updateWithHistory((d) => ({ ...d, videos: d.videos.filter((v) => v.id !== id) })),
    [updateWithHistory]
  );

  const updateFooterContent = useCallback(
    (footerContent: FooterContent) => updateWithHistory((d) => ({ ...d, footerContent })),
    [updateWithHistory]
  );

  const getVideosByCategory = useCallback(
    (category: string) => data.videos.filter((v) => v.category === category),
    [data.videos]
  );

  const getFeaturedVideo = useCallback((): Video => {
    const hero = data.heroContent;
    return {
      id: 'featured',
      title: hero.title,
      category: 'brand-films',
      thumbnail: hero.featuredVideoThumbnail || defaultFeaturedVideo.thumbnail,
      duration: '5:00',
      year: new Date().getFullYear().toString(),
      description: hero.description,
      videoUrl: hero.featuredVideoUrl || defaultFeaturedVideo.videoUrl,
    };
  }, [data.heroContent]);

  const exportData = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const importData = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as CmsData;
      if (!parsed.videos || !parsed.categories) return false;
      updateWithHistory(() => parsed);
      return true;
    } catch {
      return false;
    }
  }, [updateWithHistory]);

  const resetToDefaults = useCallback(() => {
    updateWithHistory(() => getDefaultData());
  }, [updateWithHistory]);

  const login = useCallback((password: string): boolean => {
    const stored = localStorage.getItem(CMS_PASSWORD_KEY) || DEFAULT_PASSWORD;
    if (password === stored) {
      setIsAuthenticated(true);
      sessionStorage.setItem(CMS_AUTH_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(CMS_AUTH_KEY);
  }, []);

  const updatePassword = useCallback((newPassword: string) => {
    localStorage.setItem(CMS_PASSWORD_KEY, newPassword);
  }, []);

  return (
    <CmsContext.Provider
      value={{
        data,
        updateSiteSettings,
        updateHeroContent,
        updateCategories,
        addVideo,
        updateVideo,
        deleteVideo,
        updateFooterContent,
        getVideosByCategory,
        getFeaturedVideo,
        exportData,
        importData,
        resetToDefaults,
        isAuthenticated,
        login,
        logout,
        updatePassword,
        undo,
        canUndo: undoHistory.length > 0,
        undoCount: undoHistory.length,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};
