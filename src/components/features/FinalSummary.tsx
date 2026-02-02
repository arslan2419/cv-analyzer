'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Trophy, Target,
  TrendingUp, AlertTriangle, Sparkles, CheckCircle, Rocket, Wand2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardContent, Button, ScoreCircle, Badge } from '@/components/ui';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
  TabStopPosition,
  BorderStyle,
  LineRuleType,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';

export function FinalSummary() { 
  const { resume, jd, analysis, improvements, resetSession, setStep } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isIntegrating, setIsIntegrating] = useState(false);

  // console.log('FinalSummary Hook Phase Started', {
    hasResume: !!resume,
    hasJD: !!jd,
    hasAnalysis: !!analysis,
    improvementsCount: improvements?.length
  });

  const handleStartOver = () => {
    resetSession();
  };

  const handleBack = () => {
    setStep(3);
  };

  const getImprovedContent = (section: string): string | null => {
    const improvement = improvements.find((imp) => imp.section === section);
    return improvement ? improvement.improved : null;
  };

  const normalizeText = (value?: string | null): string => (value || '').replace(/\s+/g, ' ').trim();

  const FONT = 'Times New Roman';
  const BASE_SIZE = 22; // 11pt
  const SMALL_SIZE = 20; // 10pt
  const NAME_SIZE = 36; // 18pt
  const HEADER_SIZE = 22; // 11pt
  const LINE_SPACING = 240; // single spacing in twips

  const withLineSpacing = (spacing?: Partial<{ before: number; after: number }>) => ({
    line: LINE_SPACING,
    lineRule: LineRuleType.EXACT,
    ...spacing,
  });

  const cleanEmail = (value?: string): string => {
    const text = (value || '').replace(/(https?:\/\/|www\.)/gi, ' ');
    const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (!match) return '';
    let email = match[0];
    email = email.replace(/(https?:\/\/|www\.).*$/i, '');
    email = email.replace(/^(\d{7,})(?=[A-Z])/i, '');
    const tldMatch = email.match(/\.[A-Z]{2,}$/i);
    if (!tldMatch) {
      const fallback = email.match(/\.[A-Z]{2,6}/i);
      if (fallback && fallback.index !== undefined) {
        email = email.slice(0, fallback.index + fallback[0].length);
      }
    }
    return email;
  };

  const extractEmailFromText = (text?: string): string => {
    return cleanEmail(text);
  };

  const extractPhoneFromText = (text?: string): string => {
    const match = (text || '').match(/(\+?\d[\d\s().-]{7,}\d)/);
    return match ? match[0] : '';
  };

  const formatPhone = (phone?: string): string => {
    const raw = normalizeText(phone);
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return raw;
  };

  const isLikelyLocation = (value?: string | null): boolean => {
    const text = normalizeText(value);
    if (!text || text.length > 40) return false;
    if (/[0-9@]/.test(text)) return false;
    if (/https?:\/\/|www\.|mailto:/i.test(text)) return false;
    return /[A-Za-z]/.test(text);
  };

  const extractRawSections = (rawText?: string) => {
    const sections: Record<string, string[]> = {};
    if (!rawText) return sections;
    const lines = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const headingMap: Record<string, string> = {
      'PROFESSIONAL SUMMARY': 'summary',
      SUMMARY: 'summary',
      'WORK EXPERIENCE': 'experience',
      EXPERIENCE: 'experience',
      PROJECTS: 'projects',
      EDUCATION: 'education',
      SKILLS: 'skills',
      CERTIFICATIONS: 'certifications',
      LANGUAGES: 'languages',
      HOBBIES: 'hobbies',
      INTERESTS: 'hobbies',
    };

    let currentKey: string | null = null;
    lines.forEach((line) => {
      const normalized = line.toUpperCase();
      if (headingMap[normalized]) {
        currentKey = headingMap[normalized];
        if (!sections[currentKey]) sections[currentKey] = [];
        return;
      }
      if (currentKey) {
        sections[currentKey].push(line);
      }
    });

    return sections;
  };

  const extractRawSectionsWithOrder = (rawText?: string) => {
    const ordered: Array<{ key: string; title: string; lines: string[] }> = [];
    if (!rawText) return ordered;
    const lines = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const headingMap: Record<string, { key: string; title: string }> = {
      'PROFESSIONAL SUMMARY': { key: 'summary', title: 'PROFESSIONAL SUMMARY' },
      SUMMARY: { key: 'summary', title: 'PROFESSIONAL SUMMARY' },
      'WORK EXPERIENCE': { key: 'experience', title: 'WORK EXPERIENCE' },
      EXPERIENCE: { key: 'experience', title: 'WORK EXPERIENCE' },
      PROJECTS: { key: 'projects', title: 'PROJECTS' },
      EDUCATION: { key: 'education', title: 'EDUCATION' },
      SKILLS: { key: 'skills', title: 'SKILLS' },
      CERTIFICATIONS: { key: 'certifications', title: 'CERTIFICATIONS' },
      LANGUAGES: { key: 'languages', title: 'LANGUAGES' },
      HOBBIES: { key: 'hobbies', title: 'HOBBIES' },
      INTERESTS: { key: 'hobbies', title: 'HOBBIES' },
    };

    let current: { key: string; title: string; lines: string[] } | null = null;
    lines.forEach((line) => {
      const normalized = line.toUpperCase();
      if (headingMap[normalized]) {
        if (current) ordered.push(current);
        const heading = headingMap[normalized];
        current = { key: heading.key, title: heading.title, lines: [] };
        return;
      }
      if (current) {
        current.lines.push(line);
      }
    });
    if (current) ordered.push(current);

    return ordered;
  };

  const createSectionHeader = (title: string): Paragraph[] => {
    return [
      new Paragraph({
        children: [],
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
        spacing: withLineSpacing({ before: 240, after: 0 }),
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: HEADER_SIZE,
            font: FONT,
          }),
        ],
        alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
        spacing: withLineSpacing({ before: 40, after: 80 }),
      }),
    ];
  };

  // Create job entry with title left, dates right (matching template)
  const createJobHeader = (title: string, dates: string): Paragraph => {
    return new Paragraph({
      children: [
        new TextRun({ text: title, bold: true, size: BASE_SIZE, font: FONT }),
        new TextRun({ text: '\t', size: BASE_SIZE }),
        new TextRun({ text: dates, size: BASE_SIZE, font: FONT }),
      ],
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      spacing: withLineSpacing({ before: 160, after: 20 }),
    });
  };

  // Create company line with company left, location right (italic)
  const createCompanyLine = (company: string, location?: string): Paragraph => {
    return new Paragraph({
      children: [
        new TextRun({ text: company, italics: true, size: BASE_SIZE, font: FONT }),
        new TextRun({ text: '\t', size: BASE_SIZE }),
        new TextRun({ text: location || '', size: BASE_SIZE, font: FONT }),
      ],
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      spacing: withLineSpacing({ after: 40 }),
    });
  };

  // Create bullet point (matching template style)
  const createBullet = (text: string): Paragraph => {
    return new Paragraph({
      children: [
        new TextRun({ text: `• ${text}`, size: BASE_SIZE, font: FONT }),
      ],
      spacing: withLineSpacing({ after: 30 }),
      indent: { left: convertInchesToTwip(0.2), hanging: convertInchesToTwip(0.12) },
    });
  };

  const addRawSection = (title: string, lines: string[], children: Paragraph[]) => {
    if (!lines || lines.length === 0) return;
    children.push(...createSectionHeader(title));
    lines.forEach((line) => {
      const cleaned = line.replace(/^[-•]\s*/, '').trim();
      if (line.startsWith('•') || line.startsWith('-')) {
        children.push(createBullet(cleaned));
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: cleaned, size: BASE_SIZE, font: FONT })],
            spacing: withLineSpacing({ after: 40 }),
          })
        );
      }
    });
  };

  const addTextBlockSection = (title: string, content: string, children: Paragraph[]) => {
    if (!content) return;
    children.push(...createSectionHeader(title));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: content, size: BASE_SIZE, font: FONT })],
        spacing: withLineSpacing({ after: 100 }),
      })
    );
  };

  const addSummarySection = (title: string, content: string | undefined, children: Paragraph[]) => {
    if (!content) return false;
    addTextBlockSection(title, content, children);
    return true;
  };

  const addExperienceSection = (children: Paragraph[]) => {
    if (!resume?.experience || resume.experience.length === 0) return false;
    children.push(...createSectionHeader('EXPERIENCE'));
    resume.experience.forEach((exp) => {
      const improved = getImprovedContent('experience');
      // If there's an improved version, we might want to use it, but structure it properly.
      // For now, let's use the structured data and only replace the description if improved summary exists
      // BUT the user said "replace section content that ai gives us in return of improvements".
      // If the AI improved the whole experience section, we might need to handle it.
      
      const dateStr = `${exp.startDate} - ${exp.endDate}`;
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: BASE_SIZE, font: FONT }),
            new TextRun({ text: '\t', size: BASE_SIZE }),
            new TextRun({ text: dateStr, size: BASE_SIZE, font: FONT }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: withLineSpacing({ before: 180, after: 20 }),
        })
      );
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.company, italics: true, size: BASE_SIZE, font: FONT }),
            new TextRun({ text: '\t', size: BASE_SIZE }),
            new TextRun({ text: exp.location || '', size: BASE_SIZE, font: FONT }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: withLineSpacing({ after: 60 }),
        })
      );

      if (exp.description && exp.description.length > 0) {
        exp.description.forEach((desc) => {
          children.push(createBullet(desc));
        });
      }
    });
    return true;
  };

  const addProjectsSection = (children: Paragraph[]) => {
    if (!resume?.projects || resume.projects.length === 0) return false;
    children.push(...createSectionHeader('PROJECTS'));
    resume.projects.forEach((proj) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name, bold: true, size: BASE_SIZE, font: FONT }),
            new TextRun({ text: '\t', size: BASE_SIZE }),
            new TextRun({ text: proj.url || '', size: BASE_SIZE, font: FONT }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: withLineSpacing({ before: 180, after: 40 }),
        })
      );

      if (proj.technologies && proj.technologies.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: `Skills used: ${proj.technologies.join(' | ')}`, 
                size: BASE_SIZE, 
                font: FONT 
              }),
            ],
            spacing: withLineSpacing({ after: 40 }),
          })
        );
      }

      if (proj.description) {
        const lines = proj.description.split('\n').filter(Boolean);
        lines.forEach(line => {
          children.push(createBullet(line.replace(/^[-•]\s*/, '')));
        });
      }
    });
    return true;
  };

  const addSkillsSection = (title: string, children: Paragraph[]) => {
    if (!resume?.skills || resume.skills.length === 0) return false;
    addTextBlockSection(title, resume.skills.join(', '), children);
    return true;
  };

  const addEducationSection = (children: Paragraph[]) => {
    if (!resume?.education || resume.education.length === 0) return false;
    children.push(...createSectionHeader('EDUCATION'));
    resume.education.forEach((edu) => {
      const degreeText = edu.field
        ? `${edu.degree.toUpperCase()} IN ${edu.field.toUpperCase()}`
        : edu.degree.toUpperCase();
      const dateStr = `${edu.startDate} – ${edu.endDate}`;
      children.push(createJobHeader(degreeText, dateStr));
      const gpaText = edu.gpa ? ` (GPA: ${edu.gpa})` : '';
      children.push(createCompanyLine(`${edu.institution}${gpaText}`, ''));
    });
    return true;
  };

  const addCertificationsSection = (children: Paragraph[]) => {
    if (!resume?.certifications || resume.certifications.length === 0) return false;
    children.push(...createSectionHeader('CERTIFICATIONS'));
    resume.certifications.forEach((cert) => {
      const issuerText = cert.issuer ? ` — ${cert.issuer}` : '';
      const dateText = cert.date ? ` (${cert.date})` : '';
      children.push(createBullet(`${cert.name}${issuerText}${dateText}`));
    });
    return true;
  };

  const addLanguagesSection = (title: string, children: Paragraph[]) => {
    if (!resume?.languages || resume.languages.length === 0) return false;
    addTextBlockSection(title, resume.languages.join(', '), children);
    return true;
  };

  const addResumeSectionFromDataOrRaw = (
    section: { key: string; title: string; lines: string[] },
    rawSections: Record<string, string[]>,
    children: Paragraph[]
  ) => {
    const improved = getImprovedContent(section.key);
    if (improved) {
      addTextBlockSection(section.title, improved, children);
      return;
    }

    switch (section.key) {
      case 'summary': {
        const summaryContent = normalizeText(resume?.summary) || section.lines.join(' ');
        if (!addSummarySection(section.title, summaryContent, children)) {
          addRawSection(section.title, section.lines, children);
        }
        return;
      }
      case 'experience': {
        if (!addExperienceSection(children)) {
          addRawSection(section.title, section.lines, children);
        }
        return;
      }
      case 'projects': {
        if (!addProjectsSection(children)) {
          addRawSection(section.title, section.lines, children);
        }
        return;
      }
      case 'skills': {
        if (!addSkillsSection(section.title, children)) {
          addRawSection(section.title, section.lines, children);
        }
        return;
      }
      case 'education': {
        if (!addEducationSection(children)) {
          addRawSection(section.title, section.lines, children);
        }
        return;
      }
      case 'certifications': {
        if (!addCertificationsSection(children)) {
          addRawSection(section.title, section.lines, children);
        }
        return;
      }
      case 'languages': {
        if (!addLanguagesSection(section.title, children)) {
          addRawSection(section.title, section.lines, children);
        }
        return;
      }
      default: {
        addRawSection(section.title, section.lines, children);
      }
    }
  };

  // Export analysis report matching the professional aesthetic
  const handleExportReport = async () => {
    if (!analysis || !resume || !jd) return;
    setIsExporting(true);

    try {
      const children: Paragraph[] = [];
      const rawLines = (resume.rawText || '').split('\n').map((line) => line.trim()).filter(Boolean);

      // ===== NAME (LARGE, CENTERED) =====
      const name = resume.contact?.name?.toUpperCase() || rawLines[0]?.toUpperCase() || 'RESUME';
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'ANALYSIS REPORT', bold: true, size: NAME_SIZE, font: FONT }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: withLineSpacing({ after: 120 }),
        })
      );

      // ===== SUBTITLE (CENTERED, BOLD) =====
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `FOR ${name}`, bold: true, size: BASE_SIZE, font: FONT }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: withLineSpacing({ after: 80 }),
        })
      );

      // ===== METADATA (CENTERED) =====
      let jobTitle = jd.title || 'Target Position';
      const metadata = [
        `Position: ${jobTitle}`,
        // `Company: ${jd.company || 'N/A'}`,
        `Date: ${new Date().toLocaleDateString()}`
      ];

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: metadata.join('  •  '), size: BASE_SIZE, font: FONT }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: withLineSpacing({ after: 200 }),
        })
      );

      // ===== SCORES =====
      children.push(...createSectionHeader('MATCH SCORES'));
      const scores = [
        ['Overall Score', analysis.overallScore],
        ['Skills Match', analysis.skillMatchScore],
        ['Experience Match', analysis.experienceScore],
        ['Keyword Match', analysis.keywordScore],
        ['ATS Score', analysis.atsScore],
      ];

      scores.forEach(([label, value]) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${label}: `, bold: true, size: BASE_SIZE, font: FONT }),
              new TextRun({ text: `${value}/100`, size: BASE_SIZE, font: FONT }),
            ],
            spacing: withLineSpacing({ after: 40 }),
          })
        );
      });

      // ===== STRENGTHS & WEAKNESSES =====
      if (analysis.strengths.length > 0) {
        children.push(...createSectionHeader('STRENGTHS'));
        analysis.strengths.forEach((s) => children.push(createBullet(s)));
      }

      if (analysis.weaknesses.length > 0) {
        children.push(...createSectionHeader('AREAS FOR IMPROVEMENT'));
        analysis.weaknesses.forEach((w) => children.push(createBullet(w)));
      }

      // ===== KEYWORDS GAP =====
      if (analysis.missingSkills.length > 0) {
        children.push(...createSectionHeader('KEYWORDS GAP'));
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: analysis.missingSkills.join(' | '), size: BASE_SIZE, font: FONT }),
            ],
            spacing: withLineSpacing({ after: 80 }),
          })
        );
      }

      // ===== AI IMPROVEMENTS PREVIEW =====
      if (improvements.length > 0) {
        children.push(...createSectionHeader('AI IMPROVEMENTS SUMMARY'));
        improvements.forEach((imp) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: imp.section.toUpperCase(), bold: true, size: BASE_SIZE, font: FONT }),
              ],
              spacing: withLineSpacing({ before: 120, after: 40 }),
            })
          );
          children.push(createBullet(imp.improved.split('\n')[0].slice(0, 150) + '...'));
        });
      }

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: FONT,
                size: BASE_SIZE,
              },
            },
          },
        },
        sections: [{
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.75),
                bottom: convertInchesToTwip(0.75),
                left: convertInchesToTwip(0.75),
                right: convertInchesToTwip(0.75),
              },
            },
          },
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `analysis-report-${Date.now()}.docx`);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate ATS-friendly resume matching the Arslan Mukhtar template exactly
  const handleIntegrateFeedback = async () => {
    if (!resume) return;
    setIsIntegrating(true);

    try {
      const children: Paragraph[] = [];
      const rawLines = (resume.rawText || '').split('\n').map((line) => line.trim()).filter(Boolean);
      const rawHeaderText = rawLines.slice(0, 6).join(' ');

      // ===== NAME (LARGE, CENTERED) =====
      const name = resume.contact?.name?.toUpperCase() || rawLines[0]?.toUpperCase() || 'RESUME';
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: name,
              bold: true,
              size: NAME_SIZE,
              font: FONT,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: withLineSpacing({ after: 120 }),
        })
      );

      // ===== HEADLINE (CENTERED, BOLD) =====
      let jobTitleText = '';
      if (jd?.title && jd.title !== 'Position') {
        jobTitleText = jd.title;
      } else if (resume.experience && resume.experience.length > 0) {
        jobTitleText = resume.experience[0].position;
      }
      jobTitleText = normalizeText(jobTitleText);

      if (jobTitleText) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: jobTitleText, bold: true, size: BASE_SIZE, font: FONT }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: withLineSpacing({ after: 80 }),
          })
        );
      }

      // ===== CONTACT INFO (CENTERED) =====
      const email = cleanEmail(resume.contact?.email) || extractEmailFromText(rawHeaderText);
      const phone = formatPhone(resume.contact?.phone) || formatPhone(extractPhoneFromText(rawHeaderText));
      const location = isLikelyLocation(resume.contact?.location) ? normalizeText(resume.contact?.location) : 'Location';
      const linkedin = resume.contact?.linkedin ? resume.contact.linkedin.replace(/^https?:\/\/(www\.)?/, '') : '';
      const github = resume.contact?.github ? resume.contact.github.replace(/^https?:\/\/(www\.)?/, '') : '';

      const contactParts: string[] = [];
      if (phone) contactParts.push(phone);
      if (email) contactParts.push(email);
      if (linkedin) contactParts.push(linkedin);
      if (github) contactParts.push(github);
      if (location) contactParts.push(location);

      if (contactParts.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: contactParts.join(' | '), size: BASE_SIZE, font: FONT }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: withLineSpacing({ after: 200 }),
          })
        );
      }

      // ===== SUMMARY =====
      const summaryImprovement = getImprovedContent('summary');
      const summaryText = summaryImprovement || resume.summary;
      if (summaryText) {
        children.push(...createSectionHeader('PROFESSIONAL SUMMARY'));
        children.push(
          new Paragraph({
            children: [new TextRun({ text: summaryText, size: BASE_SIZE, font: FONT })],
            spacing: withLineSpacing({ after: 120 }),
          })
        );
      }

      // ===== EXPERIENCE =====
      const expImproved = getImprovedContent('experience');
      if (expImproved) {
        children.push(...createSectionHeader('EXPERIENCE'));
        // If AI gives back one big block, we try to preserve bullets
        const lines = expImproved.split('\n').filter(Boolean);
        lines.forEach(line => {
          if (line.match(/^(20\d\d|19\d\d|Present|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
             // Likely a date/header line from AI, we'll just add as is but maybe bold?
             children.push(new Paragraph({
               children: [new TextRun({ text: line, bold: true, size: BASE_SIZE, font: FONT })],
               spacing: withLineSpacing({ before: 120, after: 40 })
             }));
          } else {
             children.push(createBullet(line.replace(/^[-•]\s*/, '')));
          }
        });
      } else {
        addExperienceSection(children);
      }

      // ===== SKILLS =====
      const skillsImprovement = getImprovedContent('skills');
      const skillsText = skillsImprovement || (resume.skills && resume.skills.length > 0 ? resume.skills.join(' ') : '');
      if (skillsText) {
        children.push(...createSectionHeader('SKILLS'));
        children.push(
          new Paragraph({
            children: [new TextRun({ text: skillsText, size: BASE_SIZE, font: FONT })],
            spacing: withLineSpacing({ after: 120 }),
          })
        );
      }

      // ===== PROJECTS =====
      const projImproved = getImprovedContent('projects');
      if (projImproved) {
        children.push(...createSectionHeader('PROJECTS'));
        const lines = projImproved.split('\n').filter(Boolean);
        lines.forEach(line => {
           if (line.toUpperCase() === line && line.length > 3) {
             children.push(new Paragraph({
               children: [new TextRun({ text: line, bold: true, size: BASE_SIZE, font: FONT })],
               spacing: withLineSpacing({ before: 120, after: 40 })
             }));
           } else {
             children.push(createBullet(line.replace(/^[-•]\s*/, '')));
           }
        });
      } else {
        addProjectsSection(children);
      }

      // ===== EDUCATION =====
      addEducationSection(children);

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: FONT,
                size: BASE_SIZE,
              },
            },
          },
        },
        sections: [{
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.5),
                bottom: convertInchesToTwip(0.5),
                left: convertInchesToTwip(0.5),
                right: convertInchesToTwip(0.5),
              },
            },
          },
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `improved-resume-${Date.now()}.docx`);
    } catch (error) {
      console.error('Integration error:', error);
    } finally {
      setIsIntegrating(false);
    }
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
          Your resume has been analyzed. Download your ATS-optimized resume below.
        </p>
      </motion.div>

      {/* Score Summary */}
      <Card>
        <CardHeader
          icon={<Target className="w-5 h-5" />}
          title="Match Summary"
          description={`Targeting: ${jd?.title || 'Position'}`}
        />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <ScoreCircle score={analysis?.overallScore || 0} size="lg" />
              <span className="mt-2 text-sm font-medium text-foreground">Overall</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <div className="text-3xl font-bold gradient-text">{analysis?.skillMatchScore || 0}</div>
              <span className="mt-1 text-xs text-foreground-muted">Skills</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <div className="text-3xl font-bold gradient-text">{analysis?.experienceScore || 0}</div>
              <span className="mt-1 text-xs text-foreground-muted">Experience</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <div className="text-3xl font-bold gradient-text">{analysis?.keywordScore || 0}</div>
              <span className="mt-1 text-xs text-foreground-muted">Keywords</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg">
              <div className="text-3xl font-bold gradient-text">{analysis?.atsScore || 0}</div>
              <span className="mt-1 text-xs text-foreground-muted">ATS</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-success/10 text-accent-success">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {(analysis?.strengths || []).slice(0, 3).map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                <CheckCircle className="w-4 h-4 text-accent-success mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-warning/10 text-accent-warning">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground">To Improve</h3>
          </div>
          <ul className="space-y-2">
            {(analysis?.weaknesses || []).slice(0, 3).map((weakness, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                <AlertTriangle className="w-4 h-4 text-accent-warning mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{weakness}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground">AI Improvements</h3>
          </div>
          {improvements.length > 0 ? (
            <div className="space-y-3">
              <div className="text-3xl font-bold text-accent-primary">{improvements.length}</div>
              <p className="text-sm text-foreground-muted">
                sections improved with{' '}
                <span className="text-accent-success font-semibold">
                  +{Math.round(improvements.reduce((acc, i) => acc + i.improvementScore, 0) / improvements.length)}%
                </span>{' '}
                avg enhancement
              </p>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">
              Go back to add AI-powered enhancements.
            </p>
          )}
        </Card>
      </div>

      {/* Missing Skills */}
      {analysis?.missingSkills && analysis.missingSkills.length > 0 && (
        <Card>
          <CardHeader
            icon={<Target className="w-5 h-5" />}
            title="Keywords Gap"
            description="Add these keywords if you have the experience"
          />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, i) => (
                <Badge key={i} variant="danger" dot>{skill}</Badge>
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
              {/* <Button
                variant="primary"
                onClick={handleIntegrateFeedback}
                isLoading={isIntegrating}
                leftIcon={<Wand2 className="w-4 h-4" />}
              >
                Download {improvements.length > 0 ? 'Improved ' : ''}Resume
              </Button> */}
              <Button
                variant="secondary"
                onClick={handleExportReport}
                isLoading={isExporting}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Analysis Report
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleStartOver} leftIcon={<Rocket className="w-4 h-4" />}>
                New Analysis
              </Button>
            </div>
          </div>
          {improvements.length === 0 && (
            <p className="mt-4 text-sm text-foreground-muted text-center">
              💡 Go back to generate AI improvements for better results
            </p>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader
          icon={<Rocket className="w-5 h-5" />}
          title="Next Steps"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background-tertiary rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">1. Download Resume</h4>
              <p className="text-sm text-foreground-muted">Get your ATS-optimized resume in Word format</p>
            </div>
            <div className="p-4 bg-background-tertiary rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">2. Review & Export as PDF</h4>
              <p className="text-sm text-foreground-muted">Open in Word, review, and save as PDF</p>
            </div>
            <div className="p-4 bg-background-tertiary rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">3. Add Missing Keywords</h4>
              <p className="text-sm text-foreground-muted">Incorporate suggested skills naturally</p>
            </div>
            <div className="p-4 bg-background-tertiary rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">4. Re-analyze</h4>
              <p className="text-sm text-foreground-muted">Upload improved resume to verify 80%+ score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
