import React, { useState, useEffect } from 'react';
import { useCms } from '@/context/CmsContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { AboutContent } from '@/types/cms';
import { ImageUpload } from '@/components/admin/ImageUpload';

const AboutEditor = () => {
  const { data, updateAboutContent } = useCms();
  const [formData, setFormData] = useState<AboutContent>(data.aboutContent);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(data.aboutContent);
  }, [data.aboutContent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    updateAboutContent(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 bg-zinc-900/50 p-6 rounded-lg border border-white/10">
      <div>
        <h3 className="text-xl font-display text-primary mb-6 border-b border-white/10 pb-2">Section 1: About</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name / Heading</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-black/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title1">Title 1</Label>
            <Input
              id="title1"
              name="title1"
              value={formData.title1}
              onChange={handleChange}
              className="bg-black/50 border-white/10"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description1">Description</Label>
            <Textarea
              id="description1"
              name="description1"
              value={formData.description1}
              onChange={handleChange}
              className="bg-black/50 border-white/10 h-32"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location (use \n for line break)</Label>
            <Textarea
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="bg-black/50 border-white/10 h-20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">Availability (use \n for line break)</Label>
            <Textarea
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="bg-black/50 border-white/10 h-20"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <ImageUpload
              id="section1Image"
              label="Background Image URL (optional, defaults to hero bg)"
              value={formData.section1Image}
              onChange={(url) => setFormData((prev) => ({ ...prev, section1Image: url }))}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-display text-primary mb-6 border-b border-white/10 pb-2">Section 2: Story</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title2">Title 2</Label>
            <Input
              id="title2"
              name="title2"
              value={formData.title2}
              onChange={handleChange}
              className="bg-black/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description2a">Paragraph 1</Label>
            <Textarea
              id="description2a"
              name="description2a"
              value={formData.description2a}
              onChange={handleChange}
              className="bg-black/50 border-white/10 h-32"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description2b">Paragraph 2</Label>
            <Textarea
              id="description2b"
              name="description2b"
              value={formData.description2b}
              onChange={handleChange}
              className="bg-black/50 border-white/10 h-32"
            />
          </div>
          <div className="space-y-2">
            <ImageUpload
              id="section2Image"
              label="Background Image URL"
              value={formData.section2Image}
              onChange={(url) => setFormData((prev) => ({ ...prev, section2Image: url }))}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-display text-primary mb-6 border-b border-white/10 pb-2">Section 3: Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title3">Title 3</Label>
            <Input
              id="title3"
              name="title3"
              value={formData.title3}
              onChange={handleChange}
              className="bg-black/50 border-white/10"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description3">Description</Label>
            <Textarea
              id="description3"
              name="description3"
              value={formData.description3}
              onChange={handleChange}
              className="bg-black/50 border-white/10 h-24"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="quote">Quote</Label>
            <Textarea
              id="quote"
              name="quote"
              value={formData.quote}
              onChange={handleChange}
              className="bg-black/50 border-white/10 h-20"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="quoteAuthor">Quote Author</Label>
            <Input
              id="quoteAuthor"
              name="quoteAuthor"
              value={formData.quoteAuthor}
              onChange={handleChange}
              className="bg-black/50 border-white/10"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <ImageUpload
              id="section3Image"
              label="Background Image URL (optional, defaults to hero bg)"
              value={formData.section3Image}
              onChange={(url) => setFormData((prev) => ({ ...prev, section3Image: url }))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-white/10">
        <Button onClick={handleSave} className="gap-2 w-full md:w-auto">
          <Save className="w-4 h-4" />
          {isSaved ? 'Saved!' : 'Save About Page'}
        </Button>
      </div>
    </div>
  );
};

export default AboutEditor;
