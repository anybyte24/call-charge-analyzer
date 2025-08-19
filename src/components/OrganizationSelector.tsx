import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building, ChevronDown, Plus } from 'lucide-react';
import { CreateOrganizationDialog } from '@/components/CreateOrganizationDialog';

export const OrganizationSelector: React.FC = () => {
  const { 
    currentOrganization, 
    organizations, 
    switchOrganization, 
    loading 
  } = useOrganization();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg animate-pulse">
        <Building className="h-4 w-4" />
        <span className="text-sm">Caricamento...</span>
      </div>
    );
  }

  if (!currentOrganization && organizations.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
        <Building className="h-4 w-4" />
        <span className="text-sm font-medium">Nessuna organizzazione</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="btn-secondary-premium gap-2 h-10 min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="truncate">
                {currentOrganization?.name || 'Seleziona organizzazione'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Le mie organizzazioni</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => switchOrganization(org.id)}
              className={`cursor-pointer ${
                currentOrganization?.id === org.id ? 'bg-primary/10 font-medium' : ''
              }`}
            >
              <Building className="h-4 w-4 mr-2" />
              <div className="flex flex-col">
                <span>{org.name}</span>
                <span className="text-xs text-muted-foreground">{org.slug}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuova organizzazione
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <CreateOrganizationDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};