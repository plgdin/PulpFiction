import { lazy, Suspense } from 'react';
import { LogOut, Film, FolderOpen, Sparkles, FileText, Settings, Undo2, ArrowLeft, ExternalLink, Presentation } from 'lucide-react';
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

const CrtScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative crt-overlay bg-black min-h-screen text-stone-100 font-mono overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-tr from-transparent via-white/5 to-transparent mix-blend-overlay"></div>
      {children}
    </div>
  );
};

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
    <CrtScreen>
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Retro Header */}
        <div className="w-full border-b-4 border-primary/30 bg-black/80 backdrop-blur-md sticky top-0 z-[100] px-4 md:px-12 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="pixel-btn text-center flex items-center justify-center gap-2 py-1.5 px-3"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN</span>
            </button>
            <span className="hidden sm:inline text-xs text-primary font-bold retro tracking-wider text-shadow-glow">
              TK_SYS_ADMIN
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Undo */}
            <button
              className="pixel-btn text-center flex items-center justify-center gap-2 py-1.5 px-3 disabled:opacity-40"
              onClick={handleUndo}
              disabled={!canUndo}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>UNDO {canUndo && `(${undoCount})`}</span>
            </button>

            {/* Preview */}
            <button
              className="pixel-btn text-center flex items-center justify-center gap-2 py-1.5 px-3"
              onClick={() => window.open('/', '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>PREVIEW</span>
            </button>

            {/* Logout */}
            <button
              className="pixel-btn text-center flex items-center justify-center gap-2 py-1.5 px-3 hover:text-red-400"
              onClick={logout}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>

        {/* Content Container */}
        <main className="max-w-7xl mx-auto px-4 md:px-12 py-8 w-full flex-1">
          <Tabs defaultValue="videos" className="space-y-8">
            {/* Retro style Tabs */}
            <TabsList className="bg-zinc-950 p-2 border-2 border-stone-800 rounded-none flex flex-wrap gap-2 h-auto">
              <TabsTrigger 
                value="videos" 
                className="retro text-[9px] md:text-[10px] tracking-widest px-3 py-1.5 border border-transparent rounded-none data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary"
              >
                VIDEOS
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="retro text-[9px] md:text-[10px] tracking-widest px-3 py-1.5 border border-transparent rounded-none data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary"
              >
                CATEGORIES
              </TabsTrigger>
              <TabsTrigger 
                value="hero" 
                className="retro text-[9px] md:text-[10px] tracking-widest px-3 py-1.5 border border-transparent rounded-none data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary"
              >
                HERO_SELECT
              </TabsTrigger>
              <TabsTrigger 
                value="pitchdecks" 
                className="retro text-[9px] md:text-[10px] tracking-widest px-3 py-1.5 border border-transparent rounded-none data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary"
              >
                INVENTORY_DECKS
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="retro text-[9px] md:text-[10px] tracking-widest px-3 py-1.5 border border-transparent rounded-none data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary"
              >
                BIO_SETTINGS
              </TabsTrigger>
              <TabsTrigger 
                value="footer" 
                className="retro text-[9px] md:text-[10px] tracking-widest px-3 py-1.5 border border-transparent rounded-none data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary"
              >
                LOGS_FOOTER
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="retro text-[9px] md:text-[10px] tracking-widest px-3 py-1.5 border border-transparent rounded-none data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary"
              >
                SYS_SETTINGS
              </TabsTrigger>
            </TabsList>

            {/* RPG Card wrapper for content panels */}
            <div className="bg-zinc-950 p-6 md:p-8 pixel-border-gold relative flex flex-col gap-6 text-left">
              <div className="absolute -top-6 left-6 bg-black px-4 py-1.5 border-2 border-primary text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary retro">
                EDITOR_CONSOLE
              </div>
              
              <div className="mt-2 text-stone-200">
                <TabsContent value="videos"><VideoManager /></TabsContent>
                <TabsContent value="categories"><CategoryManager /></TabsContent>
                <TabsContent value="hero"><HeroEditor /></TabsContent>
                <TabsContent value="pitchdecks"><PitchDeckEditor /></TabsContent>
                <TabsContent value="about"><AboutEditor /></TabsContent>
                <TabsContent value="footer"><FooterEditor /></TabsContent>
                <TabsContent value="settings"><SiteSettings /></TabsContent>
              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </CrtScreen>
  );
};

export default Admin;
