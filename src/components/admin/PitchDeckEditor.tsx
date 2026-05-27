import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCms } from '@/context/CmsContext';
import { PitchDeck } from '@/types/cms';
import { toast } from 'sonner';

const PitchDeckEditor = () => {
  const { data, updatePitchDecks } = useCms();
  const [decks, setDecks] = useState<PitchDeck[]>(data.pitchDecks || []);

  useEffect(() => {
    setDecks(data.pitchDecks || []);
  }, [data.pitchDecks]);

  const handleUpdateDeck = (index: number, field: keyof PitchDeck, value: string) => {
    const newDecks = [...decks];
    newDecks[index] = { ...newDecks[index], [field]: value };
    setDecks(newDecks);
  };

  const handleAddDeck = () => {
    const newDeck: PitchDeck = {
      id: `deck-${Date.now()}`,
      title: 'New Pitch Deck',
      embedUrl: '',
      originalUrl: '',
      accent: '#FFFFFF',
      thumbnail: '',
    };
    setDecks([...decks, newDeck]);
  };

  const handleRemoveDeck = (index: number) => {
    const newDecks = [...decks];
    newDecks.splice(index, 1);
    setDecks(newDecks);
  };

  const handleMoveDeck = (index: number, direction: 'up' | 'down') => {
    const newDecks = [...decks];
    if (direction === 'up' && index > 0) {
      [newDecks[index - 1], newDecks[index]] = [newDecks[index], newDecks[index - 1]];
    } else if (direction === 'down' && index < newDecks.length - 1) {
      [newDecks[index], newDecks[index + 1]] = [newDecks[index + 1], newDecks[index]];
    }
    setDecks(newDecks);
  };

  const handleSave = () => {
    updatePitchDecks(decks);
    toast.success('Pitch decks updated successfully');
  };

  const hasChanges = JSON.stringify(decks) !== JSON.stringify(data.pitchDecks);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-primary">Pitch Decks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your Canva pitch decks, thumbnails, and preview links.
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {decks.map((deck, idx) => (
          <div key={deck.id} className="p-5 border border-border rounded-lg bg-card/50 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="bg-secondary text-muted-foreground text-xs px-2 py-1 rounded">#{idx + 1}</span>
                {deck.title || 'Untitled Deck'}
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleMoveDeck(idx, 'up')}
                  disabled={idx === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleMoveDeck(idx, 'down')}
                  disabled={idx === decks.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 ml-2"
                  onClick={() => handleRemoveDeck(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={deck.title}
                  onChange={(e) => handleUpdateDeck(idx, 'title', e.target.value)}
                  placeholder="e.g. Director's Treatment"
                />
              </div>

              <div className="space-y-2">
                <Label>Accent Color (Hex)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={deck.accent || '#FFFFFF'}
                    onChange={(e) => handleUpdateDeck(idx, 'accent', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={deck.accent}
                    onChange={(e) => handleUpdateDeck(idx, 'accent', e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex justify-between">
                  <span>Thumbnail Image URL / Path</span>
                </Label>
                <Input
                  value={deck.thumbnail || ''}
                  onChange={(e) => handleUpdateDeck(idx, 'thumbnail', e.target.value)}
                  placeholder="/assets/thumb-1.jpg or https://..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex justify-between">
                  <span>Canva Embed URL</span>
                  <a href={deck.embedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Test Link <ExternalLink className="w-3 h-3" />
                  </a>
                </Label>
                <Input
                  value={deck.embedUrl}
                  onChange={(e) => handleUpdateDeck(idx, 'embedUrl', e.target.value)}
                  placeholder="https://www.canva.com/design/.../view?embed"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex justify-between">
                  <span>Original Canva URL</span>
                </Label>
                <Input
                  value={deck.originalUrl}
                  onChange={(e) => handleUpdateDeck(idx, 'originalUrl', e.target.value)}
                  placeholder="https://www.canva.com/design/.../view"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          onClick={handleAddDeck}
          variant="outline"
          className="w-full border-dashed border-2 py-8 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Pitch Deck
        </Button>
      </div>
    </div>
  );
};

export default PitchDeckEditor;
