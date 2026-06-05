import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { VideoTile } from '../types/video';

interface CmsContextType {
  tiles: VideoTile[];
  loading: boolean;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tiles, setTiles] = useState<VideoTile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        // Try querying video_tiles first
        let { data, error } = await supabase
          .from('video_tiles')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          // If video_tiles table does not exist, fall back to videos table
          if (error.message?.includes('Could not find the table') || error.code === 'PGRST205') {
            console.warn("video_tiles table not found, falling back to videos table");
            const { data: videosData, error: videosError } = await supabase
              .from('videos')
              .select('*');

            if (videosError) throw videosError;

            // Map standard videos to VideoTile structure
            const mappedTiles: VideoTile[] = (videosData || []).map((v, index) => {
              // Extract aspect ratio from the video details or use defaults
              // We can randomize or use predefined ratios to make the grid look dynamic and editorial
              const aspectRatios = ['1.77', '1.33', '1.0', '1.5', '0.75'];
              const ratio = v.aspect_ratio || aspectRatios[index % aspectRatios.length];
              
              return {
                id: v.id,
                title: v.title || 'Untitled',
                thumbnail_url: v.thumbnail || v.thumbnail_url || '',
                webp_url: v.webp_url || undefined,
                aspect_ratio: ratio,
                display_order: v.display_order || index,
                alt: v.alt || v.title || ''
              };
            });
            setTiles(mappedTiles);
            return;
          }
          throw error;
        }

        setTiles(data || []);
      } catch (err) {
        console.error('Error hydrating CMS state payload:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  return (
    <CmsContext.Provider value={{ tiles, loading }}>
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) throw new Error('useCms must be wrapped inside a CmsProvider');
  return context;
};
