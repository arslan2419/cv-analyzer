"use client";

import { motion } from "framer-motion";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { PrivacySection } from "./PrivacySection";

export function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PrivacySection />
    </motion.div>
  );
}

