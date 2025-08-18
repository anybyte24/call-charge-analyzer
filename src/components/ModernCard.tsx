import React from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  interactive?: boolean;
  gradient?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  variant = 'default',
  interactive = false,
  gradient = false,
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-card border border-border/50 shadow-elegant',
    glass: 'glass shadow-glass',
    elevated: 'bg-card shadow-elegant hover:shadow-elegant-hover',
    bordered: 'bg-card border-2 border-border hover:border-primary/50',
  };

  const interactiveStyles = interactive 
    ? 'hover:scale-[1.01] hover:shadow-elegant-hover cursor-pointer' 
    : '';

  const gradientStyles = gradient 
    ? 'bg-gradient-to-br from-background via-background to-primary/5' 
    : '';

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        interactiveStyles,
        gradientStyles,
        className
      )}
    >
      {children}
    </div>
  );
};