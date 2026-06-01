import { Video, VideoCategory } from './video';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  behanceUrl: string;
  email: string;
  instagramUrl: string;
  youtubeUrl: string;
  titleFont: string;
  descriptionFont: string;
  headerFont: string;
  footerFont: string;
}

export interface PitchDeck {
  id: string;
  title: string;
  embedUrl: string;
  originalUrl: string;
  accent: string;
  thumbnail?: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  location: string;
  availability: string;
  description: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  portfolioUrl: string;
  featuredVideoUrl: string;
  featuredVideoThumbnail: string;
  backgroundImage: string;
  slideshowVideos: string[];
}

export interface FooterContent {
  description: string;
  copyright: string;
}

export interface AboutContent {
  section1Image: string;
  name: string;
  title1: string;
  description1: string;
  location: string;
  availability: string;

  section2Image: string;
  title2: string;
  description2a: string;
  description2b: string;

  section3Image: string;
  title3: string;
  description3: string;
  quote: string;
  quoteAuthor: string;
}

export interface CmsData {
  siteSettings: SiteSettings;
  heroContent: HeroContent;
  aboutContent: AboutContent;
  categories: VideoCategory[];
  videos: Video[];
  footerContent: FooterContent;
  pitchDecks: PitchDeck[];
}
