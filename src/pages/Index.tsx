import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoryRow from '@/components/CategoryRow';
import VideoCard from '@/components/VideoCard';
import VideoPlayer from '@/components/VideoPlayer';
import Footer from '@/components/Footer';
import { useCms } from '@/context/CmsContext';
import { Video } from '@/types/video';

const Index = () => {

  const { data, getVideosByCategory, getFeaturedVideo } = useCms();
  const { categories, videos, heroContent } = data;
  const featuredVideo = getFeaturedVideo();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Sync selected video with URL params
  useEffect(() => {
    const videoId = searchParams.get('v');
    if (videoId) {
      const video = videos.find(v => v.id === videoId);
      if (video) setSelectedVideo(video);
    } else {
      setSelectedVideo(null);
    }
  }, [searchParams]);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const filteredVideos = useMemo(() => {
    if (!searchQuery) return null;

    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryClick = (category: { slug: string }) => {
    const section = sectionRefs.current[category.slug];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePlayVideo = (video: Video) => {
    setSearchParams({ v: video.id });
  };

  const handleClosePlayer = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        categories={categories}
        onSearch={handleSearch}
        onCategoryClick={handleCategoryClick}
      />

      <HeroSection
        video={featuredVideo}
        videos={videos}
        heroContent={heroContent}
        onPlay={handlePlayVideo}
      />

      <main className="relative z-10 -mt-14 pb-8">
        {filteredVideos && (
          <section className="px-4 py-8 md:px-12">
            <h2 className="mb-6 text-2xl md:text-3xl text-shadow-cinematic" style={{ fontFamily: "'Antonio', sans-serif", fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: 'hsl(var(--primary))' }}>
              Search Results for "{searchQuery}"
            </h2>

            {filteredVideos.length > 0 ? (
              <div className="flex flex-wrap gap-6">
                {filteredVideos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={handlePlayVideo}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No videos found matching your search.</p>
            )}
          </section>
        )}

        {!filteredVideos && (
          <>
            {categories.map((cat, idx) => {
              const catVideos = getVideosByCategory(cat.slug);
              if (catVideos.length === 0) return null;
              return (
                <section
                  key={cat.id}
                  id={cat.slug}
                  className={idx === 0 ? 'pt-4 md:pt-6' : undefined}
                  ref={(el) => (sectionRefs.current[cat.slug] = el)}
                >
                  <CategoryRow
                    title={cat.title}
                    videos={catVideos}
                    onPlayVideo={handlePlayVideo}
                  />
                </section>
              );
            })}
          </>
        )}
      </main>

      <Footer />

      <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} />
    </div>
  );
};

export default Index;
