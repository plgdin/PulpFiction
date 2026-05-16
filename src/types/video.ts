export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  year: string;
  category: string;
}

export interface VideoCategory {
  id: string;
  title: string;
  slug: string;
}