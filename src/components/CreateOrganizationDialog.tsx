import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateOrganizationDialog: React.FC<CreateOrganizationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createOrganization, switchOrganization } = useOrganization();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug from name
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !slug.trim()) {
      toast.error('Nome e slug sono obbligatori');
      return;
    }

    setLoading(true);
    try {
      const organization = await createOrganization(name.trim(), slug.trim());
      await switchOrganization(organization.id);
      toast.success('Organizzazione creata con successo!');
      onOpenChange(false);
      setName('');
      setSlug('');
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Errore durante la creazione dell\'organizzazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Crea Nuova Organizzazione
          </DialogTitle>
          <DialogDescription>
            Crea una nuova organizzazione per gestire i tuoi dati di analisi delle chiamate.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Organizzazione</Label>
              <Input
                id="name"
                placeholder="Inserisci il nome dell'organizzazione"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (identificatore)</Label>
              <Input
                id="slug"
                placeholder="identificatore-unico"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Sarà utilizzato per identificare univocamente l'organizzazione
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crea Organizzazione
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};