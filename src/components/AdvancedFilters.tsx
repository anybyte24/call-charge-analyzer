import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Search, Filter, X, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterState, useAdvancedFilters } from '@/hooks/useAdvancedFilters';
import { CallRecord } from '@/types/call-analysis';

interface AdvancedFiltersProps {
  records: CallRecord[];
  onFilteredRecords: (filtered: CallRecord[]) => void;
  className?: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  records,
  onFilteredRecords,
  className
}) => {
  const {
    filters,
    filteredRecords,
    filterOptions,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    totalRecords,
    filteredCount
  } = useAdvancedFilters(records);

  // Update parent component when filtered records change
  React.useEffect(() => {
    onFilteredRecords(filteredRecords);
  }, [filteredRecords, onFilteredRecords]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatCurrency = (amount: number) => {
    return amount === Infinity ? '∞' : `€${amount.toFixed(2)}`;
  };

  return (
    <Card className={cn("bg-white/70 backdrop-blur-sm border shadow-lg", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtri Avanzati</span>
            {hasActiveFilters && (
              <Badge variant="secondary">{filteredCount}/{totalRecords}</Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search">Ricerca Globale</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Cerca numeri, chiamanti, categorie..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data Inizio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, "dd/MM/yyyy")
                  ) : (
                    <span>Seleziona data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from || undefined}
                  onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date || null })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Fine</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, "dd/MM/yyyy")
                  ) : (
                    <span>Seleziona data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to || undefined}
                  onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date || null })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="space-y-2">
          <Label>Categorie</Label>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {filterOptions.categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter('categories', [...filters.categories, category]);
                    } else {
                      updateFilter('categories', filters.categories.filter(c => c !== category));
                    }
                  }}
                />
                <Label htmlFor={`category-${category}`} className="text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Range */}
        <div className="space-y-2">
          <Label>Range Costi: {formatCurrency(filters.costRange.min)} - {formatCurrency(filters.costRange.max)}</Label>
          <Slider
            value={[filters.costRange.min, Math.min(filters.costRange.max, filterOptions.maxCost)]}
            onValueChange={([min, max]) => updateFilter('costRange', { min, max })}
            max={filterOptions.maxCost}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Duration Range */}
        <div className="space-y-2">
          <Label>Range Durata: {formatDuration(filters.durationRange.min)} - {formatDuration(Math.min(filters.durationRange.max, filterOptions.maxDuration))}</Label>
          <Slider
            value={[filters.durationRange.min, Math.min(filters.durationRange.max, filterOptions.maxDuration)]}
            onValueChange={([min, max]) => updateFilter('durationRange', { min, max })}
            max={filterOptions.maxDuration}
            step={60}
            className="w-full"
          />
        </div>

        {/* Sorting */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ordina per</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value: any) => updateFilter('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="cost">Costo</SelectItem>
                <SelectItem value="duration">Durata</SelectItem>
                <SelectItem value="number">Numero</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ordine</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value: any) => updateFilter('sortOrder', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Crescente</SelectItem>
                <SelectItem value="desc">Decrescente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label>Filtri Attivi</Label>
            <div className="flex flex-wrap gap-2">
              {filters.searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Ricerca: {filters.searchQuery}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('searchQuery', '')}
                  />
                </Badge>
              )}
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Categorie: {filters.categories.length}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('categories', [])}
                  />
                </Badge>
              )}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="secondary" className="text-xs">
                  Date: {filters.dateRange.from ? format(filters.dateRange.from, "dd/MM") : "∞"} - {filters.dateRange.to ? format(filters.dateRange.to, "dd/MM") : "∞"}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('dateRange', { from: null, to: null })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;