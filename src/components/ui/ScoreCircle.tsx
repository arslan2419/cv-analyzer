'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn, getScoreColor } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  showAnimation?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { diameter: 60, strokeWidth: 4, fontSize: 'text-lg', labelSize: 'text-xs' },
  md: { diameter: 80, strokeWidth: 5, fontSize: 'text-2xl', labelSize: 'text-xs' },
  lg: { diameter: 120, strokeWidth: 6, fontSize: 'text-3xl', labelSize: 'text-sm' },
  xl: { diameter: 160, strokeWidth: 8, fontSize: 'text-4xl', labelSize: 'text-base' },
};

export function ScoreCircle({
  score,
  size = 'md',
  label,
  showAnimation = true,
  className,
}: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(showAnimation ? 0 : score);
  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    if (showAnimation) {
      const duration = 1500;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(score * easeOut));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [score, showAnimation]);

  const getGradientId = () => {
    if (score >= 80) return 'scoreGradientSuccess';
    if (score >= 60) return 'scoreGradientWarning';
    return 'scoreGradientDanger';
  };

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        width={config.diameter}
        height={config.diameter}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="scoreGradientSuccess" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="scoreGradientWarning" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="scoreGradientDanger" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-background-tertiary"
        />

        {/* Progress circle */}
        <motion.circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke={`url(#${getGradientId()})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', config.fontSize, getScoreColor(score))}>
          {animatedScore}
        </span>
      </div>

      {/* Label */}
      {label && (
        <span className={cn('mt-2 text-foreground-muted font-medium', config.labelSize)}>
          {label}
        </span>
      )}
    </div>
  );
}

