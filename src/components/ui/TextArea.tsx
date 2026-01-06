'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'input min-h-[120px] resize-y',
            error && 'input-error',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-xs text-foreground-subtle">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-accent-danger">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

