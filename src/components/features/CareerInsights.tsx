'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Target, Lightbulb, BookOpen,
  ArrowRight, Star, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardContent, Button, Badge, ProgressBar, Select } from '@/components/ui';
import { getAllRolePresets } from '@/lib/presets';
import type { CareerInsight } from '@/types';

const ROLE_OPTIONS = getAllRolePresets().map((role) => ({
  value: role.id,
  label: role.name,
  description: role.description,
}));

export function CareerInsights() {
  const { resume, setError } = useAppStore();
  const [insights, setInsights] = useState<CareerInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('');

  const handleGenerate = async () => {
    if (!resume) {
      setError('Please upload a resume first');
      return;
    }

    if (!targetRole) {
      setError('Please select a target role');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/career-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          targetRole: ROLE_OPTIONS.find((r) => r.value === targetRole)?.label || targetRole,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate career insights');
      }

      setInsights(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate career insights');
    } finally {
      setIsLoading(false);
    }
  };

  if (!insights) {
    return (
      <Card className="py-12">
        <div className="max-w-md mx-auto text-center">
          <TrendingUp className="w-16 h-16 text-accent-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Career Insights
          </h3>
          <p className="text-foreground-muted mb-6">
            Get personalized career insights including skill gaps,
            market trends, and growth recommendations.
          </p>

          <div className="mb-6">
            <Select
              label="Select Target Role"
              options={ROLE_OPTIONS}
              value={targetRole}
              onChange={setTargetRole}
              placeholder="Choose a role..."
            />
          </div>

          <Button
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={!targetRole}
            size="lg"
          >
            Generate Career Insights
          </Button>
        </div>
      </Card>
    );
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'danger';
      case 'recommended':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Market Position */}
      <Card variant="gradient">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Market Demand</h3>
            <p className="text-sm text-foreground-muted mt-1">
              Based on current job market trends
            </p>
          </div>
          <Badge
            variant={
              insights.marketDemand === 'high'
                ? 'success'
                : insights.marketDemand === 'medium'
                ? 'warning'
                : 'danger'
            }
            className="text-lg px-4 py-2"
          >
            {insights.marketDemand.toUpperCase()}
          </Badge>
        </div>
      </Card>

      {/* Skill Gaps */}
      {insights.skillGaps.length > 0 && (
        <Card>
          <CardHeader
            icon={<AlertCircle className="w-5 h-5" />}
            title="Skill Gaps"
            description="Skills to develop for your target role"
          />
          <CardContent>
            <div className="space-y-4">
              {insights.skillGaps.map((gap, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-background-tertiary rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{gap.skill}</span>
                    <Badge variant={getImportanceColor(gap.importance)}>
                      {gap.importance}
                    </Badge>
                  </div>
                  {gap.resources && gap.resources.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-foreground-muted">Resources:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {gap.resources.slice(0, 3).map((resource, j) => (
                          <span
                            key={j}
                            className="text-xs bg-background-secondary px-2 py-1 rounded text-accent-info"
                          >
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Skills */}
      {insights.trendingSkills.length > 0 && (
        <Card>
          <CardHeader
            icon={<TrendingUp className="w-5 h-5" />}
            title="Trending Skills"
            description="In-demand skills for your target role"
          />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.trendingSkills.map((skill, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Badge variant="primary" dot>
                    {skill}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Path */}
      {insights.careerPath.length > 0 && (
        <Card>
          <CardHeader
            icon={<Target className="w-5 h-5" />}
            title="Career Path"
            description="Suggested progression based on your profile"
          />
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {insights.careerPath.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center"
                >
                  <div
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      i === 0
                        ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/30'
                        : 'bg-background-tertiary text-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  {i < insights.careerPath.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-foreground-muted mx-2 flex-shrink-0" />
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <Card>
          <CardHeader
            icon={<Lightbulb className="w-5 h-5" />}
            title="Recommendations"
            description="Action items to advance your career"
          />
          <CardContent>
            <ul className="space-y-3">
              {insights.recommendations.map((rec, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{rec}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Regenerate */}
      <div className="flex items-center justify-between">
        <Select
          options={ROLE_OPTIONS}
          value={targetRole}
          onChange={setTargetRole}
          className="w-64"
        />
        <Button variant="secondary" onClick={handleGenerate} isLoading={isLoading}>
          Regenerate Insights
        </Button>
      </div>
    </motion.div>
  );
}

