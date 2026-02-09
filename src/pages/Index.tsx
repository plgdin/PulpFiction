import { useState, useMemo, useRef } from 'react';
import { Video } from '@/types/video';
import { categories, videos, featuredVideo, getVideosByCategory } from '@/data/videos';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoryRow from '@/components/CategoryRow';
import VideoPlayer from '@/components/VideoPlayer';
import Footer from '@/components/Footer';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Refs for category sections
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Filter videos based on search
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
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar
        categories={categories}
        onSearch={handleSearch}
        onCategoryClick={handleCategoryClick}
      />

      {/* Hero Section */}
      <HeroSection video={featuredVideo} onPlay={handlePlayVideo} />

      {/* Main Content */}
      <main className="relative z-10 -mt-20 pb-8">
        {/* Search Results */}
        {filteredVideos && (
          <section className="py-8 px-4 md:px-12">
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-6 text-shadow-cinematic">
              Search Results for "{searchQuery}"
            </h2>
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="video-card cursor-pointer aspect-video"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handlePlayVideo(video)}
                  >
                    <div className="relative w-full h-full overflow-hidden rounded group">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-display text-lg text-primary">{video.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{video.year} • {video.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No videos found matching your search.</p>
            )}
          </section>
        )}

        {/* Category Rows */}
        {!filteredVideos && (
          <>
            <section
              id="ad-films"
              ref={(el) => (sectionRefs.current['ad-films'] = el)}
            >
              <CategoryRow
                title="Ad Films"
                videos={getVideosByCategory('ad-films')}
                onPlayVideo={handlePlayVideo}
              />
            </section>

            <section
              id="music-videos"
              ref={(el) => (sectionRefs.current['music-videos'] = el)}
            >
              <CategoryRow
                title="Music Videos"
                videos={getVideosByCategory('music-videos')}
                onPlayVideo={handlePlayVideo}
              />
            </section>

            <section
              id="brand-films"
              ref={(el) => (sectionRefs.current['brand-films'] = el)}
            >
              <CategoryRow
                title="Brand Films"
                videos={getVideosByCategory('brand-films')}
                onPlayVideo={handlePlayVideo}
              />
            </section>

            <section
              id="short-films"
              ref={(el) => (sectionRefs.current['short-films'] = el)}
            >
              <CategoryRow
                title="Short Films"
                videos={getVideosByCategory('short-films')}
                onPlayVideo={handlePlayVideo}
              />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Video Player Modal */}
      <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} />
    </div>
  );
};

export default Index;
