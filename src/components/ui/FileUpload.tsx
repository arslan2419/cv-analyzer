'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { Button } from './Button';

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  onUpload: (file: File) => Promise<void>;
  label?: string;
  description?: string;
  className?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function FileUpload({
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize = 10 * 1024 * 1024,
  onUpload,
  label = 'Upload your resume',
  description = 'Drag & drop your PDF or DOCX file here, or click to browse',
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];
      if (!uploadedFile) return;

      setFile(uploadedFile);
      setStatus('uploading');
      setError(null);

      try {
        await onUpload(uploadedFile);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const handleRemove = () => {
    setFile(null);
    setStatus('idle');
    setError(null);
  };

  const fileRejectionError = fileRejections[0]?.errors[0];

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            {...getRootProps()}
            className={cn(
              'dropzone p-8 text-center',
              isDragActive && 'dropzone-active'
            )}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ y: isDragActive ? -5 : 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
                  isDragActive
                    ? 'bg-accent-primary/20 text-accent-primary'
                    : 'bg-background-tertiary text-foreground-muted'
                )}
              >
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground mb-1">{label}</p>
                <p className="text-sm text-foreground-muted">{description}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground-subtle">
                <span className="px-2 py-1 bg-background-tertiary rounded">PDF</span>
                <span className="px-2 py-1 bg-background-tertiary rounded">DOCX</span>
                <span>Max {formatFileSize(maxSize)}</span>
              </div>
            </motion.div>
            {fileRejectionError && (
              <p className="mt-4 text-sm text-accent-danger">
                {fileRejectionError.code === 'file-too-large'
                  ? `File is too large. Maximum size is ${formatFileSize(maxSize)}`
                  : fileRejectionError.message}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'card flex items-center gap-4',
              status === 'success' && 'border-accent-success/30 bg-accent-success/5',
              status === 'error' && 'border-accent-danger/30 bg-accent-danger/5'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                status === 'uploading' && 'bg-accent-primary/10 text-accent-primary',
                status === 'success' && 'bg-accent-success/10 text-accent-success',
                status === 'error' && 'bg-accent-danger/10 text-accent-danger'
              )}
            >
              {status === 'uploading' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : status === 'error' ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <File className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{file.name}</p>
              <p className="text-sm text-foreground-muted">
                {formatFileSize(file.size)}
                {status === 'uploading' && ' • Processing...'}
                {status === 'success' && ' • Uploaded successfully'}
                {status === 'error' && ` • ${error || 'Upload failed'}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

