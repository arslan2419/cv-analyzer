"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Steps } from "@/components/ui";
import {
  ResumeUpload,
  JobDescriptionInput,
  AnalysisDashboard,
  ResumeImprovement,
  FinalSummary,
} from "@/components/features";

const WORKFLOW_STEPS = [
  { id: 0, name: "Upload Resume", description: "PDF or DOCX" },
  { id: 1, name: "Add Job Description", description: "Paste or upload" },
  { id: 2, name: "View Analysis", description: "Match scores & insights" },
  { id: 3, name: "Improve Resume", description: "AI-powered suggestions" },
  { id: 4, name: "Summary", description: "Export & next steps" },
];

export function AnalyzerApp() {
  const { currentStep, setStep } = useAppStore();

  const renderStep = () => {
    // console.log('AnalyzerApp renderStep currentStep:', currentStep);
    switch (currentStep) {
      case 0:
        return <ResumeUpload />;
      case 1:
        return <JobDescriptionInput />;
      case 2:
        return <AnalysisDashboard />;
      case 3:
        return <ResumeImprovement />;
      case 4:
        // console.log('AnalyzerApp: returning <FinalSummary />');
        return <FinalSummary />;
      default:
        return <ResumeUpload />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto scrollbar-hide">
        <Steps
          steps={WORKFLOW_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow going back to completed steps
            if (step < currentStep) {
              setStep(step);
            }
          }}
        />
      </div>

      {/* Step Content */}
      <AnimatePresence>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

