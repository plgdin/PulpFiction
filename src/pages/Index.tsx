import { lazy, Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoryRow from '@/components/CategoryRow';
import VideoCard from '@/components/VideoCard';
import { useCms } from '@/context/CmsContext';
import { Video } from '@/types/video';
const VideoPlayer = lazy(() => import('@/components/VideoPlayer'));
const Footer = lazy(() => import('@/components/Footer'));
const PitchDeckSection = lazy(() => import('@/components/PitchDeckSection'));

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
    <div className="min-h-screen bg-gradient-to-b from-[#121212] via-[#0d0d0d] to-black relative text-foreground">
      {/* Dynamic Background Gradient from Thumbnail Colors */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none transition-all duration-1000 opacity-15"
        style={{
          background: `
            radial-gradient(circle at 50% 100%, rgb(var(--dynamic-highlight-rgb)) 0%, transparent 70%)
          `
        }}
      />
      <div className="relative z-10">
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

      <main className="relative z-30 pb-8 pointer-events-none">
        {filteredVideos && (
          <section className="px-4 py-8 md:px-12 pointer-events-auto">
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
                  className={idx === 0 ? 'scroll-mt-24 pt-4 md:pt-6 pointer-events-auto' : 'scroll-mt-24 pointer-events-auto'}
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

        {/* Pitch Decks Section */}
        {!filteredVideos && (
          <section className="scroll-mt-24 pointer-events-auto">
            <Suspense fallback={null}>
              <PitchDeckSection pitchDecks={data.pitchDecks || []} />
            </Suspense>
          </section>
        )}
      </main>

      <Suspense fallback={null}>
        <Footer />
        {selectedVideo && <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} />}
      </Suspense>
      </div>
    </div>
  );
};

export default Index;
