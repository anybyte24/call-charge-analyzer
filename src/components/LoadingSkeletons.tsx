import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
        <CardContent className="p-8">
          <Skeleton className="h-8 w-64 mb-4 bg-white/20" />
          <Skeleton className="h-4 w-48 mb-4 bg-white/10" />
          <div className="flex space-x-6">
            <Skeleton className="h-3 w-32 bg-white/10" />
            <Skeleton className="h-3 w-28 bg-white/10" />
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </CardHeader>
      </Card>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-6 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => {
  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full`} style={{ height: `${height}px` }} />
      </CardContent>
    </Card>
  );
};

export const AnalysisLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-2 w-full max-w-md mx-auto rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Processing steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Skeleton className="h-12 w-12 mx-auto mb-3 rounded-full" />
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};