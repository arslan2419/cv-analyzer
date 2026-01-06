'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Brain, Target, Lightbulb,
  ChevronDown, Star, AlertCircle, BookOpen
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardContent, Button, Badge, ProgressBar } from '@/components/ui';
import type { InterviewPrep as InterviewPrepType, InterviewQuestion } from '@/types';

export function InterviewPrep() {
  const { resume, jd, analysis, setError } = useAppStore();
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrepType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!resume || !jd || !analysis) {
      setError('Please complete the resume analysis first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jd, analysis }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate interview prep');
      }

      setInterviewPrep(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate interview prep');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'behavioral':
        return <MessageCircle className="w-4 h-4" />;
      case 'technical':
        return <Brain className="w-4 h-4" />;
      case 'situational':
        return <Target className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (!interviewPrep) {
    return (
      <Card className="text-center py-12">
        <Brain className="w-16 h-16 text-accent-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Interview Preparation
        </h3>
        <p className="text-foreground-muted max-w-md mx-auto mb-6">
          Generate personalized interview questions based on your resume
          and the job requirements. Practice makes perfect!
        </p>
        <Button onClick={handleGenerate} isLoading={isLoading} size="lg">
          Generate Interview Questions
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
      {/* Focus Areas */}
      <Card>
        <CardHeader
          icon={<Target className="w-5 h-5" />}
          title="Focus Areas"
          description="Key skills to emphasize during your interview"
        />
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {interviewPrep.focusSkills.map((skill, i) => (
              <Badge key={i} variant="primary" dot>
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weak Areas */}
      {interviewPrep.weakAreas.length > 0 && (
        <Card>
          <CardHeader
            icon={<AlertCircle className="w-5 h-5" />}
            title="Areas to Prepare"
            description="Topics where you may face challenging questions"
          />
          <CardContent>
            <ul className="space-y-3">
              {interviewPrep.weakAreas.map((area, i) => (
                <li key={i} className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent-warning mt-0.5" />
                  <div>
                    <span className="text-foreground">{area}</span>
                    {interviewPrep.prepTips[i] && (
                      <p className="text-sm text-foreground-muted mt-1">
                        💡 {interviewPrep.prepTips[i]}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Interview Questions */}
      <Card>
        <CardHeader
          icon={<MessageCircle className="w-5 h-5" />}
          title={`Interview Questions (${interviewPrep.questions.length})`}
          description="Practice these questions to ace your interview"
        />
        <CardContent>
          <div className="space-y-3">
            {interviewPrep.questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                isExpanded={expandedQuestion === question.id}
                onToggle={() =>
                  setExpandedQuestion(
                    expandedQuestion === question.id ? null : question.id
                  )
                }
                getTypeIcon={getTypeIcon}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regenerate */}
      <div className="text-center">
        <Button variant="secondary" onClick={handleGenerate} isLoading={isLoading}>
          Generate New Questions
        </Button>
      </div>
    </motion.div>
  );
}

interface QuestionCardProps {
  question: InterviewQuestion;
  isExpanded: boolean;
  onToggle: () => void;
  getTypeIcon: (type: string) => React.ReactNode;
  getDifficultyColor: (difficulty: string) => 'success' | 'warning' | 'danger' | 'neutral';
}

function QuestionCard({
  question,
  isExpanded,
  onToggle,
  getTypeIcon,
  getDifficultyColor,
}: QuestionCardProps) {
  return (
    <motion.div
      className="p-4 bg-background-tertiary rounded-lg cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-accent-primary">{getTypeIcon(question.type)}</span>
            <Badge variant={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <Badge variant="neutral">{question.type}</Badge>
          </div>
          <p className="text-foreground font-medium">{question.question}</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-foreground-muted transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-border"
          >
            {question.tips && question.tips.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent-warning" />
                  Tips
                </h5>
                <ul className="space-y-1">
                  {question.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-foreground-muted flex items-start gap-2">
                      <span className="text-accent-warning">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {question.sampleAnswer && (
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-info" />
                  Sample Approach
                </h5>
                <p className="text-sm text-foreground-muted">{question.sampleAnswer}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

