import { useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoryRow from '@/components/CategoryRow';
import VideoPlayer from '@/components/VideoPlayer';
import Footer from '@/components/Footer';
import { categories, videos, featuredVideo, getVideosByCategory } from '@/data/videos';
import { Video } from '@/types/video';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

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
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        categories={categories}
        onSearch={handleSearch}
        onCategoryClick={handleCategoryClick}
      />

      <HeroSection video={featuredVideo} onPlay={handlePlayVideo} />

      <main className="relative z-10 -mt-20 pb-8">
        {filteredVideos && (
          <section className="px-4 py-8 md:px-12">
            <h2 className="mb-6 font-display text-2xl text-primary text-shadow-cinematic md:text-3xl">
              Search Results for "{searchQuery}"
            </h2>

            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="video-card aspect-video cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handlePlayVideo(video)}
                  >
                    <div className="group relative h-full w-full overflow-hidden rounded">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-90" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-display text-lg text-primary">{video.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {video.year} • {video.duration}
                        </p>
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

        {!filteredVideos && (
          <>
            <section id="ad-films" ref={(el) => (sectionRefs.current['ad-films'] = el)}>
              <CategoryRow
                title="Ad Films"
                videos={getVideosByCategory('ad-films')}
                onPlayVideo={handlePlayVideo}
              />
            </section>

            <section id="music-videos" ref={(el) => (sectionRefs.current['music-videos'] = el)}>
              <CategoryRow
                title="Music Videos"
                videos={getVideosByCategory('music-videos')}
                onPlayVideo={handlePlayVideo}
              />
            </section>

            <section id="brand-films" ref={(el) => (sectionRefs.current['brand-films'] = el)}>
              <CategoryRow
                title="Brand Films"
                videos={getVideosByCategory('brand-films')}
                onPlayVideo={handlePlayVideo}
              />
            </section>

            <section id="short-films" ref={(el) => (sectionRefs.current['short-films'] = el)}>
              <CategoryRow
                title="Short Films"
                videos={getVideosByCategory('short-films')}
                onPlayVideo={handlePlayVideo}
              />
            </section>
          </>
        )}
      </main>

      <Footer />

      <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} />
    </div>
  );
};

export default Index;
