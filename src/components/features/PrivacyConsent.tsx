'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, CheckCircle, Lock, Eye, Trash2 } from 'lucide-react';
import { usePrivacyStore } from '@/lib/store';
import { Button, Card } from '@/components/ui';

interface PrivacyConsentProps {
  onAccept: () => void;
  onDecline?: () => void;
}

export function PrivacyConsent({ onAccept, onDecline }: PrivacyConsentProps) {
  const { setConsent, setStoreData, setSessionOnly } = usePrivacyStore();
  const [storeDataLocal, setStoreDataLocal] = useState(false);

  const handleAccept = () => {
    setConsent(true);
    setStoreData(storeDataLocal);
    setSessionOnly(!storeDataLocal);
    onAccept();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg"
      >
        <Card variant="elevated" className="relative">
          {onDecline && (
            <button
              onClick={onDecline}
              className="absolute top-4 right-4 text-foreground-muted hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-accent-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Your Privacy Matters
            </h2>
            <p className="text-foreground-muted">
              Before we analyze your resume, here's how we protect your data.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-3 bg-background-tertiary rounded-lg">
              <Lock className="w-5 h-5 text-accent-success mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Secure Processing</h4>
                <p className="text-sm text-foreground-muted">
                  Your resume is encrypted and processed on secure servers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background-tertiary rounded-lg">
              <Eye className="w-5 h-5 text-accent-info mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">No Third-Party Access</h4>
                <p className="text-sm text-foreground-muted">
                  We never share your data with advertisers or recruiters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background-tertiary rounded-lg">
              <Trash2 className="w-5 h-5 text-accent-warning mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Auto-Delete</h4>
                <p className="text-sm text-foreground-muted">
                  Data is automatically deleted when you close your session.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={storeDataLocal}
                onChange={(e) => setStoreDataLocal(e.target.checked)}
                className="mt-1 rounded border-border bg-background-tertiary text-accent-primary focus:ring-accent-primary"
              />
              <div>
                <span className="font-medium text-foreground">
                  Save my analysis history locally
                </span>
                <p className="text-sm text-foreground-muted">
                  Store results in your browser for future reference. You can clear this anytime.
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            {onDecline && (
              <Button variant="ghost" onClick={onDecline} className="flex-1">
                Decline
              </Button>
            )}
            <Button onClick={handleAccept} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              I Understand, Continue
            </Button>
          </div>

          <p className="text-xs text-foreground-subtle text-center mt-4">
            By continuing, you agree to our{' '}
            <a href="#" className="text-accent-primary hover:underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="#" className="text-accent-primary hover:underline">
              Terms of Service
            </a>
            .
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export function PrivacyBanner() {
  const { hasConsented, setConsent, clearAllData } = usePrivacyStore();
  const [showDetails, setShowDetails] = useState(false);

  if (hasConsented) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background-secondary border-t border-border"
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent-primary flex-shrink-0" />
            <p className="text-sm text-foreground-muted">
              We process your resume securely and don't store any data without your consent.{' '}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-accent-primary hover:underline"
              >
                Learn more
              </button>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setConsent(true)}>
              Accept
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function DataManagement() {
  const { storeData, setStoreData, clearAllData } = usePrivacyStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearData = () => {
    clearAllData();
    setShowConfirm(false);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-foreground mb-4">Data & Privacy</h3>
      
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <div>
            <span className="font-medium text-foreground">Store Analysis History</span>
            <p className="text-sm text-foreground-muted">
              Save your analysis results locally in your browser
            </p>
          </div>
          <input
            type="checkbox"
            checked={storeData}
            onChange={(e) => setStoreData(e.target.checked)}
            className="rounded border-border bg-background-tertiary text-accent-primary focus:ring-accent-primary"
          />
        </label>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-foreground">Clear All Data</span>
              <p className="text-sm text-foreground-muted">
                Delete all locally stored analysis history
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <Card className="max-w-sm">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Clear All Data?
              </h4>
              <p className="text-sm text-foreground-muted mb-4">
                This will permanently delete all your saved analysis history.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowConfirm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleClearData} className="flex-1">
                  Delete Everything
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

