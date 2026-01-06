'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Zap, FileSearch, BarChart3, Lightbulb, ArrowRight, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  Card, CardHeader, CardContent, Button, ScoreCircle,
  ProgressBar, Badge, SkillBadge, Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui';
import type { AnalysisResult } from '@/types';

export function AnalysisDashboard() {
  const {
    resume, jd, analysis, setAnalysis,
    isAnalyzing, setIsAnalyzing, setError, setStep
  } = useAppStore();
  
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);

  useEffect(() => {
    if (resume && jd && !analysis && !hasStartedAnalysis) {
      runAnalysis();
    }
  }, [resume, jd]);

  const runAnalysis = async () => {
    if (!resume || !jd) return;

    setHasStartedAnalysis(true);
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jd }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinue = () => {
    setStep(3);
  };

  const handleBack = () => {
    setStep(1);
  };

  if (isAnalyzing) {
    return <AnalysisLoading />;
  }

  if (!analysis) {
    return (
      <Card className="text-center py-12">
        <p className="text-foreground-muted mb-4">Unable to complete analysis</p>
        <Button onClick={runAnalysis}>Try Again</Button>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Score Overview */}
      <ScoreOverview analysis={analysis} />

      {/* Detailed Analysis Tabs */}
      <Card>
        <Tabs defaultValue="skills">
          <TabsList className="mb-6">
            <TabsTrigger value="skills" icon={<Target className="w-4 h-4" />}>
              Skills Match
            </TabsTrigger>
            <TabsTrigger value="ats" icon={<FileSearch className="w-4 h-4" />}>
              ATS Analysis
            </TabsTrigger>
            <TabsTrigger value="keywords" icon={<BarChart3 className="w-4 h-4" />}>
              Keywords
            </TabsTrigger>
            <TabsTrigger value="suggestions" icon={<Lightbulb className="w-4 h-4" />}>
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skills">
            <SkillsAnalysis analysis={analysis} />
          </TabsContent>

          <TabsContent value="ats">
            <ATSAnalysis analysis={analysis} />
          </TabsContent>

          <TabsContent value="keywords">
            <KeywordAnalysis analysis={analysis} />
          </TabsContent>

          <TabsContent value="suggestions">
            <SuggestionsSection analysis={analysis} />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack}>
          Back to Job Description
        </Button>
        <Button onClick={handleContinue} size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Improve Resume
        </Button>
      </div>
    </motion.div>
  );
}

function AnalysisLoading() {
  return (
    <Card className="text-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-accent-primary/20 border-t-accent-primary"
      />
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Analyzing Your Resume
      </h3>
      <p className="text-foreground-muted max-w-md mx-auto">
        Our AI is comparing your resume against the job requirements,
        checking ATS compatibility, and identifying improvement opportunities...
      </p>
      <div className="mt-8 flex justify-center gap-2">
        {['Skills', 'Experience', 'Keywords', 'ATS'].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className="px-3 py-1 bg-background-tertiary rounded-full text-sm text-foreground-muted"
          >
            {item}
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function ScoreOverview({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Main Score */}
      <Card variant="gradient" className="lg:col-span-2 flex flex-col items-center justify-center py-8">
        <ScoreCircle score={analysis.overallScore} size="xl" />
        <h3 className="mt-4 text-xl font-semibold text-foreground">Overall Match</h3>
        <p className="text-sm text-foreground-muted mt-1">
          {analysis.overallScore >= 80
            ? 'Excellent match!'
            : analysis.overallScore >= 60
            ? 'Good match with room for improvement'
            : 'Needs significant improvements'}
        </p>
      </Card>

      {/* Individual Scores */}
      <div className="lg:col-span-3 grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center py-6">
          <ScoreCircle score={analysis.skillMatchScore} size="md" />
          <span className="mt-3 text-sm font-medium text-foreground">Skills Match</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <ScoreCircle score={analysis.experienceScore} size="md" />
          <span className="mt-3 text-sm font-medium text-foreground">Experience</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <ScoreCircle score={analysis.keywordScore} size="md" />
          <span className="mt-3 text-sm font-medium text-foreground">Keywords</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <ScoreCircle score={analysis.atsScore} size="md" />
          <span className="mt-3 text-sm font-medium text-foreground">ATS Score</span>
        </Card>
      </div>
    </div>
  );
}

function SkillsAnalysis({ analysis }: { analysis: AnalysisResult }) {
  const matchedSkills = analysis.skillMatches.filter((s) => s.status === 'matched');
  const partialSkills = analysis.skillMatches.filter((s) => s.status === 'partial');
  const missingSkills = analysis.skillMatches.filter((s) => s.status === 'missing');

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-accent-success/10 rounded-lg text-center">
          <div className="text-2xl font-bold text-accent-success">{matchedSkills.length}</div>
          <div className="text-sm text-foreground-muted">Matched</div>
        </div>
        <div className="p-4 bg-accent-warning/10 rounded-lg text-center">
          <div className="text-2xl font-bold text-accent-warning">{partialSkills.length}</div>
          <div className="text-sm text-foreground-muted">Partial</div>
        </div>
        <div className="p-4 bg-accent-danger/10 rounded-lg text-center">
          <div className="text-2xl font-bold text-accent-danger">{missingSkills.length}</div>
          <div className="text-sm text-foreground-muted">Missing</div>
        </div>
      </div>

      {/* Skill Lists */}
      <div className="space-y-4">
        {/* Matched Skills */}
        {matchedSkills.length > 0 && (
          <div className="p-4 bg-background-tertiary rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-accent-success" />
              <h4 className="font-semibold text-foreground">Matched Skills</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill, i) => (
                <SkillBadge key={i} skill={skill.skill} status="matched" />
              ))}
            </div>
          </div>
        )}

        {/* Partial Matches */}
        {partialSkills.length > 0 && (
          <div className="p-4 bg-background-tertiary rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-accent-warning" />
              <h4 className="font-semibold text-foreground">Partial Matches</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {partialSkills.map((skill, i) => (
                <SkillBadge key={i} skill={skill.skill} status="partial" />
              ))}
            </div>
            <p className="mt-3 text-sm text-foreground-muted">
              These skills are related but could be emphasized more clearly.
            </p>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="p-4 bg-background-tertiary rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-accent-danger" />
              <h4 className="font-semibold text-foreground">Missing Skills</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, i) => (
                <SkillBadge key={i} skill={skill.skill} status="missing" />
              ))}
            </div>
            <p className="mt-3 text-sm text-foreground-muted">
              Consider adding these if you have relevant experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ATSAnalysis({ analysis }: { analysis: AnalysisResult }) {
  const { atsAnalysis } = analysis;
  const criticalIssues = atsAnalysis.issues.filter((i) => i.severity === 'critical');
  const warnings = atsAnalysis.issues.filter((i) => i.severity === 'warning');
  const suggestions = atsAnalysis.issues.filter((i) => i.severity === 'suggestion');

  return (
    <div className="space-y-6">
      {/* ATS Score Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-background-tertiary rounded-lg">
          <ProgressBar value={atsAnalysis.formatScore} label="Format" />
        </div>
        <div className="p-4 bg-background-tertiary rounded-lg">
          <ProgressBar value={atsAnalysis.keywordScore} label="Keywords" />
        </div>
        <div className="p-4 bg-background-tertiary rounded-lg">
          <ProgressBar value={atsAnalysis.structureScore} label="Structure" />
        </div>
        <div className="p-4 bg-background-tertiary rounded-lg">
          <ProgressBar value={atsAnalysis.readabilityScore} label="Readability" />
        </div>
      </div>

      {/* Issues */}
      {criticalIssues.length > 0 && (
        <div className="p-4 bg-accent-danger/10 border border-accent-danger/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-accent-danger" />
            <h4 className="font-semibold text-accent-danger">Critical Issues ({criticalIssues.length})</h4>
          </div>
          <ul className="space-y-3">
            {criticalIssues.map((issue, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-accent-danger mt-0.5">•</span>
                <div>
                  <p className="text-sm text-foreground">{issue.message}</p>
                  {issue.fix && (
                    <p className="text-xs text-foreground-muted mt-1">
                      <span className="text-accent-success">Fix:</span> {issue.fix}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-4 bg-accent-warning/10 border border-accent-warning/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-accent-warning" />
            <h4 className="font-semibold text-accent-warning">Warnings ({warnings.length})</h4>
          </div>
          <ul className="space-y-2">
            {warnings.map((issue, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground-muted">
                <span className="text-accent-warning mt-0.5">•</span>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-accent-info" />
            <h4 className="font-semibold text-foreground">Suggestions ({suggestions.length})</h4>
          </div>
          <ul className="space-y-2">
            {suggestions.map((issue, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground-muted">
                <span className="text-accent-info mt-0.5">•</span>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {atsAnalysis.issues.length === 0 && (
        <div className="p-6 bg-accent-success/10 border border-accent-success/30 rounded-lg text-center">
          <CheckCircle className="w-12 h-12 text-accent-success mx-auto mb-3" />
          <h4 className="font-semibold text-accent-success">Excellent ATS Compatibility!</h4>
          <p className="text-sm text-foreground-muted mt-1">
            Your resume is well-formatted for ATS systems.
          </p>
        </div>
      )}
    </div>
  );
}

function KeywordAnalysis({ analysis }: { analysis: AnalysisResult }) {
  const sortedKeywords = [...analysis.keywordAnalysis].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.importance] - priorityOrder[b.importance];
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground-muted">
        These keywords are important for ATS matching. Green means you have them, red means they're missing.
      </p>
      
      <div className="divide-y divide-border">
        {sortedKeywords.slice(0, 15).map((keyword, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Badge
                variant={keyword.importance === 'high' ? 'danger' : keyword.importance === 'medium' ? 'warning' : 'neutral'}
              >
                {keyword.importance}
              </Badge>
              <span className="font-medium text-foreground">{keyword.keyword}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className={keyword.frequency.resume > 0 ? 'text-accent-success' : 'text-accent-danger'}>
                  Resume: {keyword.frequency.resume}
                </span>
                <span className="text-foreground-muted mx-2">|</span>
                <span className="text-foreground-muted">
                  JD: {keyword.frequency.jd}
                </span>
              </div>
              {keyword.frequency.resume === 0 && (
                <ChevronRight className="w-4 h-4 text-foreground-muted" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {analysis.keywordAnalysis.length > 15 && (
        <p className="text-sm text-foreground-muted text-center">
          +{analysis.keywordAnalysis.length - 15} more keywords analyzed
        </p>
      )}
    </div>
  );
}

function SuggestionsSection({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="p-4 bg-accent-success/10 border border-accent-success/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-accent-success" />
            <h4 className="font-semibold text-accent-success">Your Strengths</h4>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-accent-success mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {analysis.weaknesses.length > 0 && (
        <div className="p-4 bg-accent-warning/10 border border-accent-warning/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-accent-warning" />
            <h4 className="font-semibold text-accent-warning">Areas for Improvement</h4>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <AlertTriangle className="w-4 h-4 text-accent-warning mt-0.5 flex-shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-accent-primary" />
            <h4 className="font-semibold text-foreground">Quick Wins</h4>
          </div>
          <ul className="space-y-3">
            {analysis.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

