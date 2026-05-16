import { Video, VideoCategory } from '@/types/video';

export const categories: VideoCategory[] = [
  { id: '1', title: 'Ad Films', slug: 'ad-films' },
  { id: '2', title: 'Music Videos', slug: 'music-videos' },
  { id: '3', title: 'Brand Films', slug: 'brand-films' },
  { id: '4', title: 'Short Films', slug: 'short-films' },
];

export const videos: Video[] = [
  // Ad Films
  {
    id: 'ad-1',
    title: 'Budweiser Can Appreciation Day',
    category: 'ad-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/df6a62220266293.Y3JvcCwxNjY3LDEzMDQsMzI2LDA.png',
    duration: '1:00',
    year: '2024',
    description: "Director's Cut for Budweiser's Can Appreciation Day campaign - a celebration of iconic moments.",
    videoUrl: 'https://www.behance.net/gallery/220266293/Budweiser-Can-Appreciation-Day-Film-Directors-Cut',
  },
  {
    id: 'ad-2',
    title: 'Paraloka - Bhavya Ramesh Jewelry',
    category: 'ad-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/50d2bf210324995.Y3JvcCwyMDUzLDE2MDYsNDE2LDA.png',
    duration: '0:45',
    year: '2024',
    description: 'Elegant jewelry ad film for Bhavya Ramesh, capturing the essence of traditional craftsmanship.',
    videoUrl: 'https://www.behance.net/gallery/210324995/Paraloka-Bhavya-Ramesh-Jewelry-Ad-Film',
  },
  {
    id: 'ad-3',
    title: 'Agaro Volumizer',
    category: 'ad-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/72f779210322387.Y3JvcCwxNjAwLDEyNTIsNjEwLDA.png',
    duration: '0:30',
    year: '2024',
    description: 'Product ad film for Agaro Volumizer showcasing beauty and transformation.',
    videoUrl: 'https://www.behance.net/gallery/210322387/Agaro-Volumizer-Ad-Film',
  },
  {
    id: 'ad-4',
    title: 'Ather South TVC',
    category: 'ad-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/5c8242235407827.Y3JvcCwxMzk4LDEwOTQsNTg1LDA.png',
    duration: '0:45',
    year: '2025',
    description: 'Television commercial for Ather electric scooters targeting South Indian markets.',
    videoUrl: 'https://www.behance.net/gallery/235407827/Ather-South-TVC',
  },
  {
    id: 'ad-5',
    title: 'OLA Electric - Onam Campaign',
    category: 'ad-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/83e80e235103957.Y3JvcCwxNDQxLDExMjcsMTI1Miw2MA.png',
    duration: '0:30',
    year: '2025',
    description: 'Festive campaign for OLA Electric celebrating the spirit of Onam.',
    videoUrl: 'https://vz-5e858353-fc6.b-cdn.net/6a889e8c-7d03-44de-938d-1c5a7ddd2e0b/playlist.m3u8',
  },

  // Music Videos
  {
    id: 'music-1',
    title: 'Ruthless',
    category: 'music-videos',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/920176163540461.Y3JvcCw5MDksNzExLDE4NCww.jpg',
    duration: '4:32',
    year: '2024',
    description: 'High-energy music video with bold visuals and cinematic storytelling.',
    videoUrl: 'https://www.behance.net/gallery/215709127/Ruthless-Music-Video',
  },

  // Brand Films
  {
    id: 'brand-1',
    title: "Women's Month - Nykd by Nykaa",
    category: 'brand-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/8630eb157287825.Y3JvcCw4MDgsNjMyLDAsMA.png',
    duration: '2:30',
    year: '2023',
    description: "Brand film celebrating Women's Month for Nykd by Nykaa - empowering stories of strength.",
    videoUrl: 'https://www.behance.net/gallery/157287825/Womens-Month-Film-Nykd-by-Nykaa-(brand-film)',
  },
  {
    id: 'brand-2',
    title: 'First Club Brand Trailer',
    category: 'brand-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/4d013d235102067.Y3JvcCwxNzAyLDEzMzIsNjQ0LDA.png',
    duration: '1:30',
    year: '2025',
    description: 'Dynamic brand trailer introducing First Club with cinematic flair.',
    videoUrl: 'https://www.behance.net/gallery/235102067/First-Club-Brand-Trailer',
  },
  {
    id: 'brand-3',
    title: 'Flipkart x Asics - Run Bengaluru Run',
    category: 'brand-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/70f41a224737901.Y3JvcCwxNzg5LDE0MDAsNTU4LDA.png',
    duration: '2:00',
    year: '2024',
    description: 'Collaborative brand film for Flipkart and Asics celebrating the running culture of Bengaluru.',
    videoUrl: 'https://www.behance.net/gallery/224737901/Flipkart-x-Asics-Run-Bengaluru-Run-Film',
  },
  {
    id: 'brand-4',
    title: 'Royal Enfield - Motorverse 2024',
    category: 'brand-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/40058f213299753.Y3JvcCwxODkyLDE0ODAsNDkxLDA.png',
    duration: '1:45',
    year: '2024',
    description: 'Scale model film for Royal Enfield Motorverse 2024 - miniature world, maximum impact.',
    videoUrl: 'https://www.behance.net/gallery/213299753/Royal-Enfield-Motorverse-2024-Scale-Model-Film',
  },
  {
    id: 'brand-5',
    title: 'Meesho Mall Film',
    category: 'brand-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/5c3a1a198882905.Y3JvcCwyMTE3LDE2NTYsNTI5LDA.png',
    duration: '1:00',
    year: '2024',
    description: 'Brand film for Meesho Mall showcasing accessible fashion for everyone.',
    videoUrl: 'https://www.behance.net/gallery/198882905/Meesho-Mall-Film',
  },

  // Short Films
  {
    id: 'short-1',
    title: 'Curtain Call',
    category: 'short-films',
    thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/920176163540461.Y3JvcCw5MDksNzExLDE4NCww.jpg',
    duration: '8:30',
    year: '2023',
    description: 'A powerful monologue from the short film exploring the world of theatre and performance.',
    videoUrl: 'https://www.behance.net/gallery/163540461/Curtain-Call-(A-monologue-from-the-Short-film)',
  },
];

export const featuredVideo: Video = {
  id: 'featured',
  title: 'Director Tarun Kapoor',
  category: 'brand-films',
  thumbnail: 'https://mir-s3-cdn-cf.behance.net/projects/404/df6a62220266293.Y3JvcCwxNjY3LDEzMDQsMzI2LDA.png',
  duration: '5:00',
  year: '2025',
  description: 'Director, Actor and Writer for film and theatre based in Bangalore, India. Crafting visual stories for brands like Budweiser, Royal Enfield, OLA Electric, Flipkart, Nykaa, and more.',
  videoUrl: 'https://www.behance.net/tarunkapoor2',
};

export const getVideosByCategory = (category: Video['category']) => 
  videos.filter(v => v.category === category);
