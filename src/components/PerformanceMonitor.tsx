import { useEffect } from 'react';

interface PerformanceMetrics {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          
          const metrics: PerformanceMetrics[] = [
            {
              name: 'FCP',
              value: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
              rating: navigationEntry.loadEventEnd - navigationEntry.fetchStart < 1800 ? 'good' : 
                     navigationEntry.loadEventEnd - navigationEntry.fetchStart < 3000 ? 'needs-improvement' : 'poor'
            },
            {
              name: 'LCP',
              value: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
              rating: navigationEntry.loadEventEnd - navigationEntry.fetchStart < 2500 ? 'good' : 
                     navigationEntry.loadEventEnd - navigationEntry.fetchStart < 4000 ? 'needs-improvement' : 'poor'
            },
            {
              name: 'TTI',
              value: navigationEntry.domInteractive - navigationEntry.fetchStart,
              rating: navigationEntry.domInteractive - navigationEntry.fetchStart < 3800 ? 'good' : 
                     navigationEntry.domInteractive - navigationEntry.fetchStart < 7300 ? 'needs-improvement' : 'poor'
            }
          ];

          // Log performance metrics
          console.log('Performance Metrics:', metrics);

          // Send to analytics service
          // analytics.track('performance_metrics', metrics);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'measure'] });

    // Web Vitals monitoring
    const observeWebVitals = () => {
      // Core Web Vitals observer
      const vitalsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
        });
      });

      vitalsObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    };

    observeWebVitals();

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
};