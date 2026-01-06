'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Share2, History, RotateCcw, Trophy, Target,
  TrendingUp, AlertTriangle, Sparkles, FileText, CheckCircle, Rocket
} from 'lucide-react';
import { useAppStore, useHistoryStore } from '@/lib/store';
import {
  Card, CardHeader, CardContent, Button, ScoreCircle,
  ProgressBar, Badge, Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui';

export function FinalSummary() {
  const { resume, jd, analysis, improvements, resetSession, setStep } = useAppStore();
  const { addHistory } = useHistoryStore();
  const [saved, setSaved] = useState(false);

  const handleSaveToHistory = () => {
    if (!resume || !jd || !analysis) return;

    addHistory({
      resumeVersion: {
        resumeId: resume.id,
        version: 1,
        data: resume,
        analysisId: analysis.id,
        improvements,
      },
      jd,
      analysis,
      improvements,
    });

    setSaved(true);
  };

  const handleStartOver = () => {
    resetSession();
  };

  const handleBack = () => {
    setStep(3);
  };

  if (!analysis || !resume || !jd) {
    return (
      <Card className="text-center py-12">
        <p className="text-foreground-muted">No analysis data available</p>
        <Button onClick={handleStartOver} className="mt-4">
          Start New Analysis
        </Button>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-6 bg-gradient-to-r from-accent-primary/20 via-accent-secondary/20 to-accent-info/20 border border-accent-primary/30 rounded-xl text-center"
      >
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Trophy className="w-16 h-16 text-accent-warning mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Analysis Complete! 🎉
        </h2>
        <p className="text-foreground-muted max-w-lg mx-auto">
          Your resume has been analyzed against the job description.
          Review your results below and apply the improvements to boost your chances.
        </p>
      </motion.div>

      {/* Score Summary */}
      <Card>
        <CardHeader
          icon={<Target className="w-5 h-5" />}
          title="Match Summary"
          description={`Targeting: ${jd.title}${jd.company ? ` at ${jd.company}` : ''}`}
        />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <ScoreCircle score={analysis.overallScore} size="lg" />
              <span className="mt-2 text-sm font-medium text-foreground">Overall</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <div className="text-3xl font-bold gradient-text">{analysis.skillMatchScore}</div>
              <span className="mt-1 text-xs text-foreground-muted">Skills</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <div className="text-3xl font-bold gradient-text">{analysis.experienceScore}</div>
              <span className="mt-1 text-xs text-foreground-muted">Experience</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <div className="text-3xl font-bold gradient-text">{analysis.keywordScore}</div>
              <span className="mt-1 text-xs text-foreground-muted">Keywords</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <div className="text-3xl font-bold gradient-text">{analysis.atsScore}</div>
              <span className="mt-1 text-xs text-foreground-muted">ATS</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <Card className="h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-success/10 text-accent-success">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.slice(0, 3).map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                <CheckCircle className="w-4 h-4 text-accent-success mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Areas to Improve */}
        <Card className="h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-warning/10 text-accent-warning">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground">To Improve</h3>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.slice(0, 3).map((weakness, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                <AlertTriangle className="w-4 h-4 text-accent-warning mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{weakness}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Improvements Made */}
        <Card className="h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground">AI Improvements</h3>
          </div>
          {improvements.length > 0 ? (
            <div className="space-y-3">
              <div className="text-3xl font-bold text-accent-primary">
                {improvements.length}
              </div>
              <p className="text-sm text-foreground-muted">
                sections improved with an average of{' '}
                <span className="text-accent-success font-semibold">
                  +{Math.round(improvements.reduce((acc, i) => acc + i.improvementScore, 0) / improvements.length)}%
                </span>{' '}
                enhancement
              </p>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">
              No improvements generated yet. Go back to add AI-powered enhancements.
            </p>
          )}
        </Card>
      </div>

      {/* Missing Skills */}
      {analysis.missingSkills.length > 0 && (
        <Card>
          <CardHeader
            icon={<Target className="w-5 h-5" />}
            title="Skills Gap"
            description="Consider adding these skills if you have relevant experience"
          />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, i) => (
                <Badge key={i} variant="danger" dot>
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card variant="glass">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={handleSaveToHistory}
                disabled={saved}
                leftIcon={saved ? <CheckCircle className="w-4 h-4" /> : <History className="w-4 h-4" />}
              >
                {saved ? 'Saved to History' : 'Save to History'}
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export Report
              </Button>
              <Button
                variant="ghost"
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleStartOver}
                leftIcon={<Rocket className="w-4 h-4" />}
              >
                Analyze Another Resume
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader
          icon={<Rocket className="w-5 h-5" />}
          title="Next Steps"
          description="Maximize your chances of landing the interview"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background-tertiary rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">1. Apply Improvements</h4>
              <p className="text-sm text-foreground-muted">
                Copy the AI-generated improvements and update your resume document.
              </p>
            </div>
            <div className="p-4 bg-background-tertiary rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">2. Add Missing Keywords</h4>
              <p className="text-sm text-foreground-muted">
                Incorporate high-priority keywords naturally in your experience sections.
              </p>
            </div>
            <div className="p-4 bg-background-tertiary rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">3. Fix ATS Issues</h4>
              <p className="text-sm text-foreground-muted">
                Address any formatting issues to ensure your resume passes ATS filters.
              </p>
            </div>
            <div className="p-4 bg-background-tertiary rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">4. Re-analyze</h4>
              <p className="text-sm text-foreground-muted">
                After making changes, run another analysis to verify improvements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

