import { lazy, Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoryRow from '@/components/CategoryRow';
import VideoCard from '@/components/VideoCard';
import { useCms } from '@/context/CmsContext';
import { Video } from '@/types/video';
import PitchDeckSection from '@/components/PitchDeckSection';

const VideoPlayer = lazy(() => import('@/components/VideoPlayer'));
const Footer = lazy(() => import('@/components/Footer'));

/* ==========================================
   CRT Screen Wrapper (same as About page)
   ========================================== */
const CrtScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative crt-overlay bg-black min-h-screen text-stone-100 font-mono overflow-hidden">
      {/* Glare effect inside screen */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-tr from-transparent via-white/5 to-transparent mix-blend-overlay"></div>
      {children}
    </div>
  );
};

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
    <CrtScreen>
      {/* Retro 8-bit Topbar Navigation */}
      <Navbar
        categories={categories}
        onSearch={handleSearch}
        onCategoryClick={handleCategoryClick}
      />

      <div className="relative z-20">
        {/* Hero Section */}
        <HeroSection
          video={featuredVideo}
          videos={videos}
          heroContent={heroContent}
          onPlay={handlePlayVideo}
        />

        {/* Main Content */}
        <main className="relative z-30 pb-8">
          {/* Search Results */}
          {filteredVideos && (
            <section className="max-w-7xl mx-auto px-4 md:px-12 py-8">
              <div className="w-full flex justify-between items-center border-b-2 border-stone-800 pb-3 mb-6">
                <span className="text-xs uppercase text-stone-500 font-bold tracking-widest retro">
                  SEARCH // "{searchQuery.toUpperCase()}"
                </span>
                <span className="text-primary/70 text-xs font-mono">
                  {filteredVideos.length} RESULTS
                </span>
              </div>

              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="w-full bg-zinc-950 p-6 pixel-border-gold text-center">
                  <p className="text-stone-400 retro-text text-lg tracking-wider">
                    NO ITEMS FOUND IN INVENTORY
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Category Rows */}
          {!filteredVideos && (
            <>
              {categories.map((cat, idx) => {
                const catVideos = getVideosByCategory(cat.slug);
                if (catVideos.length === 0) return null;
                return (
                  <section
                    key={cat.id}
                    id={cat.slug}
                    className="scroll-mt-24"
                    ref={(el) => (sectionRefs.current[cat.slug] = el)}
                  >
                    <CategoryRow
                      title={cat.title}
                      videos={catVideos}
                      onPlayVideo={handlePlayVideo}
                      stageNumber={idx + 1}
                    />
                  </section>
                );
              })}
            </>
          )}

          {/* Pitch Decks Section */}
          {!filteredVideos && (
            <section className="scroll-mt-24">
              <PitchDeckSection pitchDecks={data.pitchDecks || []} />
            </section>
          )}
        </main>

        <Suspense fallback={null}>
          <Footer />
          {selectedVideo && <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} />}
        </Suspense>
      </div>
    </CrtScreen>
  );
};

export default Index;
