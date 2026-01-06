'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  hover?: boolean;
  asMotion?: boolean;
}

const variantStyles = {
  default: 'bg-background-secondary border border-border',
  elevated: 'bg-background-elevated border border-border-accent shadow-lg',
  glass: 'bg-background-secondary/80 backdrop-blur-xl border border-border/50',
  gradient: 'bg-card-gradient border border-border',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, asMotion = false, children, ...props }, ref) => {
    const baseStyles = cn(
      'rounded-xl p-6 transition-all duration-300',
      variantStyles[variant],
      hover && 'hover:border-border-accent hover:shadow-glow cursor-pointer',
      className
    );

    if (asMotion) {
      return (
        <motion.div
          ref={ref}
          className={baseStyles}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          whileHover={hover ? { scale: 1.02 } : undefined}
          {...(props as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-start justify-between mb-4', className)} {...props}>
        <div className="flex items-start gap-3">
          {icon && (
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 text-accent-primary">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-foreground-muted mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />;
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mt-4 pt-4 border-t border-border flex items-center justify-between', className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

