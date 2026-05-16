import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCms } from '@/context/CmsContext';
import { HeroContent } from '@/types/cms';
import { toast } from 'sonner';

const HeroEditor = () => {
  const { data, updateHeroContent } = useCms();
  const [form, setForm] = useState<HeroContent>(data.heroContent);

  useEffect(() => {
    setForm(data.heroContent);
  }, [data.heroContent]);

  const updateField = (field: keyof HeroContent, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

      <div className="grid gap-6 max-w-2xl">
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
    </div>
  );
};

export default HeroEditor;
