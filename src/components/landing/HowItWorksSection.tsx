"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";

const STEPS = [
  {
    step: 1,
    title: "Upload Your Resume",
    description:
      "Drop your PDF or DOCX resume and we'll extract all the important details.",
  },
  {
    step: 2,
    title: "Add Job Description",
    description:
      "Paste the job posting you're applying for or upload as PDF.",
  },
  {
    step: 3,
    title: "Get AI Analysis",
    description:
      "Receive detailed scores, missing skills, and AI-powered improvements.",
  },
];

export function HowItWorksSection() {
  const { setStep, setHasStartedAnalysis } = useAppStore();

  const handleGetStarted = () => {
    setHasStartedAnalysis(true);
    setStep(0);
  };

  return (
    <section id="how-it-works" className="container mx-auto px-4 py-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-foreground mb-4">
          How It <span className="gradient-text">Works</span>
        </h2>
        <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
          Three simple steps to optimize your resume for any job.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {STEPS.map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
              {item.step}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-foreground-muted">{item.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Button size="lg" onClick={handleGetStarted}>
          Get Started Now
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </section>
  );
}

