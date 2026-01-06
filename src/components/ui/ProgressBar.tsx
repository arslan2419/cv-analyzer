'use client';

import { motion } from 'framer-motion';
import { cn, getScoreGradient } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'striped';
  className?: string;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  variant = 'gradient',
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-foreground-muted">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('bg-background-tertiary rounded-full overflow-hidden', sizeStyles[size])}>
        <motion.div
          className={cn(
            'h-full rounded-full',
            variant === 'gradient' && `bg-gradient-to-r ${getScoreGradient(percentage)}`,
            variant === 'default' && 'bg-accent-primary',
            variant === 'striped' && `bg-gradient-to-r ${getScoreGradient(percentage)} bg-[length:20px_20px]`
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface MultiProgressBarProps {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  total?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MultiProgressBar({
  segments,
  total,
  size = 'md',
  className,
}: MultiProgressBarProps) {
  const totalValue = total || segments.reduce((acc, seg) => acc + seg.value, 0);

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('bg-background-tertiary rounded-full overflow-hidden flex', sizeStyles[size])}>
        {segments.map((segment, index) => {
          const percentage = (segment.value / totalValue) * 100;
          return (
            <motion.div
              key={index}
              className={cn('h-full', segment.color)}
              style={{ width: `${percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 text-xs">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', segment.color)} />
            <span className="text-foreground-muted">
              {segment.label || `${Math.round((segment.value / totalValue) * 100)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

