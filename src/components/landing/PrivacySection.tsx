"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui";

const PRIVACY_FEATURES = [
  "No data storage",
  "End-to-end encryption",
  "Session auto-delete",
];

export function PrivacySection() {
  return (
    <section id="privacy" className="container mx-auto px-4 py-24">
      <Card variant="gradient" className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 text-center"
        >
          <Shield className="w-16 h-16 text-accent-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Your Privacy Matters
          </h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto mb-6">
            We never store your resume or job descriptions. All processing
            happens in real-time and data is automatically deleted after your
            session. Your career information stays yours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {PRIVACY_FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 px-4 py-2 bg-background-secondary rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-accent-success" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </Card>
    </section>
  );
}

