import { useState, useEffect } from 'react';
import { Save, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCms } from '@/context/CmsContext';
import { HeroContent } from '@/types/cms';
import { toast } from 'sonner';

const HeroEditor = () => {
  const { data, updateHeroContent } = useCms();
  const [form, setForm] = useState<HeroContent>({
    ...data.heroContent,
    slideshowVideos: data.heroContent.slideshowVideos || []
  });

  useEffect(() => {
    setForm({
      ...data.heroContent,
      slideshowVideos: data.heroContent.slideshowVideos || []
    });
  }, [data.heroContent]);

  const updateField = (field: keyof HeroContent, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSlideshowVideo = (videoId: string) => {
    if (!videoId) return;
    setForm((prev) => ({
      ...prev,
      slideshowVideos: [...(prev.slideshowVideos || []), videoId]
    }));
  };

  const handleRemoveSlideshowVideo = (index: number) => {
    setForm((prev) => {
      const newVideos = [...(prev.slideshowVideos || [])];
      newVideos.splice(index, 1);
      return { ...prev, slideshowVideos: newVideos };
    });
  };

  const handleMoveSlideshowVideo = (index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const newVideos = [...(prev.slideshowVideos || [])];
      if (direction === 'up' && index > 0) {
        [newVideos[index - 1], newVideos[index]] = [newVideos[index], newVideos[index - 1]];
      } else if (direction === 'down' && index < newVideos.length - 1) {
        [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
      }
      return { ...prev, slideshowVideos: newVideos };
    });
  };

  const handleSave = () => {
    updateHeroContent(form);
    toast.success('Hero section updated');
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(data.heroContent);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-primary">Hero Section</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customize the main banner displayed at the top of the site
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="grid gap-6 lg:col-span-7 xl:col-span-8 w-full max-w-2xl">
          {/* Badge */}
        <div>
          <Label>Badge Text</Label>
          <Input
            value={form.badge}
            onChange={(e) => updateField('badge', e.target.value)}
            className="bg-secondary border-border mt-1"
            placeholder="e.g. Director Actor & Writer"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Small label shown above the title
          </p>
        </div>

        {/* Title */}
        <div>
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="bg-secondary border-border mt-1"
            placeholder="Director Tarun Kapoor"
          />
        </div>

        {/* Location & Availability */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="bg-secondary border-border mt-1"
              placeholder="Bangalore, India"
            />
          </div>
          <div>
            <Label>Availability</Label>
            <Input
              value={form.availability}
              onChange={(e) => updateField('availability', e.target.value)}
              className="bg-secondary border-border mt-1"
              placeholder="Available for Freelance & Fulltime"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="bg-secondary border-border mt-1 min-h-[100px]"
            placeholder="A brief description about yourself..."
          />
        </div>

        {/* CTA Buttons */}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Call-to-Action Buttons</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Button Text</Label>
              <Input
                value={form.ctaPrimaryText}
                onChange={(e) => updateField('ctaPrimaryText', e.target.value)}
                className="bg-secondary border-border mt-1"
                placeholder="View Reel"
              />
            </div>
            <div>
              <Label>Secondary Button Text</Label>
              <Input
                value={form.ctaSecondaryText}
                onChange={(e) => updateField('ctaSecondaryText', e.target.value)}
                className="bg-secondary border-border mt-1"
                placeholder="Full Portfolio"
              />
            </div>
          </div>
        </div>

        {/* URLs */}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Links</h3>
          <div className="grid gap-4">
            <div>
              <Label>Portfolio URL</Label>
              <Input
                value={form.portfolioUrl}
                onChange={(e) => updateField('portfolioUrl', e.target.value)}
                className="bg-secondary border-border mt-1"
                placeholder="https://www.behance.net/..."
              />
            </div>
            <div>
              <Label>Featured Video URL</Label>
              <Input
                value={form.featuredVideoUrl}
                onChange={(e) => updateField('featuredVideoUrl', e.target.value)}
                className="bg-secondary border-border mt-1"
                placeholder="https://www.behance.net/..."
              />
            </div>
            <div>
              <Label>Featured Video Thumbnail URL</Label>
              <Input
                value={form.featuredVideoThumbnail}
                onChange={(e) => updateField('featuredVideoThumbnail', e.target.value)}
                className="bg-secondary border-border mt-1"
                placeholder="https://..."
              />
              {form.featuredVideoThumbnail && (
                <div className="mt-2 w-48 h-28 rounded overflow-hidden bg-card">
                  <img
                    src={form.featuredVideoThumbnail}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Background Image URL (optional)</Label>
              <Input
                value={form.backgroundImage}
                onChange={(e) => updateField('backgroundImage', e.target.value)}
                className="bg-secondary border-border mt-1"
                placeholder="Leave empty to use default background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use the default hero background image
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* Slideshow */}
        <div className="lg:col-span-5 xl:col-span-4 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Hero Slideshow Videos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select the videos you want to feature in the hero slider and drag them to reorder.
          </p>
          
          <div className="space-y-3 mb-4">
            {(form.slideshowVideos || []).map((videoId, idx) => {
              const video = data.videos.find((v) => v.id === videoId);
              return (
                <div key={`${videoId}-${idx}`} className="flex items-center gap-3 bg-secondary/50 p-3 rounded-md border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {video ? video.title : 'Unknown Video'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMoveSlideshowVideo(idx, 'up')}
                      disabled={idx === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMoveSlideshowVideo(idx, 'down')}
                      disabled={idx === (form.slideshowVideos || []).length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => handleRemoveSlideshowVideo(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {(form.slideshowVideos || []).length === 0 && (
              <p className="text-sm text-muted-foreground italic py-2">No videos selected for slideshow yet.</p>
            )}
          </div>

          <div>
            <Select onValueChange={(val) => {
              if (val) {
                handleAddSlideshowVideo(val);
              }
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add a video to slideshow..." />
              </SelectTrigger>
              <SelectContent>
                {data.videos
                  .filter((v) => !(form.slideshowVideos || []).includes(v.id))
                  .map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;
