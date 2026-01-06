"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Target,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  MessageCircleCode,
  Github,
  Linkedin,
  Twitter,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button, Steps, Card } from "@/components/ui";
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

export default function HomePage() {
  const { currentStep, resume, setStep } = useAppStore();
  const hasStarted = resume !== null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">ResumeAI</span>
          </div>

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
            {hasStarted && (
              <Button size="sm" onClick={() => setStep(0)}>
                Continue Analysis
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <LandingPage key="landing" />
          ) : (
            <AnalyzerApp key="app" currentStep={currentStep} />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary/50 mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">ResumeAI</span>
              </div>
              <p className="text-sm text-foreground-muted">
                AI-powered resume analyzer helping job seekers land their dream
                jobs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-foreground">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li>
                  <Link href="https://zhsolutions.vercel.app/#about" className="hover:text-foreground">
                    About
                  </Link>
                </li>                
                <li>
                  <Link href="https://zhsolutions.vercel.app" className="hover:text-foreground">
                    Website
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li>
                  <Link href="#privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground-muted">
              <Link
                href="https://zhsoftwaresolutions.com/"
                target="_blank"
                className="text-foreground-muted hover:text-foreground"
              >
                Zh Solutions
              </Link>{" "}
              © {new Date().getFullYear()} ResumeAI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingPage() {
  const { setStep } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 border border-accent-primary/30 rounded-full text-sm text-accent-primary mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Powered by Google Gemini AI • 100% Free</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Land Your Dream Job with{" "}
            <span className="gradient-text">AI-Powered</span> Resume Analysis
          </h1>

          <p className="text-xl text-foreground-muted mb-8 max-w-2xl mx-auto">
            Instantly analyze your resume against any job description. Get ATS
            scores, keyword optimization, and AI-powered improvements to stand
            out from the crowd.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setStep(0)}
              className="w-full sm:w-auto"
            >
              Analyze My Resume
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              See How It Works
            </Button>
          </div>

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
                  {[
                    {
                      label: "Overall Match",
                      value: "87%",
                      color: "text-accent-success",
                    },
                    {
                      label: "Skills Match",
                      value: "92%",
                      color: "text-accent-success",
                    },
                    {
                      label: "ATS Score",
                      value: "85%",
                      color: "text-accent-success",
                    },
                    {
                      label: "Keywords",
                      value: "78%",
                      color: "text-accent-warning",
                    },
                  ].map((stat, i) => (
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
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
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

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-24">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
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
          ].map((item, i) => (
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
              <p className="text-sm text-foreground-muted">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" onClick={() => setStep(0)}>
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="container mx-auto px-4 py-24">
        <Card variant="gradient" className="max-w-4xl mx-auto">
          <div className="p-8 text-center">
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
              <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary rounded-lg">
                <CheckCircle className="w-5 h-5 text-accent-success" />
                <span className="text-sm">No data storage</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary rounded-lg">
                <CheckCircle className="w-5 h-5 text-accent-success" />
                <span className="text-sm">End-to-end encryption</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary rounded-lg">
                <CheckCircle className="w-5 h-5 text-accent-success" />
                <span className="text-sm">Session auto-delete</span>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </motion.div>
  );
}

function AnalyzerApp({ currentStep }: { currentStep: number }) {
  const { setStep } = useAppStore();

  const renderStep = () => {
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
      <AnimatePresence mode="wait">
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
