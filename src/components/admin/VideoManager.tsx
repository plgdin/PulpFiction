import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, ChevronLeft, ChevronRight, Eye, List, UploadCloud, Link as LinkIcon } from 'lucide-react';
import * as tus from 'tus-js-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCms } from '@/context/CmsContext';
import { Video } from '@/types/video';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const emptyVideo: Omit<Video, 'id'> = {
  title: '', category: '' as Video['category'], thumbnail: '', videoUrl: '',
  duration: '', year: new Date().getFullYear().toString(), description: '',
};

const VideoManager = () => {
  const { data, addVideo, updateVideo, deleteVideo } = useCms();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Video, 'id'>>(emptyVideo);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'preview' | 'list'>('preview');

  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const filteredVideos =
    filterCategory === 'all'
      ? data.videos
      : data.videos.filter((v) => v.category === filterCategory);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyVideo, category: (data.categories[0]?.slug as Video['category']) || ('' as Video['category']) });
    setUploadMode('url');
    setSelectedFile(null);
    setUploadProgress(0);
    setIsFormOpen(true);
  };

  const openEdit = (video: Video) => {
    setEditingId(video.id);
    setFormData({
      title: video.title, category: video.category, thumbnail: video.thumbnail,
      videoUrl: video.videoUrl, duration: video.duration, year: video.year, description: video.description,
    });
    setUploadMode('url');
    setSelectedFile(null);
    setUploadProgress(0);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.category) {
      toast.error('Title and category are required');
      return;
    }

    let finalVideoUrl = formData.videoUrl;

    if (uploadMode === 'file' && selectedFile) {
      setIsUploading(true);
      try {
        const authRes = await fetch('/api/bunny-upload-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formData.title }),
        });
        
        if (!authRes.ok) throw new Error('Failed to authorize upload');
        const { libraryId, videoId, signature, expirationTime } = await authRes.json();
        
        await new Promise<void>((resolve, reject) => {
          const upload = new tus.Upload(selectedFile, {
            endpoint: 'https://video.bunnycdn.com/tusupload',
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: {
              AuthorizationSignature: signature,
              AuthorizationExpire: expirationTime.toString(),
              VideoId: videoId,
              LibraryId: libraryId,
            },
            metadata: {
              filetype: selectedFile.type,
              title: formData.title,
            },
            onError: reject,
            onProgress: (bytesUploaded, bytesTotal) => {
              setUploadProgress((bytesUploaded / bytesTotal) * 100);
            },
            onSuccess: () => resolve(),
          });
          upload.start();
        });
        
        finalVideoUrl = `https://vz-5e858353-fc6.b-cdn.net/${videoId}/play_720p.mp4`;
        const autoThumbnail = `https://vz-5e858353-fc6.b-cdn.net/${videoId}/thumbnail.jpg`;
        
        setFormData(prev => ({
          ...prev,
          thumbnail: prev.thumbnail || autoThumbnail
        }));
        
        toast.success('Video uploaded to Bunny CDN');
      } catch (err) {
        console.error(err);
        toast.error('Failed to upload video');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const autoThumbnail = formData.videoUrl !== finalVideoUrl && uploadMode === 'file' 
      ? finalVideoUrl.replace('/play_720p.mp4', '/thumbnail.jpg') 
      : formData.thumbnail;

    const newVideoData = { 
      ...formData, 
      videoUrl: finalVideoUrl,
      thumbnail: formData.thumbnail || autoThumbnail
    };

    if (editingId) {
      updateVideo(editingId, newVideoData);
      toast.success('Video updated successfully');
    } else {
      addVideo({ ...newVideoData, id: `video-${Date.now()}` });
      toast.success('Video added successfully');
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteVideo(deleteId);
      toast.success('Video deleted');
      setDeleteId(null);
    }
  };

  const updateField = (field: keyof Omit<Video, 'id'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Group videos by category for preview mode
  const videosByCategory = data.categories.map((cat) => ({
    category: cat,
    videos: (filterCategory === 'all' || filterCategory === cat.slug)
      ? data.videos.filter((v) => v.category === cat.slug)
      : [],
  })).filter((group) => group.videos.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl text-primary">Videos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.videos.length} videos across {data.categories.length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-secondary/50 border border-border rounded-md">
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-l-md transition-colors',
                viewMode === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-r-md transition-colors',
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add Video
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-muted-foreground text-sm">Filter:</Label>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {data.categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>{cat.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ===== PREVIEW MODE - Horizontal scroll like main page ===== */}
      {viewMode === 'preview' && (
        <div className="space-y-8">
          {videosByCategory.map(({ category, videos }) => (
            <PreviewCategoryRow
              key={category.id}
              title={category.title}
              videos={videos}
              onEdit={openEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
          {videosByCategory.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No videos found.</p>
            </div>
          )}
        </div>
      )}

      {/* ===== LIST MODE - Compact table ===== */}
      {viewMode === 'list' && (
        <div className="grid gap-3">
          {filteredVideos.map((video) => (
            <div key={video.id} className="flex items-center gap-4 bg-secondary/50 border border-border rounded-lg p-3 hover:bg-secondary/80 transition-colors">
              <div className="w-24 h-14 rounded overflow-hidden flex-shrink-0 bg-card">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{video.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="capitalize">{video.category.replace('-', ' ')}</span>
                  <span>•</span><span>{video.year}</span><span>•</span><span>{video.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {video.videoUrl && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => window.open(video.videoUrl, '_blank')}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(video)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(video.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredVideos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground"><p>No videos found.</p></div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              {editingId ? 'Edit Video' : 'Add New Video'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => updateField('title', e.target.value)} className="bg-secondary border-border mt-1" placeholder="Video title" />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {data.categories.map((cat) => (<SelectItem key={cat.id} value={cat.slug}>{cat.title}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Thumbnail URL</Label>
              <Input value={formData.thumbnail} onChange={(e) => updateField('thumbnail', e.target.value)} className="bg-secondary border-border mt-1" placeholder="https://..." />
              {formData.thumbnail && (
                <div className="mt-2 w-32 h-20 rounded overflow-hidden bg-card">
                  <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <Label>Video Source</Label>
              <div className="flex bg-secondary border border-border p-1 rounded-md mt-1 mb-3">
                <button
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm rounded transition-colors",
                    uploadMode === 'url' ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setUploadMode('url')}
                >
                  <LinkIcon className="w-4 h-4" /> Use URL
                </button>
                <button
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm rounded transition-colors",
                    uploadMode === 'file' ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setUploadMode('file')}
                >
                  <UploadCloud className="w-4 h-4" /> Upload File
                </button>
              </div>

              {uploadMode === 'url' ? (
                <div>
                  <Input value={formData.videoUrl} onChange={(e) => updateField('videoUrl', e.target.value)} className="bg-secondary border-border" placeholder="https://..." />
                  <p className="text-xs text-muted-foreground mt-1.5">Paste direct .m3u8, .mp4, or YouTube/Vimeo links.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-secondary/20 transition-colors">
                    <input 
                      type="file" 
                      id="video-upload" 
                      accept="video/mp4,video/x-m4v,video/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedFile(e.target.files[0]);
                          if (!formData.title) {
                            updateField('title', e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                          }
                        }
                      }}
                    />
                    <Label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <UploadCloud className="w-8 h-8 text-muted-foreground" />
                      <div className="text-sm font-medium">
                        {selectedFile ? selectedFile.name : "Click to select video file (.mp4)"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "Max file size depends on your Bunny CDN limit"}
                      </div>
                    </Label>
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Uploading to Bunny CDN...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration</Label>
                <Input value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} className="bg-secondary border-border mt-1" placeholder="2:30" />
              </div>
              <div>
                <Label>Year</Label>
                <Input value={formData.year} onChange={(e) => updateField('year', e.target.value)} className="bg-secondary border-border mt-1" placeholder="2025" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} className="bg-secondary border-border mt-1 min-h-[80px]" placeholder="Brief description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? 'Uploading...' : editingId ? 'Save Changes' : 'Add Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The video will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ========================================
   Horizontal Preview Row (matches main page)
   ======================================== */
interface PreviewCategoryRowProps {
  title: string;
  videos: Video[];
  onEdit: (video: Video) => void;
  onDelete: (id: string) => void;
}

const PreviewCategoryRow = ({ title, videos, onEdit, onDelete }: PreviewCategoryRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -400 : 400,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative">
      <h3 className="font-display text-xl text-primary mb-3 text-shadow-cinematic">{title}</h3>

      <div className="relative group">
        {/* Left scroll */}
        <Button
          variant="ghost" size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full w-10 rounded-none bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </Button>

        {/* Horizontal scroll row */}
        <div ref={scrollRef} className="scroll-row gap-4 pb-2">
          {videos.map((video, index) => (
            <PreviewVideoCard
              key={video.id}
              video={video}
              index={index}
              onEdit={() => onEdit(video)}
              onDelete={() => onDelete(video.id)}
            />
          ))}
        </div>

        {/* Right scroll */}
        <Button
          variant="ghost" size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full w-10 rounded-none bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-6 h-6 text-primary" />
        </Button>
      </div>
    </section>
  );
};

/* ========================================
   Preview Video Card (matches main page style + admin actions)
   ======================================== */
interface PreviewVideoCardProps {
  video: Video;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const PreviewVideoCard = ({ video, index, onEdit, onDelete }: PreviewVideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'video-card group cursor-pointer flex-shrink-0',
        'w-[280px] md:w-[320px] lg:w-[360px] aspect-video'
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full overflow-hidden rounded">
        {/* Thumbnail */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            isHovered && 'scale-110'
          )}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        {/* Overlay */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent',
          'opacity-60 group-hover:opacity-90 transition-opacity duration-300'
        )} />

        {/* Duration badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-xs font-medium text-primary">
            {video.duration}
          </div>
        </div>

        {/* Admin action buttons - top left on hover */}
        <div className={cn(
          'absolute top-2 left-2 flex items-center gap-1 transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-8 h-8 rounded-full bg-destructive/90 flex items-center justify-center hover:bg-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive-foreground" />
          </button>
        </div>

        {/* Title bar */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 p-4',
          'transform transition-transform duration-300',
          isHovered ? 'translate-y-0' : 'translate-y-2'
        )}>
          <h4 className="font-display tracking-wide truncate text-primary bg-primary-foreground text-sm text-center">
            {video.title}
          </h4>
          <div className={cn(
            'flex items-center justify-center gap-2 mt-2 text-xs text-primary/70',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150'
          )}>
            <span>{video.year}</span>
            <span>•</span>
            <span className="capitalize">{video.category.replace('-', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoManager;
