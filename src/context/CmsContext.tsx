import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Video, VideoCategory } from '@/types/video';
import { CmsData, SiteSettings, HeroContent, FooterContent, PitchDeck, AboutContent } from '@/types/cms';
import { supabase } from '@/lib/supabase';
import {
  videos as defaultVideos,
  categories as defaultCategories,
  featuredVideo as defaultFeaturedVideo,
} from '@/data/videos';

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
    titleFont: 'Antonio',
    descriptionFont: 'Lexend Peta',
    headerFont: 'Antonio',
    footerFont: 'Lexend Peta',
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
    slideshowVideos: [],
  },
  aboutContent: {
    section1Image: '',
    name: 'Tarun Kapoor',
    title1: 'About.',
    description1: 'Tarun Kapoor is a filmmaker with a relentless eye for cinematic storytelling from India. For years, he has worked for brands such as Budweiser, Royal Enfield, OLA Electric, Flipkart, Nykaa, and many more. His passion lies in using the subtle interplay of styles, lighting, and authentic performances to bring creative visions to life.',
    location: 'Bangalore\nIndia',
    availability: 'Available for\nFreelance & Fulltime',
    section2Image: 'https://a.storyblok.com/f/277682/3000x3751/eaee60f06a/otto-van-den-toorn-profile-02.jpg/m/1440x0/filters:quality(60)',
    title2: 'Background.',
    description2a: "Creativity has woven its way through every chapter of Tarun's life, seamlessly transitioning from theatre as an actor to crafting captivating images as a director and cinematographer. He's discovered that whether he's captivated by the emotional depth of a performance or the rhythm and mood of a scene, it all springs from the same well of cinematic inspiration within.",
    description2b: "Tarun has a profound passion for the creative journey. For him, there's something truly special about collaborating with others, grasping their vision, and bringing it to life. It's about transforming concepts into something real. This exchange of creativity is profoundly fulfilling. Without it, filmmaking would lose its authentic charm.",
    section3Image: '',
    title3: "Let's Connect.",
    description3: 'Ready to collaborate on a new project or just want to say hello? Get in touch directly to discuss cinematic storytelling and visual journeys.',
    quote: '"I believe every frame should make the audience feel something."',
    quoteAuthor: 'Tarun Kapoor',
  },
  categories: [...defaultCategories],
  videos: [...defaultVideos],
  footerContent: {
    description:
      'Director & Cinematographer crafting visual stories that move, inspire, and captivate.',
    copyright: '© {year} Tarun Kapoor. All rights reserved.',
  },
  pitchDecks: [
    {
      id: 'deck-1',
      title: 'Pitch Deck 01',
      embedUrl: 'https://www.canva.com/design/DAGsqg2zIAc/KGOQQyez5dRGT37dTytVdA/view?embed',
      originalUrl: 'https://www.canva.com/design/DAGsqg2zIAc/KGOQQyez5dRGT37dTytVdA/view',
      accent: '#F5D467',
    },
    {
      id: 'deck-2',
      title: 'Pitch Deck 02',
      embedUrl: 'https://www.canva.com/design/DAGgAu3cabE/Do2TGdWCExtaMgC_e2jg9g/view?embed',
      originalUrl: 'https://www.canva.com/design/DAGgAu3cabE/Do2TGdWCExtaMgC_e2jg9g/view',
      accent: '#67B5F5',
    },
    {
      id: 'deck-3',
      title: 'Pitch Deck 03',
      embedUrl: 'https://www.canva.com/design/DAGk4uxEhTc/8FTef9s_GhUeZ_Jpc_eJRg/view?embed',
      originalUrl: 'https://www.canva.com/design/DAGk4uxEhTc/8FTef9s_GhUeZ_Jpc_eJRg/view',
      accent: '#F567A5',
    },
    {
      id: 'deck-4',
      title: 'Pitch Deck 04',
      embedUrl: 'https://www.canva.com/design/DAG5l_HWoWo/sMYEnc7a2krfakR22fZKlg/view?embed',
      originalUrl: 'https://www.canva.com/design/DAG5l_HWoWo/sMYEnc7a2krfakR22fZKlg/view',
      accent: '#A567F5',
    },
    {
      id: 'deck-5',
      title: 'Pitch Deck 05',
      embedUrl: 'https://www.canva.com/design/DAHBXD3QO3Y/Aq-yS9cLoEylVIkZMSo9Rg/view?embed',
      originalUrl: 'https://www.canva.com/design/DAHBXD3QO3Y/Aq-yS9cLoEylVIkZMSo9Rg/view',
      accent: '#67F5B5',
    },
    {
      id: 'deck-6',
      title: 'Pitch Deck 06',
      embedUrl: 'https://www.canva.com/design/DAGtyX7Ltrk/69a5-dPmu-YQzU1IjnvG6Q/view?embed',
      originalUrl: 'https://www.canva.com/design/DAGtyX7Ltrk/69a5-dPmu-YQzU1IjnvG6Q/view',
      accent: '#F5A567',
    },
    {
      id: 'deck-7',
      title: 'Pitch Deck 07',
      embedUrl: 'https://www.canva.com/design/DAG5b3-rx80/pn7MV4MfAlkYIycTd4HeNw/view?embed',
      originalUrl: 'https://www.canva.com/design/DAG5b3-rx80/pn7MV4MfAlkYIycTd4HeNw/view',
      accent: '#F56767',
    },
    {
      id: 'deck-8',
      title: 'Pitch Deck 08',
      embedUrl: 'https://www.canva.com/design/DAG5b5gJlvQ/MuOQxV9Fv_2lCFXE418RUw/view?embed',
      originalUrl: 'https://www.canva.com/design/DAG5b5gJlvQ/MuOQxV9Fv_2lCFXE418RUw/view',
      accent: '#67D4F5',
    },
  ],
});

interface CmsContextType {
  data: CmsData;
  isLoading: boolean;
  updateSiteSettings: (settings: SiteSettings) => void;
  updateHeroContent: (hero: HeroContent) => void;
  updateAboutContent: (content: AboutContent) => void;
  updateCategories: (categories: VideoCategory[]) => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, video: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  reorderVideos: (reorderedVideos: Video[]) => void;
  updateFooterContent: (footer: FooterContent) => void;
  updatePitchDecks: (pitchDecks: PitchDeck[]) => void;
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

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CmsData>(getDefaultData());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(CMS_AUTH_KEY) === 'true';
  });

  // Undo history stack
  const [undoHistory, setUndoHistory] = useState<CmsData[]>([]);
  const skipHistoryRef = useRef(false);

  // Wraps setData to push current state to undo history first
  const updateWithHistory = useCallback((updater: (prev: CmsData) => CmsData) => {
    setData((prev) => {
      setUndoHistory((history) => {
        const newHistory = [...history, prev];
        if (newHistory.length > MAX_UNDO_HISTORY) {
          return newHistory.slice(newHistory.length - MAX_UNDO_HISTORY);
        }
        return newHistory;
      });
      return updater(prev);
    });
  }, []);

  const seedDatabase = async () => {
    const defaultData = getDefaultData();
    console.log("Seeding Supabase with default data...");
    
    await supabase.from('global_settings').upsert({
      id: 1,
      site_settings: defaultData.siteSettings,
      hero_content: defaultData.heroContent,
      about_content: defaultData.aboutContent,
      footer_content: defaultData.footerContent
    });

    const mappedCategories = defaultData.categories.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug
    }));
    await supabase.from('categories').upsert(mappedCategories);

    const mappedVideos = defaultData.videos.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      thumbnail: v.thumbnail,
      video_url: v.videoUrl,
      duration: v.duration,
      year: v.year,
      category: v.category
    }));
    await supabase.from('videos').upsert(mappedVideos);
  };

  useEffect(() => {
    // Inject fonts into CSS root variables dynamically
    if (data.siteSettings?.titleFont) {
      document.documentElement.style.setProperty('--font-title', `'${data.siteSettings.titleFont}', sans-serif`);
    }
    if (data.siteSettings?.descriptionFont) {
      document.documentElement.style.setProperty('--font-description', `'${data.siteSettings.descriptionFont}', sans-serif`);
    }
    if (data.siteSettings?.headerFont) {
      document.documentElement.style.setProperty('--font-header', `'${data.siteSettings.headerFont}', sans-serif`);
    }
    if (data.siteSettings?.footerFont) {
      document.documentElement.style.setProperty('--font-footer', `'${data.siteSettings.footerFont}', sans-serif`);
    }
  }, [
    data.siteSettings?.titleFont, 
    data.siteSettings?.descriptionFont,
    data.siteSettings?.headerFont,
    data.siteSettings?.footerFont
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [{ data: settings }, { data: categories }, { data: videos }] = await Promise.all([
          supabase.from('global_settings').select('*').maybeSingle(),
          supabase.from('categories').select('*'),
          supabase.from('videos').select('*')
        ]);

        let finalData = getDefaultData();

        if (!categories || categories.length === 0) {
          // One-time migration for new empty Supabase project
          await seedDatabase();
          const [newSettings, newCategories, newVideos] = await Promise.all([
            supabase.from('global_settings').select('*').maybeSingle(),
            supabase.from('categories').select('*'),
            supabase.from('videos').select('*')
          ]);
          
          if (newCategories.data && newCategories.data.length > 0) {
            finalData = mapSupabaseToCmsData(newSettings.data, newCategories.data, newVideos.data || []);
          }
        } else {
          finalData = mapSupabaseToCmsData(settings, categories, videos);
        }
        
        // Merge with defaults to ensure missing fields don't crash the app
        setData({
          siteSettings: { ...finalData.siteSettings },
          heroContent: { ...finalData.heroContent },
          aboutContent: { ...finalData.aboutContent },
          footerContent: { ...finalData.footerContent },
          categories: finalData.categories,
          videos: finalData.videos,
          pitchDecks: finalData.pitchDecks
        });
      } catch (error) {
        console.error('Error fetching Supabase data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const mapSupabaseToCmsData = (settings: any, categories: any[], videos: any[]): CmsData => {
    const defaultData = getDefaultData();
    const videoOrder: string[] = settings?.hero_content?.videoOrder || [];
    let mappedVideos = (videos || []).map(v => ({
      id: v.id,
      title: v.title,
      description: v.description || '',
      thumbnail: v.thumbnail || '',
      videoUrl: v.video_url || '',
      duration: v.duration || '',
      year: v.year || '',
      category: v.category
    })) as Video[];

    // Apply saved video order if available
    if (videoOrder.length > 0) {
      const orderMap = new Map(videoOrder.map((id, idx) => [id, idx]));
      mappedVideos.sort((a, b) => {
        const aIdx = orderMap.has(a.id) ? orderMap.get(a.id)! : Infinity;
        const bIdx = orderMap.has(b.id) ? orderMap.get(b.id)! : Infinity;
        return aIdx - bIdx;
      });
    }

    return {
      siteSettings: {
        ...defaultData.siteSettings,
        ...(settings?.site_settings || {}),
      },
      heroContent: settings?.hero_content ? { ...defaultData.heroContent, ...settings.hero_content, slideshowVideos: settings.hero_content.slideshowVideos || [] } : defaultData.heroContent,
      aboutContent: settings?.about_content || defaultData.aboutContent,
      footerContent: settings?.footer_content || defaultData.footerContent,
      categories: (categories || []).map(c => ({ id: c.id, title: c.title, slug: c.slug })),
      videos: mappedVideos,
      pitchDecks: settings?.hero_content?.pitchDecks || defaultData.pitchDecks
    };
  };

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

  const updateSiteSettings = useCallback(async (settings: SiteSettings) => {
    updateWithHistory((d) => ({ ...d, siteSettings: settings }));
    const { error } = await supabase.from('global_settings').upsert({ id: 1, site_settings: settings });
    if (error) console.error("Error updating site settings in Supabase:", error);
  }, [updateWithHistory]);

  const updateHeroContent = useCallback(async (hero: HeroContent) => {
    updateWithHistory((d) => ({ ...d, heroContent: hero }));
    const { error } = await supabase.from('global_settings').upsert({ id: 1, hero_content: hero });
    if (error) console.error("Error updating hero content in Supabase:", error);
  }, [updateWithHistory]);

  const updateAboutContent = useCallback(async (about: AboutContent) => {
    updateWithHistory((d) => ({ ...d, aboutContent: about }));
    const { error } = await supabase.from('global_settings').upsert({ id: 1, about_content: about });
    if (error) console.error("Error updating about content in Supabase:", error);
  }, [updateWithHistory]);

  const updateCategories = useCallback(async (categories: VideoCategory[]) => {
    updateWithHistory((d) => ({ ...d, categories }));
    const mapped = categories.map(c => ({ id: c.id, title: c.title, slug: c.slug }));
    const { error } = await supabase.from('categories').upsert(mapped);
    if (error) console.error("Error updating categories in Supabase:", error);
  }, [updateWithHistory]);

  const addVideo = useCallback(async (video: Video) => {
    updateWithHistory((d) => ({ ...d, videos: [...d.videos, video] }));
    const { error } = await supabase.from('videos').insert({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      video_url: video.videoUrl,
      duration: video.duration,
      year: video.year,
      category: video.category
    });
    if (error) console.error("Error adding video to Supabase:", error);
  }, [updateWithHistory]);

  const updateVideo = useCallback(async (id: string, videoUpdate: Partial<Video>) => {
    updateWithHistory((d) => ({
      ...d,
      videos: d.videos.map((v) => (v.id === id ? { ...v, ...videoUpdate } : v)),
    }));
    
    const updateData: any = {};
    if (videoUpdate.title !== undefined) updateData.title = videoUpdate.title;
    if (videoUpdate.description !== undefined) updateData.description = videoUpdate.description;
    if (videoUpdate.thumbnail !== undefined) updateData.thumbnail = videoUpdate.thumbnail;
    if (videoUpdate.videoUrl !== undefined) updateData.video_url = videoUpdate.videoUrl;
    if (videoUpdate.duration !== undefined) updateData.duration = videoUpdate.duration;
    if (videoUpdate.year !== undefined) updateData.year = videoUpdate.year;
    if (videoUpdate.category !== undefined) updateData.category = videoUpdate.category;

    const { error } = await supabase.from('videos').update(updateData).eq('id', id);
    if (error) console.error("Error updating video in Supabase:", error);
  }, [updateWithHistory]);

  const deleteVideo = useCallback(async (id: string) => {
    updateWithHistory((d) => ({ ...d, videos: d.videos.filter((v) => v.id !== id) }));
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) console.error("Error deleting video in Supabase:", error);
  }, [updateWithHistory]);

  const reorderVideos = useCallback(async (reorderedVideos: Video[]) => {
    updateWithHistory((d) => ({ ...d, videos: reorderedVideos }));
    const videoOrder = reorderedVideos.map(v => v.id);
    // Store video order inside hero_content JSON (avoids needing a new column)
    const currentHero = data.heroContent;
    const updatedHero = { ...currentHero, videoOrder };
    const { error } = await supabase.from('global_settings').upsert({ id: 1, hero_content: updatedHero });
    if (error) console.error("Error saving video order to Supabase:", error);
  }, [updateWithHistory, data.heroContent]);

  const updateFooterContent = useCallback(async (footerContent: FooterContent) => {
    updateWithHistory((d) => ({ ...d, footerContent }));
    const { error } = await supabase.from('global_settings').upsert({ id: 1, footer_content: footerContent });
    if (error) console.error("Error updating footer content in Supabase:", error);
  }, [updateWithHistory]);

  const updatePitchDecks = useCallback(async (pitchDecks: PitchDeck[]) => {
    updateWithHistory((d) => ({ ...d, pitchDecks }));
    const currentHero = data.heroContent;
    const updatedHero = { ...currentHero, pitchDecks };
    const { error } = await supabase.from('global_settings').upsert({ id: 1, hero_content: updatedHero });
    if (error) console.error("Error updating pitch decks in Supabase:", error);
  }, [updateWithHistory, data.heroContent]);

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
        isLoading,
        updateSiteSettings,
        updateHeroContent,
        updateAboutContent,
        updateCategories,
        addVideo,
        updateVideo,
        deleteVideo,
        reorderVideos,
        updateFooterContent,
        updatePitchDecks,
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
