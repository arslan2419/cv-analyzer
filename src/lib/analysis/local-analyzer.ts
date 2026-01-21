// ============================================================================
// Local Resume Analyzer - No AI Required
// Performs keyword matching, scoring, and ATS analysis algorithmically
// ============================================================================

import type {
  ParsedResume,
  ParsedJobDescription,
  AnalysisResult,
  ATSAnalysis,
} from '@/types';
import { generateId } from '../utils';

// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'our', 'you',
  'your', 'we', 'they', 'their', 'this', 'that', 'these', 'those', 'it',
  'its', 'also', 'such', 'so', 'than', 'too', 'very', 'just', 'about',
  'into', 'over', 'after', 'before', 'between', 'under', 'again', 'then',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'any', 'no', 'not',
  'only', 'own', 'same', 'which', 'who', 'whom', 'what', 'while', 'work',
  'working', 'experience', 'including', 'using', 'etc', 'ability', 'able',
]);

// Common tech keywords to look for
const TECH_KEYWORDS = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go',
  'rust', 'php', 'swift', 'kotlin', 'scala', 'react', 'angular', 'vue',
  'node', 'nodejs', 'express', 'django', 'flask', 'spring', 'rails',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
  'git', 'github', 'gitlab', 'ci/cd', 'devops', 'agile', 'scrum',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
  'graphql', 'rest', 'api', 'microservices', 'serverless', 'cloud',
  'machine learning', 'ml', 'ai', 'data science', 'analytics',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'figma', 'ui/ux',
  'testing', 'jest', 'cypress', 'selenium', 'junit', 'pytest',
  'linux', 'unix', 'bash', 'powershell', 'networking', 'security',
]);

/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text: string): string[] {
  // Normalize text
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\+\#\.\-\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split into words and filter
  const words = normalized.split(' ');
  const keywords: string[] = [];
  const seen = new Set<string>();

  for (const word of words) {
    const cleaned = word.trim();
    
    // Skip short words, stop words, and duplicates
    if (cleaned.length < 2) continue;
    if (STOP_WORDS.has(cleaned)) continue;
    if (seen.has(cleaned)) continue;

    // Prioritize tech keywords and longer meaningful words
    if (TECH_KEYWORDS.has(cleaned) || cleaned.length > 3) {
      keywords.push(cleaned);
      seen.add(cleaned);
    }
  }

  return keywords;
}

/**
 * Extract multi-word phrases (bigrams) that might be skills
 */
function extractPhrases(text: string): string[] {
  const phrases: string[] = [];
  const normalized = text.toLowerCase();

  // Common multi-word tech terms
  const multiWordTerms = [
    'machine learning', 'deep learning', 'data science', 'data analysis',
    'project management', 'product management', 'software development',
    'web development', 'mobile development', 'full stack', 'front end',
    'back end', 'cloud computing', 'devops engineer', 'data engineer',
    'quality assurance', 'user experience', 'user interface', 'ci cd',
    'version control', 'agile methodology', 'scrum master', 'team lead',
    'technical lead', 'software engineer', 'senior developer', 'junior developer',
  ];

  for (const term of multiWordTerms) {
    if (normalized.includes(term)) {
      phrases.push(term);
    }
  }

  return phrases;
}

/**
 * Count keyword occurrences in text (case-insensitive)
 */
function countKeyword(text: string, keyword: string): number {
  const normalized = text.toLowerCase();
  const searchTerm = keyword.toLowerCase();
  
  // Use word boundary matching for accuracy
  const regex = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const matches = normalized.match(regex);
  
  return matches ? matches.length : 0;
}

/**
 * Check if a skill exists in resume (with fuzzy matching)
 */
function skillExistsInResume(skill: string, resumeText: string, resumeSkills: string[]): boolean {
  const normalizedSkill = skill.toLowerCase().trim();
  const normalizedResume = resumeText.toLowerCase();

  // Direct match in text
  if (normalizedResume.includes(normalizedSkill)) {
    return true;
  }

  // Check against parsed skills
  for (const rs of resumeSkills) {
    const normalizedRS = rs.toLowerCase();
    if (normalizedRS.includes(normalizedSkill) || normalizedSkill.includes(normalizedRS)) {
      return true;
    }
  }

  // Common variations
  const variations: Record<string, string[]> = {
    'javascript': ['js', 'ecmascript'],
    'typescript': ['ts'],
    'python': ['py'],
    'kubernetes': ['k8s'],
    'postgresql': ['postgres', 'psql'],
    'mongodb': ['mongo'],
    'nodejs': ['node.js', 'node'],
    'reactjs': ['react.js', 'react'],
    'vuejs': ['vue.js', 'vue'],
    'angularjs': ['angular.js', 'angular'],
    'ci/cd': ['cicd', 'ci cd', 'continuous integration'],
  };

  // Check variations
  for (const [key, alts] of Object.entries(variations)) {
    if (normalizedSkill === key || alts.includes(normalizedSkill)) {
      if (normalizedResume.includes(key) || alts.some(alt => normalizedResume.includes(alt))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate experience score based on years
 */
function calculateExperienceScore(resume: ParsedResume, jd: ParsedJobDescription): number {
  // Estimate total years from experience entries
  let totalMonths = 0;
  
  for (const exp of resume.experience) {
    // Try to parse dates
    const startYear = extractYear(exp.startDate);
    const endYear = exp.current ? new Date().getFullYear() : extractYear(exp.endDate);
    
    if (startYear && endYear) {
      totalMonths += (endYear - startYear) * 12;
    } else {
      // Assume average of 2 years per position if dates aren't parseable
      totalMonths += 24;
    }
  }

  const totalYears = Math.round(totalMonths / 12);
  const requiredYears = jd.experience.min || 0;
  const maxYears = jd.experience.max || requiredYears + 5;

  if (requiredYears === 0) {
    return 85; // Entry level, no requirement
  }

  if (totalYears >= requiredYears && totalYears <= maxYears + 2) {
    return 95; // Perfect match
  }

  if (totalYears >= requiredYears * 0.8) {
    return 80; // Close enough
  }

  if (totalYears >= requiredYears * 0.5) {
    return 60; // Somewhat experienced
  }

  return 40; // Under-qualified
}

/**
 * Extract year from date string
 */
function extractYear(dateStr: string): number | null {
  if (!dateStr) return null;
  
  // Handle "Present" or "Current"
  if (dateStr.toLowerCase().includes('present') || dateStr.toLowerCase().includes('current')) {
    return new Date().getFullYear();
  }

  // Try to extract 4-digit year
  const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return parseInt(yearMatch[0], 10);
  }

  return null;
}

/**
 * Analyze ATS compatibility locally
 */
function analyzeATSLocally(resume: ParsedResume): ATSAnalysis {
  const issues: ATSAnalysis['issues'] = [];
  let formatScore = 90;
  let structureScore = 90;
  let readabilityScore = 85;
  let keywordScore = 70;

  // Check contact information
  if (!resume.contact.email) {
    issues.push({
      type: 'content',
      severity: 'critical',
      message: 'Missing email address',
      location: 'Contact section',
      fix: 'Add your professional email address',
    });
    formatScore -= 15;
  }

  if (!resume.contact.phone) {
    issues.push({
      type: 'content',
      severity: 'warning',
      message: 'Missing phone number',
      location: 'Contact section',
      fix: 'Add a phone number for recruiters to contact you',
    });
    formatScore -= 5;
  }

  if (!resume.contact.name) {
    issues.push({
      type: 'content',
      severity: 'critical',
      message: 'Name not detected',
      location: 'Header',
      fix: 'Ensure your full name is clearly visible at the top',
    });
    formatScore -= 10;
  }

  // Check experience section
  if (resume.experience.length === 0) {
    issues.push({
      type: 'structure',
      severity: 'critical',
      message: 'No work experience detected',
      location: 'Experience section',
      fix: 'Add work experience with clear job titles, company names, and dates',
    });
    structureScore -= 25;
  } else {
    // Check experience entries for completeness
    for (const exp of resume.experience) {
      if (!exp.description || exp.description.length === 0) {
        issues.push({
          type: 'content',
          severity: 'warning',
          message: `Missing description for ${exp.position} at ${exp.company}`,
          location: 'Experience section',
          fix: 'Add bullet points describing your responsibilities and achievements',
        });
        structureScore -= 5;
        break; // Only report once
      }
    }
  }

  // Check education
  if (resume.education.length === 0) {
    issues.push({
      type: 'structure',
      severity: 'suggestion',
      message: 'No education information detected',
      location: 'Education section',
      fix: 'Add your educational background if relevant',
    });
  }

  // Check skills section
  if (resume.skills.length === 0) {
    issues.push({
      type: 'content',
      severity: 'warning',
      message: 'No skills section detected',
      location: 'Skills section',
      fix: 'Add a dedicated skills section with relevant technical and soft skills',
    });
    keywordScore -= 20;
  } else if (resume.skills.length < 5) {
    issues.push({
      type: 'content',
      severity: 'suggestion',
      message: 'Limited skills listed',
      location: 'Skills section',
      fix: 'Consider adding more relevant skills to improve keyword matching',
    });
    keywordScore -= 10;
  } else {
    keywordScore = Math.min(90, 60 + resume.skills.length * 3);
  }

  // Check for summary
  if (!resume.summary) {
    issues.push({
      type: 'structure',
      severity: 'suggestion',
      message: 'No professional summary detected',
      location: 'Summary section',
      fix: 'Add a brief professional summary highlighting your key qualifications',
    });
  }

  // Check text length (too short might indicate parsing issues)
  if (resume.rawText.length < 500) {
    issues.push({
      type: 'format',
      severity: 'warning',
      message: 'Resume appears to be very short',
      location: 'Overall document',
      fix: 'Ensure all content was properly extracted. If using images or complex formatting, consider a simpler layout.',
    });
    readabilityScore -= 15;
  }

  // Calculate overall score
  const score = Math.round((formatScore + structureScore + readabilityScore + keywordScore) / 4);

  return {
    score,
    formatScore,
    keywordScore,
    structureScore,
    readabilityScore,
    issues,
  };
}

/**
 * Generate strengths based on analysis
 */
function generateStrengths(
  resume: ParsedResume,
  jd: ParsedJobDescription,
  matchedCount: number,
  totalSkills: number
): string[] {
  const strengths: string[] = [];

  // Skill matching
  if (matchedCount > 0) {
    const matchPercent = Math.round((matchedCount / Math.max(totalSkills, 1)) * 100);
    if (matchPercent >= 70) {
      strengths.push(`Strong skill alignment - ${matchedCount} of ${totalSkills} required skills matched`);
    } else if (matchPercent >= 50) {
      strengths.push(`Good skill coverage - ${matchedCount} matching skills found`);
    }
  }

  // Experience
  if (resume.experience.length >= 3) {
    strengths.push('Extensive work history demonstrates career progression');
  } else if (resume.experience.length >= 1) {
    strengths.push('Relevant work experience documented');
  }

  // Education
  if (resume.education.length > 0) {
    const hasAdvancedDegree = resume.education.some(e => 
      e.degree?.toLowerCase().includes('master') || 
      e.degree?.toLowerCase().includes('phd') ||
      e.degree?.toLowerCase().includes('mba')
    );
    if (hasAdvancedDegree) {
      strengths.push('Advanced degree adds credibility');
    } else {
      strengths.push('Educational background supports qualifications');
    }
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    strengths.push('Project portfolio demonstrates practical application of skills');
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    strengths.push('Professional certifications validate expertise');
  }

  // Contact info
  if (resume.contact.linkedin || resume.contact.github || resume.contact.portfolio) {
    strengths.push('Online presence allows further evaluation of work');
  }

  return strengths.slice(0, 5);
}

/**
 * Generate weaknesses based on analysis
 */
function generateWeaknesses(
  resume: ParsedResume,
  jd: ParsedJobDescription,
  missingSkills: string[]
): string[] {
  const weaknesses: string[] = [];

  // Missing skills
  const requiredMissing = missingSkills.filter(skill => 
    jd.requiredSkills.some(rs => rs.skill.toLowerCase() === skill.toLowerCase())
  );

  if (requiredMissing.length > 2) {
    weaknesses.push(`Missing ${requiredMissing.length} required skills: ${requiredMissing.slice(0, 3).join(', ')}`);
  } else if (requiredMissing.length > 0) {
    weaknesses.push(`Some required skills not found: ${requiredMissing.join(', ')}`);
  }

  // Summary
  if (!resume.summary) {
    weaknesses.push('No professional summary - adding one can help recruiters quickly assess your fit');
  }

  // Skills section
  if (resume.skills.length < 5) {
    weaknesses.push('Skills section could be expanded to improve ATS matching');
  }

  // Experience descriptions
  const hasWeakDescriptions = resume.experience.some(exp => 
    !exp.description || exp.description.length < 2
  );
  if (hasWeakDescriptions) {
    weaknesses.push('Some job descriptions lack detail - add specific achievements and responsibilities');
  }

  // Check for quantifiable achievements
  const hasNumbers = resume.rawText.match(/\d+%|\$\d+|\d+\s*(users|customers|projects|years)/gi);
  if (!hasNumbers || hasNumbers.length < 2) {
    weaknesses.push('Limited quantifiable achievements - add metrics to demonstrate impact');
  }

  return weaknesses.slice(0, 5);
}

/**
 * Generate actionable suggestions
 */
function generateSuggestions(
  missingSkills: string[],
  atsAnalysis: ATSAnalysis,
  keywordGaps: string[]
): string[] {
  const suggestions: string[] = [];

  // Skill suggestions
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 4).join(', ');
    suggestions.push(`Add these skills if you have experience: ${topMissing}`);
  }

  // ATS fixes
  for (const issue of atsAnalysis.issues) {
    if (issue.severity === 'critical' && issue.fix) {
      suggestions.push(issue.fix);
    }
  }

  // Keyword optimization
  if (keywordGaps.length > 0) {
    suggestions.push(`Incorporate these keywords naturally: ${keywordGaps.slice(0, 4).join(', ')}`);
  }

  // General suggestions
  if (!suggestions.some(s => s.toLowerCase().includes('quantif'))) {
    suggestions.push('Add quantifiable achievements (percentages, dollar amounts, team sizes)');
  }

  suggestions.push('Use action verbs at the start of bullet points (Led, Developed, Implemented, etc.)');

  return suggestions.slice(0, 6);
}

/**
 * Main function: Analyze resume against job description locally
 */
export function analyzeResumeLocally(
  resume: ParsedResume,
  jd: ParsedJobDescription
): AnalysisResult {
  const resumeText = resume.rawText;
  const jdText = jd.rawText;

  // Extract keywords from both documents
  const resumeKeywords = new Set([
    ...extractKeywords(resumeText),
    ...extractPhrases(resumeText),
    ...resume.skills.map(s => s.toLowerCase()),
  ]);

  const jdKeywords = new Set([
    ...extractKeywords(jdText),
    ...extractPhrases(jdText),
  ]);

  // Get all skills from JD
  const requiredSkillNames = jd.requiredSkills.map(s => s.skill.toLowerCase());
  const preferredSkillNames = jd.preferredSkills.map(s => s.skill.toLowerCase());
  const allJdSkills = [...new Set([...requiredSkillNames, ...preferredSkillNames])];

  // Analyze skill matches
  const skillMatches = allJdSkills.map(skill => {
    const isMatched = skillExistsInResume(skill, resumeText, resume.skills);
    const isRequired = requiredSkillNames.includes(skill);

    return {
      skill,
      status: isMatched ? 'matched' as const : 'missing' as const,
      resumeContext: isMatched ? 'Found in resume' : '',
      jdContext: isRequired ? 'Required skill' : 'Preferred skill',
      importance: isRequired ? 'required' as const : 'preferred' as const,
    };
  });

  const matchedSkills = skillMatches.filter(s => s.status === 'matched');
  const missingSkills = skillMatches.filter(s => s.status === 'missing').map(s => s.skill);

  // Calculate scores
  const skillMatchScore = allJdSkills.length > 0
    ? Math.round((matchedSkills.length / allJdSkills.length) * 100)
    : 75;

  // Keyword overlap score
  const jdKeywordArray = Array.from(jdKeywords);
  const matchedKeywords = jdKeywordArray.filter(kw => resumeKeywords.has(kw));
  const keywordScore = jdKeywordArray.length > 0
    ? Math.round((matchedKeywords.length / jdKeywordArray.length) * 100)
    : 70;

  // Experience score
  const experienceScore = calculateExperienceScore(resume, jd);

  // Overall score (weighted average)
  const overallScore = Math.round(
    skillMatchScore * 0.4 +
    keywordScore * 0.3 +
    experienceScore * 0.3
  );

  // Keyword analysis for display
  const topJdKeywords = jdKeywordArray.slice(0, 25);
  const keywordAnalysis = topJdKeywords.map(keyword => ({
    keyword,
    frequency: {
      resume: countKeyword(resumeText, keyword),
      jd: countKeyword(jdText, keyword),
    },
    importance: (requiredSkillNames.includes(keyword) ? 'high' : 'medium') as 'high' | 'medium' | 'low',
    suggestions: countKeyword(resumeText, keyword) === 0
      ? [`Consider adding "${keyword}" to your resume if applicable`]
      : [],
  }));

  // Find keyword gaps (in JD but not in resume)
  const keywordGaps = jdKeywordArray
    .filter(kw => !resumeKeywords.has(kw))
    .slice(0, 10);

  // ATS analysis
  const atsAnalysis = analyzeATSLocally(resume);

  // Generate insights
  const strengths = generateStrengths(resume, jd, matchedSkills.length, allJdSkills.length);
  const weaknesses = generateWeaknesses(resume, jd, missingSkills);
  const suggestions = generateSuggestions(missingSkills, atsAnalysis, keywordGaps);

  // Experience analysis
  const experienceAnalysis = resume.experience.slice(0, 5).map(exp => {
    const expText = `${exp.position} ${exp.company} ${exp.description?.join(' ') || ''}`.toLowerCase();
    const expKeywords = jdKeywordArray.filter(kw => expText.includes(kw));
    
    return {
      position: exp.position,
      company: exp.company,
      relevanceScore: expKeywords.length > 3 ? 85 : expKeywords.length > 1 ? 70 : 50,
      matchedKeywords: expKeywords.slice(0, 5),
      suggestions: expKeywords.length < 2 
        ? ['Add more specific details and achievements'] 
        : [],
      weakPoints: exp.description && exp.description.length < 3 
        ? ['Could use more bullet points describing responsibilities']
        : [],
    };
  });

  return {
    id: generateId(),
    resumeId: resume.id,
    jdId: jd.id,
    overallScore,
    skillMatchScore,
    experienceScore,
    keywordScore,
    skillMatches,
    experienceAnalysis,
    keywordAnalysis,
    strengths,
    weaknesses,
    missingSkills,
    suggestions,
    atsScore: atsAnalysis.score,
    atsAnalysis,
    createdAt: new Date(),
  };
}

