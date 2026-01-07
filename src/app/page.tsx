"use client";

import { AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Header, Footer } from "@/components/layout";
import { LandingPage } from "@/components/landing";
import { AnalyzerApp } from "@/components/analyzer";

export default function HomePage() {
  const { hasStartedAnalysis } = useAppStore();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-16">
        <AnimatePresence mode="wait">
          {!hasStartedAnalysis ? (
            <LandingPage key="landing" />
          ) : (
            <AnalyzerApp key="app" />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
