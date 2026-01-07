"use client";

import { motion } from "framer-motion";
import {
  Target,
  FileText,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui";

const FEATURES = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "Smart Matching",
    description:
      "AI analyzes your resume against job requirements with precision",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "ATS Optimization",
    description: "Ensure your resume passes applicant tracking systems",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI Improvements",
    description: "Get personalized suggestions to enhance your resume",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Keyword Analysis",
    description: "Identify missing keywords and optimize placement",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy First",
    description: "Your data is processed securely and never stored",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Results",
    description: "Get comprehensive analysis in seconds",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Everything You Need to{" "}
          <span className="gradient-text">Stand Out</span>
        </h2>
        <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
          Our AI analyzes every aspect of your resume to help you land more
          interviews.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card hover className="h-full">
              <div className="p-2 w-12 h-12 rounded-lg bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 text-accent-primary flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-foreground-muted">
                {feature.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

