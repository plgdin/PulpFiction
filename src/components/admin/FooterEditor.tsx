import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCms } from '@/context/CmsContext';
import { FooterContent } from '@/types/cms';
import { toast } from 'sonner';

const FooterEditor = () => {
  const { data, updateFooterContent, updateSiteSettings } = useCms();
  const [footer, setFooter] = useState<FooterContent>(data.footerContent);
  const [social, setSocial] = useState({
    behanceUrl: data.siteSettings.behanceUrl,
    email: data.siteSettings.email,
    instagramUrl: data.siteSettings.instagramUrl,
    youtubeUrl: data.siteSettings.youtubeUrl,
  });

  useEffect(() => {
    setFooter(data.footerContent);
    setSocial({
      behanceUrl: data.siteSettings.behanceUrl,
      email: data.siteSettings.email,
      instagramUrl: data.siteSettings.instagramUrl,
      youtubeUrl: data.siteSettings.youtubeUrl,
    });
  }, [data.footerContent, data.siteSettings]);

  const handleSave = () => {
    updateFooterContent(footer);
    updateSiteSettings({ ...data.siteSettings, ...social });
    toast.success('Footer updated');
  };

  const hasChanges =
    JSON.stringify(footer) !== JSON.stringify(data.footerContent) ||
    social.behanceUrl !== data.siteSettings.behanceUrl ||
    social.email !== data.siteSettings.email ||
    social.instagramUrl !== data.siteSettings.instagramUrl ||
    social.youtubeUrl !== data.siteSettings.youtubeUrl;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-primary">Footer</h2>
          <p className="text-sm text-muted-foreground mt-1">Edit footer content and social links</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>
      <div className="grid gap-6 max-w-2xl">
        <div>
          <Label>Footer Description</Label>
          <Textarea value={footer.description} onChange={(e) => setFooter({ ...footer, description: e.target.value })} className="bg-secondary border-border mt-1" />
        </div>
        <div>
          <Label>Copyright Text</Label>
          <Input value={footer.copyright} onChange={(e) => setFooter({ ...footer, copyright: e.target.value })} className="bg-secondary border-border mt-1" />
          <p className="text-xs text-muted-foreground mt-1">Use {'{year}'} for the current year</p>
        </div>
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Social Links</h3>
          <div className="grid gap-4">
            <div><Label>Behance URL</Label><Input value={social.behanceUrl} onChange={(e) => setSocial({ ...social, behanceUrl: e.target.value })} className="bg-secondary border-border mt-1" /></div>
            <div><Label>Email</Label><Input value={social.email} onChange={(e) => setSocial({ ...social, email: e.target.value })} className="bg-secondary border-border mt-1" /></div>
            <div><Label>Instagram URL</Label><Input value={social.instagramUrl} onChange={(e) => setSocial({ ...social, instagramUrl: e.target.value })} className="bg-secondary border-border mt-1" /></div>
            <div><Label>YouTube URL</Label><Input value={social.youtubeUrl} onChange={(e) => setSocial({ ...social, youtubeUrl: e.target.value })} className="bg-secondary border-border mt-1" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterEditor;
