"use client";

import Link from "next/link";
import {
  FileText,
  MessageCircleCode,
  Github,
  Linkedin,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";

export function Header() {
  const { hasStartedAnalysis, setHasStartedAnalysis, setStep } = useAppStore();

  const handleContinue = () => {
    setHasStartedAnalysis(true);
    setStep(0);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setHasStartedAnalysis(false)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">ResumeAI</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            How it Works
          </Link>
          <Link
            href="#privacy"
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
        </nav>

        {/* Social Links & CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="https://wa.me/923340042304"
            target="_blank"
            className="text-foreground-muted hover:text-foreground"
          >
            <MessageCircleCode className="w-5 h-5" />
          </Link>
          <Link
            href="https://github.com/arslan2419"
            target="_blank"
            className="text-foreground-muted hover:text-foreground"
          >
            <Github className="w-5 h-5" />
          </Link>
          <Link
            href="https://linkedin.com/in/arslan-mukhtar"
            target="_blank"
            className="p-2 text-foreground-muted hover:text-foreground transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </Link>
          {hasStartedAnalysis && (
            <Button size="sm" onClick={handleContinue}>
              Continue Analysis
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

