import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {children}
    </div>
  );
};

export const ResponsiveKPIGrid: React.FC<ResponsiveLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
      className
    )}>
      {children}
    </div>
  );
};

export const ResponsiveChartsGrid: React.FC<ResponsiveLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "grid gap-6",
      isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2",
      className
    )}>
      {children}
    </div>
  );
};

export const ResponsiveContainer: React.FC<ResponsiveLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "w-full mx-auto",
      isMobile ? "px-2 space-y-4" : "px-4 max-w-7xl space-y-6",
      className
    )}>
      {children}
    </div>
  );
};

export const MobileScrollContainer: React.FC<ResponsiveLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    return <>{children}</>;
  }
  
  return (
    <div className={cn(
      "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
      className
    )}>
      <div className="min-w-max">
        {children}
      </div>
    </div>
  );
};

// Hook for responsive breakpoints
export const useResponsiveBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };
    
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);
  
  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet'
  };
};