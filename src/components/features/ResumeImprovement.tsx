'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RefreshCw, Copy, Check, ArrowLeft, ArrowRight,
  FileText, Briefcase, Code, Award, ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  Card, CardHeader, CardContent, Button, Badge, Select,
  Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui';
import type { ToneType, ImprovementSuggestion } from '@/types';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Polished, business-appropriate language' },
  { value: 'technical', label: 'Technical', description: 'Technical terms and methodologies' },
  { value: 'leadership', label: 'Leadership', description: 'Focus on team and strategic impact' },
  { value: 'confident', label: 'Confident', description: 'Strong, assertive language' },
];

export function ResumeImprovement() {
  const {
    resume, analysis, improvements, setImprovements,
    selectedTone, setSelectedTone, setStep, isImproving, setIsImproving, setError
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<string>('summary');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleImprove = async (section: 'summary' | 'experience' | 'projects' | 'skills') => {
    if (!resume || !analysis) return;

    let textToImprove = '';
    
    switch (section) {
      case 'summary':
        textToImprove = resume.summary || 'No summary available';
        break;
      case 'experience':
        textToImprove = resume.experience
          .map((exp) => `${exp.position} at ${exp.company}\n${exp.description.join('\n')}`)
          .join('\n\n');
        break;
      case 'projects':
        textToImprove = resume.projects
          .map((proj) => `${proj.name}\n${proj.description}`)
          .join('\n\n');
        break;
      case 'skills':
        textToImprove = resume.skills.join(', ');
        break;
    }

    if (!textToImprove || textToImprove.length < 10) {
      setError(`No ${section} content to improve`);
      return;
    }

    setIsImproving(true);
    setError(null);

    try {
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: [{ section, text: textToImprove }],
          tone: selectedTone,
          keywords: analysis.missingSkills.slice(0, 10),
          targetRole: analysis.skillMatches[0]?.jdContext,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Improvement failed');
      }

      setImprovements([...improvements, ...result.data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate improvements');
    } finally {
      setIsImproving(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBack = () => setStep(2);
  const handleContinue = () => setStep(4);

  const sectionImprovements = improvements.filter((i) => i.section === activeSection);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Controls */}
      <Card variant="glass">
        <CardHeader
          icon={<Sparkles className="w-5 h-5" />}
          title="AI Resume Improvement"
          description="Generate AI-powered improvements while preserving your facts"
        />
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1 w-full md:w-auto">
              <Select
                label="Writing Tone"
                options={TONE_OPTIONS}
                value={selectedTone}
                onChange={(value) => setSelectedTone(value as ToneType)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleImprove(activeSection as 'summary' | 'experience' | 'projects' | 'skills')}
                isLoading={isImproving}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Generate Improvement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Tabs */}
      <Card>
        <Tabs defaultValue="summary" value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="mb-6">
            <TabsTrigger value="summary" icon={<FileText className="w-4 h-4" />}>
              Summary
            </TabsTrigger>
            <TabsTrigger value="experience" icon={<Briefcase className="w-4 h-4" />}>
              Experience
            </TabsTrigger>
            <TabsTrigger value="projects" icon={<Code className="w-4 h-4" />}>
              Projects
            </TabsTrigger>
            <TabsTrigger value="skills" icon={<Award className="w-4 h-4" />}>
              Skills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SectionContent
              title="Professional Summary"
              original={resume?.summary}
              improvements={sectionImprovements}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          </TabsContent>

          <TabsContent value="experience">
            <SectionContent
              title="Work Experience"
              original={resume?.experience
                .map((exp) => `**${exp.position} at ${exp.company}**\n${exp.description.join('\n• ')}`)
                .join('\n\n')}
              improvements={sectionImprovements}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          </TabsContent>

          <TabsContent value="projects">
            <SectionContent
              title="Projects"
              original={resume?.projects
                .map((proj) => `**${proj.name}**\n${proj.description}`)
                .join('\n\n')}
              improvements={sectionImprovements}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          </TabsContent>

          <TabsContent value="skills">
            <SectionContent
              title="Skills"
              original={resume?.skills.join(', ')}
              improvements={sectionImprovements}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Analysis
        </Button>
        <Button onClick={handleContinue} size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
          View Summary & Export
        </Button>
      </div>
    </motion.div>
  );
}

interface SectionContentProps {
  title: string;
  original?: string;
  improvements: ImprovementSuggestion[];
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}

function SectionContent({ title, original, improvements, onCopy, copiedId }: SectionContentProps) {
  const [showOriginal, setShowOriginal] = useState(true);

  return (
    <div className="space-y-6">
      {/* Original Content */}
      <div className="p-4 bg-background-tertiary rounded-lg">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-foreground">Original Content</h4>
          <ChevronDown
            className={`w-4 h-4 text-foreground-muted transition-transform ${
              showOriginal ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence>
          {showOriginal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <pre className="text-sm text-foreground-muted whitespace-pre-wrap font-sans">
                {original || 'No content available for this section'}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Improvements */}
      {improvements.length > 0 ? (
        <div className="space-y-4">
          {improvements.map((improvement, index) => (
            <motion.div
              key={improvement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 border border-accent-primary/20 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-primary" />
                  <span className="font-semibold text-foreground">AI Improved Version</span>
                  <Badge variant="primary">{improvement.tone}</Badge>
                  <Badge variant="success">+{improvement.improvementScore}% improved</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy(improvement.improved, improvement.id)}
                >
                  {copiedId === improvement.id ? (
                    <>
                      <Check className="w-4 h-4 text-accent-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans mb-4">
                {improvement.improved}
              </pre>

              {/* Changes made */}
              {improvement.changes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h5 className="text-xs font-semibold text-foreground-muted uppercase mb-2">
                    Changes Made
                  </h5>
                  <ul className="space-y-1">
                    {improvement.changes.map((change, i) => (
                      <li key={i} className="text-xs text-foreground-muted flex items-start gap-2">
                        <span className="text-accent-primary">→</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Added Keywords */}
              {improvement.addedKeywords.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-foreground-muted">Keywords added:</span>
                  {improvement.addedKeywords.map((keyword, i) => (
                    <Badge key={i} variant="success" className="text-xs">
                      +{keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-background-tertiary rounded-lg text-center">
          <Sparkles className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <h4 className="font-semibold text-foreground mb-2">No improvements yet</h4>
          <p className="text-sm text-foreground-muted">
            Click "Generate Improvement" to get AI-powered suggestions for this section.
          </p>
        </div>
      )}
    </div>
  );
}

