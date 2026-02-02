'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Edit3, User, Mail, Phone, Briefcase, GraduationCap, Code, Award } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardContent, Button, FileUpload, Badge } from '@/components/ui';
import type { ParsedResume } from '@/types';

export function ResumeUpload() {
  const { resume, setResume, setStep, setError } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpload = async (file: File) => {
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('useAI', 'true');

    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to parse resume');
    }

    setResume(result.data);
  };

  const handleContinue = () => {
    if (resume) {
      setStep(1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Upload Section */}
      <Card variant="glass">
        <CardHeader
          icon={<FileText className="w-5 h-5" />}
          title="Upload Your Resume"
          description="We support PDF and DOCX formats. Your data is processed securely and not stored."
        />
        <CardContent>
          <FileUpload
            onUpload={handleUpload}
            label="Drop your resume here"
            description="PDF or DOCX, max 10MB"
          />
        </CardContent>
      </Card>

      {/* Parsed Resume Preview */}
      {resume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader
              icon={<Edit3 className="w-5 h-5" />}
              title="Resume Preview"
              description="Review the extracted information. You can edit if needed."
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Done' : 'Edit'}
                </Button>
              }
            />
            <CardContent>
              <ResumePreview resume={resume} isEditing={isEditing} />
            </CardContent>
          </Card>

          {/* Continue Button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={handleContinue} size="lg">
              Continue to Job Description
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

interface ResumePreviewProps {
  resume: ParsedResume;
  isEditing: boolean;
}

function ResumePreview({ resume, isEditing }: ResumePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="p-4 bg-background-tertiary rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
            <User className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-foreground">Contact Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-foreground-muted" />
            <span className="text-foreground-muted">Name:</span>
            <span className="text-foreground font-medium">
              {resume.contact.name || 'Not detected'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-foreground-muted" />
            <span className="text-foreground-muted">Email:</span>
            <span className="text-foreground font-medium">
              {resume.contact.email || 'Not detected'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-foreground-muted" />
            <span className="text-foreground-muted">Phone:</span>
            <span className="text-foreground font-medium">
              {resume.contact.phone || 'Not detected'}
            </span>
          </div>
          {/* {resume.contact.location && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-foreground-muted">Location:</span>
              <span className="text-foreground font-medium">
                {resume.contact.location}
              </span>
            </div>
          )} */}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <h4 className="font-semibold text-foreground mb-2">Summary</h4>
          <p className="text-sm text-foreground-muted leading-relaxed">
            {resume.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent-info/10 text-accent-info">
              <Code className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-foreground">
              Skills ({resume.skills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.skills.slice(0, 20).map((skill, index) => (
              <Badge key={index} variant="neutral">
                {skill}
              </Badge>
            ))}
            {resume.skills.length > 20 && (
              <Badge variant="info">+{resume.skills.length - 20} more</Badge>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent-warning/10 text-accent-warning">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-foreground">
              Experience ({resume.experience.length})
            </h4>
          </div>
          <div className="space-y-4">
            {resume.experience.slice(0, 3).map((exp) => (
              <div key={exp.id} className="border-l-2 border-border pl-4">
                <h5 className="font-medium text-foreground">{exp.position}</h5>
                <p className="text-sm text-foreground-muted">
                  {exp.company}
                  {exp.startDate && ` • ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`}
                </p>
                {exp.description.length > 0 && (
                  <ul className="mt-2 text-sm text-foreground-muted list-disc list-inside">
                    {exp.description.slice(0, 2).map((desc, i) => (
                      <li key={i} className="truncate">{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {resume.experience.length > 3 && (
              <p className="text-sm text-accent-primary">
                +{resume.experience.length - 3} more positions
              </p>
            )}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="p-4 bg-background-tertiary rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent-success/10 text-accent-success">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-foreground">
              Education ({resume.education.length})
            </h4>
          </div>
          <div className="space-y-3">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <h5 className="font-medium text-foreground">{edu.degree}</h5>
                <p className="text-sm text-foreground-muted">
                  {edu.institution}
                  {edu.endDate && ` • ${edu.endDate}`}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resume.projects.length > 0 && (
          <div className="p-4 bg-background-tertiary rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent-secondary/10 text-accent-secondary">
                <Code className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-foreground">
                Projects ({resume.projects.length})
              </h4>
            </div>
            <div className="space-y-2">
              {resume.projects.slice(0, 3).map((proj) => (
                <div key={proj.id}>
                  <h5 className="font-medium text-sm text-foreground">{proj.name}</h5>
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.slice(0, 4).map((tech, i) => (
                        <span key={i} className="text-xs text-foreground-muted bg-background-secondary px-2 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.certifications.length > 0 && (
          <div className="p-4 bg-background-tertiary rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-foreground">
                Certifications ({resume.certifications.length})
              </h4>
            </div>
            <div className="space-y-2">
              {resume.certifications.slice(0, 3).map((cert) => (
                <div key={cert.id}>
                  <h5 className="font-medium text-sm text-foreground">{cert.name}</h5>
                  <p className="text-xs text-foreground-muted">
                    {cert.issuer}
                    {cert.date && ` • ${cert.date}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

