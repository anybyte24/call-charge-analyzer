import React from 'react';
import { cn } from '@/lib/utils';

interface StaggeredAnimationProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  delay = 100,
  className,
}) => {
  return (
    <div className={cn('stagger-in', className)}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          style={{ '--stagger': index } as React.CSSProperties}
          className="animate-fade-in-up"
        >
          {child}
        </div>
      ))}
    </div>
  );
};