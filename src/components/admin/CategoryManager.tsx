import { useState } from 'react';
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

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...data.categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;
    [newCategories[index], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[index],
    ];
    updateCategories(newCategories);
  };

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
        {data.categories.map((cat, index) => {
          const videoCount = data.videos.filter((v) => v.category === cat.slug).length;
          return (
            <div
              key={cat.id}
              className="flex items-center gap-3 bg-secondary/50 border border-border rounded-lg p-3 hover:bg-secondary/80 transition-colors"
            >
              {/* Drag handle / reorder */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveCategory(index, 'up')}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-primary disabled:opacity-30 text-xs"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveCategory(index, 'down')}
                  disabled={index === data.categories.length - 1}
                  className="text-muted-foreground hover:text-primary disabled:opacity-30 text-xs"
                >
                  ▼
                </button>
              </div>

              <GripVertical className="w-4 h-4 text-muted-foreground/50" />

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
