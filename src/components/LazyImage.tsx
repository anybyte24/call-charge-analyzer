import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = '/placeholder.svg',
  className,
  loading = 'lazy',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
  };

  const shouldLoad = loading === 'eager' || isInView;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        ref={imgRef}
        src={shouldLoad ? (isError ? placeholder : src) : placeholder}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        {...props}
      />
      
      {!isLoaded && shouldLoad && !isError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
};