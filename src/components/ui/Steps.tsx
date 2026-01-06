'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function Steps({ steps, currentStep, onStepClick, className }: StepsProps) {
  return (
    <nav className={cn('', className)}>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <li key={step.id} className="flex items-center">
              {/* Step */}
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300',
                  isClickable && 'cursor-pointer hover:bg-background-tertiary',
                  !isClickable && 'cursor-default'
                )}
              >
                {/* Indicator */}
                <motion.div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    isCompleted && 'bg-accent-success text-white',
                    isCurrent && 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow',
                    !isCompleted && !isCurrent && 'bg-background-tertiary text-foreground-muted border border-border'
                  )}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id + 1
                  )}
                </motion.div>

                {/* Text */}
                <div className="hidden sm:block text-left">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isCurrent && 'text-foreground',
                      isCompleted && 'text-accent-success',
                      !isCompleted && !isCurrent && 'text-foreground-muted'
                    )}
                  >
                    {step.name}
                  </p>
                  {step.description && (
                    <p className="text-xs text-foreground-subtle">{step.description}</p>
                  )}
                </div>
              </button>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block w-12 mx-2">
                  <div className="h-0.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                      initial={{ width: '0%' }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface VerticalStepsProps extends StepsProps {
  showConnectors?: boolean;
}

export function VerticalSteps({
  steps,
  currentStep,
  onStepClick,
  showConnectors = true,
  className,
}: VerticalStepsProps) {
  return (
    <nav className={cn('', className)}>
      <ol className="space-y-0">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <li key={step.id} className="relative">
              {/* Connector line */}
              {showConnectors && index < steps.length - 1 && (
                <div className="absolute left-4 top-10 w-0.5 h-full -ml-px">
                  <div className="h-full bg-border">
                    <motion.div
                      className="bg-gradient-to-b from-accent-primary to-accent-secondary"
                      initial={{ height: '0%' }}
                      animate={{ height: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              {/* Step */}
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex items-start gap-4 p-3 rounded-lg transition-all duration-300 w-full text-left',
                  isClickable && 'cursor-pointer hover:bg-background-tertiary',
                  !isClickable && 'cursor-default'
                )}
              >
                {/* Indicator */}
                <motion.div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                    isCompleted && 'bg-accent-success text-white',
                    isCurrent && 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow',
                    !isCompleted && !isCurrent && 'bg-background-tertiary text-foreground-muted border border-border'
                  )}
                  animate={{
                    scale: isCurrent ? 1.05 : 1,
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id + 1
                  )}
                </motion.div>

                {/* Text */}
                <div>
                  <p
                    className={cn(
                      'font-medium transition-colors',
                      isCurrent && 'text-foreground',
                      isCompleted && 'text-accent-success',
                      !isCompleted && !isCurrent && 'text-foreground-muted'
                    )}
                  >
                    {step.name}
                  </p>
                  {step.description && (
                    <p className="text-sm text-foreground-subtle mt-0.5">{step.description}</p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

