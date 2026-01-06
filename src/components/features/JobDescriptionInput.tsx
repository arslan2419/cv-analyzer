'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clipboard, Building2, MapPin, DollarSign, Briefcase, Target, Star, ListChecks } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardContent, Button, FileUpload, TextArea, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import type { ParsedJobDescription } from '@/types';

export function JobDescriptionInput() {
  const { jd, setJD, setStep, setError, resume } = useAppStore();
  const [jdText, setJdText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTextSubmit = async () => {
    if (!jdText.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parse-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: jdText }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to parse job description');
      }

      setJD(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse job description');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/parse-jd', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to parse job description');
    }

    setJD(result.data);
  };

  const handleContinue = () => {
    if (jd && resume) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Input Section */}
      <Card variant="glass">
        <CardHeader
          icon={<Clipboard className="w-5 h-5" />}
          title="Add Job Description"
          description="Paste the job description or upload a PDF. We'll extract the key requirements."
        />
        <CardContent>
          <Tabs defaultValue="paste">
            <TabsList className="mb-4">
              <TabsTrigger value="paste" icon={<Clipboard className="w-4 h-4" />}>
                Paste Text
              </TabsTrigger>
              <TabsTrigger value="upload" icon={<FileText className="w-4 h-4" />}>
                Upload PDF
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <TextArea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the complete job description here...

Include:
• Job title and company
• Required skills and qualifications
• Responsibilities
• Experience requirements"
                className="min-h-[200px]"
              />
              <Button
                onClick={handleTextSubmit}
                isLoading={isLoading}
                disabled={!jdText.trim()}
              >
                Analyze Job Description
              </Button>
            </TabsContent>

            <TabsContent value="upload">
              <FileUpload
                accept={{ 'application/pdf': ['.pdf'] }}
                onUpload={handleFileUpload}
                label="Upload job description PDF"
                description="PDF format only, max 5MB"
                maxSize={5 * 1024 * 1024}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Parsed JD Preview */}
      {jd && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader
              icon={<Target className="w-5 h-5" />}
              title="Job Requirements"
              description="Key information extracted from the job description"
            />
            <CardContent>
              <JDPreview jd={jd} />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={handleBack}>
              Back to Resume
            </Button>
            <Button onClick={handleContinue} size="lg">
              Analyze Match
            </Button>
          </div>
        </motion.div>
      )}

      {/* Back button if no JD yet */}
      {!jd && (
        <div className="flex justify-start">
          <Button variant="ghost" onClick={handleBack}>
            Back to Resume
          </Button>
        </div>
      )}
    </motion.div>
  );
}

interface JDPreviewProps {
  jd: ParsedJobDescription;
}

function JDPreview({ jd }: JDPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Job Info */}
      <div className="p-4 bg-background-tertiary rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-3">{jd.title}</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          {jd.company && (
            <div className="flex items-center gap-2 text-foreground-muted">
              <Building2 className="w-4 h-4" />
              <span>{jd.company}</span>
            </div>
          )}
          {jd.location && (
            <div className="flex items-center gap-2 text-foreground-muted">
              <MapPin className="w-4 h-4" />
              <span>{jd.location}</span>
            </div>
          )}
          {jd.type && (
            <div className="flex items-center gap-2 text-foreground-muted">
              <Briefcase className="w-4 h-4" />
              <span className="capitalize">{jd.type.replace('-', ' ')}</span>
            </div>
          )}
          {jd.salary && (jd.salary.min || jd.salary.max) && (
            <div className="flex items-center gap-2 text-foreground-muted">
              <DollarSign className="w-4 h-4" />
              <span>
                {jd.salary.min && `$${(jd.salary.min / 1000).toFixed(0)}K`}
                {jd.salary.min && jd.salary.max && ' - '}
                {jd.salary.max && `$${(jd.salary.max / 1000).toFixed(0)}K`}
              </span>
            </div>
          )}
        </div>
        {jd.experience.min > 0 && (
          <div className="mt-3">
            <Badge variant="info">
              {jd.experience.min}
              {jd.experience.max ? `-${jd.experience.max}` : '+'} years experience
            </Badge>
          </div>
        )}
      </div>

      {/* Required Skills */}
      {jd.requiredSkills.length > 0 && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent-danger/10 text-accent-danger">
              <Target className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-foreground">
              Required Skills ({jd.requiredSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {jd.requiredSkills.map((req, index) => (
              <Badge key={index} variant="danger" dot>
                {req.skill}
                {req.years && ` (${req.years}+ yrs)`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Preferred Skills */}
      {jd.preferredSkills.length > 0 && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent-warning/10 text-accent-warning">
              <Star className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-foreground">
              Preferred Skills ({jd.preferredSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {jd.preferredSkills.map((pref, index) => (
              <Badge key={index} variant="warning" dot>
                {pref.skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {jd.responsibilities.length > 0 && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent-info/10 text-accent-info">
              <ListChecks className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-foreground">
              Responsibilities ({jd.responsibilities.length})
            </h4>
          </div>
          <ul className="space-y-2">
            {jd.responsibilities.slice(0, 5).map((resp, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground-muted">
                <span className="text-accent-info mt-1">•</span>
                <span>{resp}</span>
              </li>
            ))}
            {jd.responsibilities.length > 5 && (
              <li className="text-sm text-accent-primary">
                +{jd.responsibilities.length - 5} more responsibilities
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Keywords */}
      {jd.keywords.length > 0 && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <h4 className="font-semibold text-foreground mb-3">
            Key Terms ({jd.keywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {jd.keywords.slice(0, 15).map((keyword, index) => (
              <Badge key={index} variant="neutral">
                {keyword}
              </Badge>
            ))}
            {jd.keywords.length > 15 && (
              <Badge variant="info">+{jd.keywords.length - 15} more</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

