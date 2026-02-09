export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  year: string;
  category: 'ad-films' | 'music-videos' | 'brand-films' | 'short-films';
}

export interface VideoCategory {
  id: string;
  title: string;
  slug: string;
}