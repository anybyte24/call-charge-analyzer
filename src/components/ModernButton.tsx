import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-brand hover:shadow-brand-hover hover:scale-105 active:scale-95',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-brand hover:shadow-brand-hover hover:scale-105 active:scale-95',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 mr-2" />
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={cn(iconSize[size], children && 'mr-2')} />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={cn(iconSize[size], children && 'ml-2')} />
      )}
    </button>
  );
};