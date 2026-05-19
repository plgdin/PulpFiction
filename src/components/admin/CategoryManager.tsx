import { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCms } from '@/context/CmsContext';
import { VideoCategory } from '@/types/video';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const CategoryManager = () => {
  const { data, updateCategories } = useCms();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Drag-and-drop state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setIsFormOpen(true);
  };

  const openEdit = (cat: VideoCategory) => {
    setEditingId(cat.id);
    setTitle(cat.title);
    setSlug(cat.slug);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Category title is required');
      return;
    }

    const finalSlug = slug.trim() || slugify(title);

    if (editingId) {
      const updated = data.categories.map((c) =>
        c.id === editingId ? { ...c, title: title.trim(), slug: finalSlug } : c
      );
      updateCategories(updated);
      toast.success('Category updated');
    } else {
      // Check for duplicate slug
      if (data.categories.some((c) => c.slug === finalSlug)) {
        toast.error('A category with this slug already exists');
        return;
      }
      const newCat: VideoCategory = {
        id: `cat-${Date.now()}`,
        title: title.trim(),
        slug: finalSlug,
      };
      updateCategories([...data.categories, newCat]);
      toast.success('Category added');
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      const cat = data.categories.find((c) => c.id === deleteId);
      const videosInCategory = data.videos.filter((v) => v.category === cat?.slug).length;

      if (videosInCategory > 0) {
        toast.error(`Cannot delete: ${videosInCategory} videos are using this category`);
        setDeleteId(null);
        return;
      }

      updateCategories(data.categories.filter((c) => c.id !== deleteId));
      toast.success('Category deleted');
      setDeleteId(null);
    }
  };

  const handleDragStart = useCallback((catId: string) => {
    setDragId(catId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, catId: string) => {
    e.preventDefault();
    if (dragId && catId !== dragId) setDragOverId(catId);
  }, [dragId]);

  const handleDragEnd = useCallback(() => {
    if (!dragId || !dragOverId || dragId === dragOverId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const newCategories = [...data.categories];
    const fromIdx = newCategories.findIndex(c => c.id === dragId);
    const toIdx = newCategories.findIndex(c => c.id === dragOverId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = newCategories.splice(fromIdx, 1);
      newCategories.splice(toIdx, 0, moved);
      updateCategories(newCategories);
      toast.success('Category order updated');
    }

    setDragId(null);
    setDragOverId(null);
  }, [dragId, dragOverId, data.categories, updateCategories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-primary">Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage video categories and their display order
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Category list */}
      <div className="grid gap-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
          <GripVertical className="w-3.5 h-3.5" /> Drag to reorder categories. Order is reflected on the main site.
        </p>
        {data.categories.map((cat, index) => {
          const videoCount = data.videos.filter((v) => v.category === cat.slug).length;
          return (
            <div
              key={cat.id}
              draggable
              onDragStart={() => handleDragStart(cat.id)}
              onDragOver={(e) => handleDragOver(e, cat.id)}
              onDragEnd={handleDragEnd}
              onDragLeave={() => { if (dragOverId === cat.id) setDragOverId(null); }}
              className={cn(
                'flex items-center gap-3 bg-secondary/50 border rounded-lg p-3 transition-all duration-200 cursor-grab active:cursor-grabbing',
                dragId === cat.id
                  ? 'opacity-40 border-primary/50 scale-[0.98]'
                  : dragOverId === cat.id
                    ? 'border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.2)]'
                    : 'border-border hover:bg-secondary/80'
              )}
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 text-muted-foreground/50 hover:text-primary transition-colors">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Position number */}
              <span className="flex-shrink-0 w-6 text-center text-xs font-mono text-muted-foreground/60">{index + 1}</span>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{cat.title}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <code className="bg-card px-1.5 py-0.5 rounded">{cat.slug}</code>
                  <span>•</span>
                  <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => openEdit(cat)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(cat.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              {editingId ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
                className="bg-secondary border-border mt-1"
                placeholder="e.g. Music Videos"
                autoFocus
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-secondary border-border mt-1"
                placeholder="e.g. music-videos"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated from title. Used for filtering.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingId ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this category. Categories with videos cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManager;
