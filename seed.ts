import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { videos as defaultVideos, categories as defaultCategories, featuredVideo as defaultFeaturedVideo } from './src/data/videos.js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function run() {
  console.log("Seeding Supabase...");

  // 1. Settings
  const defaultData = {
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
    footerContent: {
      description: 'Director & Cinematographer crafting visual stories that move, inspire, and captivate.',
      copyright: '© {year} Tarun Kapoor. All rights reserved.',
    }
  };

  const { error: err1 } = await supabase.from('global_settings').upsert({
    id: 1,
    site_settings: defaultData.siteSettings,
    hero_content: defaultData.heroContent,
    footer_content: defaultData.footerContent
  });
  if (err1) console.error("Err 1", err1);

  // 2. Categories
  const mappedCategories = defaultCategories.map(c => ({
    id: c.id,
    title: c.title,
    slug: c.slug
  }));
  const { error: err2 } = await supabase.from('categories').upsert(mappedCategories);
  if (err2) console.error("Err 2", err2);

  // 3. Videos
  const mappedVideos = defaultVideos.map(v => ({
    id: v.id,
    title: v.title,
    description: v.description,
    thumbnail: v.thumbnail,
    video_url: v.videoUrl,
    duration: v.duration,
    year: v.year,
    category: v.category
  }));
  const { error: err3 } = await supabase.from('videos').upsert(mappedVideos);
  if (err3) console.error("Err 3", err3);

  console.log("Done!");
}

run();
