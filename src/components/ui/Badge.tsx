'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-accent-success/10 text-accent-success border-accent-success/30',
  warning: 'bg-accent-warning/10 text-accent-warning border-accent-warning/30',
  danger: 'bg-accent-danger/10 text-accent-danger border-accent-danger/30',
  info: 'bg-accent-info/10 text-accent-info border-accent-info/30',
  neutral: 'bg-background-elevated text-foreground-muted border-border',
  primary: 'bg-accent-primary/10 text-accent-primary border-accent-primary/30',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-accent-success',
            variant === 'warning' && 'bg-accent-warning',
            variant === 'danger' && 'bg-accent-danger',
            variant === 'info' && 'bg-accent-info',
            variant === 'neutral' && 'bg-foreground-subtle',
            variant === 'primary' && 'bg-accent-primary'
          )}
        />
      )}
      {children}
    </span>
  );
}

interface SkillBadgeProps {
  skill: string;
  status?: 'matched' | 'partial' | 'missing' | 'neutral';
  showIcon?: boolean;
  className?: string;
}

export function SkillBadge({ skill, status = 'neutral', showIcon = true, className }: SkillBadgeProps) {
  const statusConfig = {
    matched: {
      styles: 'bg-accent-success/10 text-accent-success border-accent-success/30',
      icon: '✓',
    },
    partial: {
      styles: 'bg-accent-warning/10 text-accent-warning border-accent-warning/30',
      icon: '~',
    },
    missing: {
      styles: 'bg-accent-danger/10 text-accent-danger border-accent-danger/30',
      icon: '✕',
    },
    neutral: {
      styles: 'bg-background-tertiary text-foreground-muted border-border',
      icon: '',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all duration-200',
        config.styles,
        className
      )}
    >
      {showIcon && config.icon && (
        <span className="text-xs">{config.icon}</span>
      )}
      {skill}
    </span>
  );
}

