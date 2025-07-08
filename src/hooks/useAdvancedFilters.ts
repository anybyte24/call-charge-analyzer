import { useState, useMemo, useCallback } from 'react';
import { CallRecord } from '@/types/call-analysis';

export interface FilterState {
  searchQuery: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  categories: string[];
  costRange: {
    min: number;
    max: number;
  };
  durationRange: {
    min: number; // in seconds
    max: number; // in seconds
  };
  callers: string[];
  sortBy: 'date' | 'cost' | 'duration' | 'number';
  sortOrder: 'asc' | 'desc';
}

const initialFilters: FilterState = {
  searchQuery: '',
  dateRange: { from: null, to: null },
  categories: [],
  costRange: { min: 0, max: Infinity },
  durationRange: { min: 0, max: Infinity },
  callers: [],
  sortBy: 'date',
  sortOrder: 'desc'
};

export const useAdvancedFilters = (records: CallRecord[]) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(records.map(r => r.category.description))];
    const callers = [...new Set(records.map(r => r.callerNumber))];
    const maxCost = Math.max(...records.map(r => r.cost || 0));
    const maxDuration = Math.max(...records.map(r => r.durationSeconds));

    return {
      categories,
      callers,
      maxCost,
      maxDuration
    };
  }, [records]);

  // Apply filters to records
  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.calledNumber.toLowerCase().includes(query) ||
        record.callerNumber.toLowerCase().includes(query) ||
        record.category.description.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        const from = filters.dateRange.from;
        const to = filters.dateRange.to;
        
        if (from && recordDate < from) return false;
        if (to && recordDate > to) return false;
        
        return true;
      });
    }

    // Categories filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(record => 
        filters.categories.includes(record.category.description)
      );
    }

    // Cost range filter
    filtered = filtered.filter(record => {
      const cost = record.cost || 0;
      return cost >= filters.costRange.min && cost <= filters.costRange.max;
    });

    // Duration range filter
    filtered = filtered.filter(record => {
      return record.durationSeconds >= filters.durationRange.min && 
             record.durationSeconds <= filters.durationRange.max;
    });

    // Callers filter
    if (filters.callers.length > 0) {
      filtered = filtered.filter(record => 
        filters.callers.includes(record.callerNumber)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          const dateA = new Date(`${a.date} ${a.timestamp}`);
          const dateB = new Date(`${b.date} ${b.timestamp}`);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'cost':
          comparison = (a.cost || 0) - (b.cost || 0);
          break;
        case 'duration':
          comparison = a.durationSeconds - b.durationSeconds;
          break;
        case 'number':
          comparison = a.calledNumber.localeCompare(b.calledNumber);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [records, filters]);

  // Update filter functions
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery !== '' ||
      filters.dateRange.from !== null ||
      filters.dateRange.to !== null ||
      filters.categories.length > 0 ||
      filters.costRange.min > 0 ||
      filters.costRange.max < Infinity ||
      filters.durationRange.min > 0 ||
      filters.durationRange.max < Infinity ||
      filters.callers.length > 0
    );
  }, [filters]);

  return {
    filters,
    filteredRecords,
    filterOptions,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    totalRecords: records.length,
    filteredCount: filteredRecords.length
  };
};