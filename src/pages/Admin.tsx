import { LogOut, Film, FolderOpen, Sparkles, FileText, Settings, Undo2, ArrowLeft, ExternalLink, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCms } from '@/context/CmsContext';
import AdminLogin from '@/components/admin/AdminLogin';
import VideoManager from '@/components/admin/VideoManager';
import CategoryManager from '@/components/admin/CategoryManager';
import HeroEditor from '@/components/admin/HeroEditor';
import FooterEditor from '@/components/admin/FooterEditor';
import SiteSettings from '@/components/admin/SiteSettings';
import PitchDeckEditor from '@/components/admin/PitchDeckEditor';
import AboutEditor from '@/components/admin/AboutEditor';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Admin = () => {
  const { isAuthenticated, logout, data, undo, canUndo, undoCount } = useCms();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const handleUndo = () => {
    undo();
    toast.success('Change undone');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-4 md:px-8 py-3 flex items-center justify-between">
          {/* Left side - Back + Title */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </Button>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <h1 className="hidden sm:block font-display text-xl text-primary">CMS Admin</h1>
            <span className="hidden md:inline text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
              {data.siteSettings.siteName}
            </span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Undo button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-muted-foreground hover:text-primary hover:border-primary disabled:opacity-40"
              onClick={handleUndo}
              disabled={!canUndo}
              title={canUndo ? `Undo last change (${undoCount} available)` : 'Nothing to undo'}
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Undo</span>
              {canUndo && (
                <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {undoCount}
                </span>
              )}
            </Button>

            {/* View site in new tab */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={() => window.open('/', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive gap-2"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 md:px-8 py-6">
        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="videos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Film className="w-4 h-4" /> <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FolderOpen className="w-4 h-4" /> <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="hero" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="pitchdecks" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Presentation className="w-4 h-4" /> <span className="hidden sm:inline">Pitch Decks</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4" /> <span className="hidden sm:inline">About Page</span>
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Footer</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos"><VideoManager /></TabsContent>
          <TabsContent value="categories"><CategoryManager /></TabsContent>
          <TabsContent value="hero"><HeroEditor /></TabsContent>
          <TabsContent value="pitchdecks"><PitchDeckEditor /></TabsContent>
          <TabsContent value="about"><AboutEditor /></TabsContent>
          <TabsContent value="footer"><FooterEditor /></TabsContent>
          <TabsContent value="settings"><SiteSettings /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
