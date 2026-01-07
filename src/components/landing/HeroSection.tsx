"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";

export function HeroSection() {
  const { setStep, setHasStartedAnalysis } = useAppStore();

  const handleGetStarted = () => {
    setHasStartedAnalysis(true);
    setStep(0);
  };

  const handleSeeHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="container mx-auto px-4 pt-20 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 border border-accent-primary/30 rounded-full text-sm text-accent-primary mb-6"
        >
          <Sparkles className="w-4 h-4" />
          <span>Powered by Google Gemini AI • 100% Free</span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
          Land Your Dream Job with{" "}
          <span className="gradient-text">AI-Powered</span> Resume Analysis
        </h1>

        {/* Description */}
        <p className="text-xl text-foreground-muted mb-8 max-w-2xl mx-auto">
          Instantly analyze your resume against any job description. Get ATS
          scores, keyword optimization, and AI-powered improvements to stand
          out from the crowd.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="w-full sm:w-auto"
          >
            Analyze My Resume
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleSeeHowItWorks}
          >
            See How It Works
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-foreground-muted">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent-success" />
            <span>Free to use</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent-success" />
            <span>No signup required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent-success" />
            <span>Privacy first</span>
          </div>
        </div>
      </motion.div>

      {/* Demo Preview */}
      <DemoPreview />
    </section>
  );
}

function DemoPreview() {
  const stats = [
    { label: "Overall Match", value: "87%", color: "text-accent-success" },
    { label: "Skills Match", value: "92%", color: "text-accent-success" },
    { label: "ATS Score", value: "85%", color: "text-accent-success" },
    { label: "Keywords", value: "78%", color: "text-accent-warning" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-20 max-w-5xl mx-auto"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 via-accent-secondary/20 to-accent-info/20 blur-3xl -z-10" />
        <div className="p-1 rounded-2xl bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-info">
          <div className="bg-background rounded-xl p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-4 bg-background-secondary rounded-lg text-center"
                >
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-foreground-muted mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

