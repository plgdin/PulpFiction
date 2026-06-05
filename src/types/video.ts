export interface VideoTile {
  id: string;
  title: string;
  thumbnail_url: string;
  webp_url?: string;
  aspect_ratio: string; // Calculated dynamically or string values like '1.77'
  display_order: number;
  alt?: string;
}