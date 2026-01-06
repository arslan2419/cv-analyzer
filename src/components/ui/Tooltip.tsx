'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const motionVariants = {
  top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
  bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
  left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 } },
};

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={motionVariants[position].initial}
            animate={motionVariants[position].animate}
            exit={motionVariants[position].initial}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm rounded-lg whitespace-nowrap',
              'bg-background-elevated border border-border shadow-lg',
              'text-foreground',
              positionStyles[position],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

