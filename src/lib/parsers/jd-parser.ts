import type { ParsedJobDescription, JobRequirement } from '@/types';
import { generateId, normalizeSkill, extractKeywords } from '../utils';

// ============================================================================
// Job Description Parser
// Extracts structured data from job description text
// ============================================================================

/**
 * Parse raw job description text into structured data
 */
export function parseJobDescriptionText(rawText: string): ParsedJobDescription {
  return {
    id: generateId(),
    title: extractJobTitle(rawText),
    company: extractCompany(rawText),
    location: extractLocation(rawText),
    type: extractJobType(rawText),
    requiredSkills: extractRequiredSkills(rawText),
    preferredSkills: extractPreferredSkills(rawText),
    responsibilities: extractResponsibilities(rawText),
    qualifications: extractQualifications(rawText),
    keywords: extractKeywords(rawText),
    experience: extractExperienceRequirement(rawText),
    salary: extractSalary(rawText),
    rawText,
    uploadedAt: new Date(),
  };
}

/**
 * Extract job title from JD
 */
function extractJobTitle(rawText: string): string {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  
  // Common title patterns - expanded
  const titlePatterns = [
    /(?:job\s+)?title[:\s]+([^\n]+)/i,
    /(?:position|role)[:\s]+([^\n]+)/i,
    /hiring\s+(?:a\s+)?([^\n]+)/i,
    /looking\s+for\s+(?:a\s+)?([^\n]+)/i,
    /seeking\s+(?:a\s+)?([^\n]+)/i,
    /we\s+are\s+hiring\s+(?:a\s+)?([^\n]+)/i,
    /join\s+(?:us\s+)?as\s+(?:a\s+)?([^\n]+)/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      const title = match[1].trim();
      // Clean up common suffixes
      return title.replace(/\s*[-–—]\s*.*$/, '').trim();
    }
  }
  
  // Job title keywords to look for
  const titleKeywords = /(?:senior\s+|junior\s+|lead\s+|staff\s+|principal\s+)?(?:software\s+|web\s+|frontend\s+|front-end\s+|backend\s+|back-end\s+|full[\s-]?stack\s+|mobile\s+|ios\s+|android\s+|devops\s+|cloud\s+|data\s+|ml\s+|ai\s+)?(?:engineer|developer|architect|manager|analyst|designer|specialist|consultant|coordinator|director|lead|administrator|scientist)/i;
  
  // Check first 5 lines for a job title
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line && line.length < 100 && !line.toLowerCase().includes('about')) {
      const match = line.match(titleKeywords);
      if (match) {
        // Return the whole line if it's short enough and contains a title keyword
        if (line.length < 60) {
          return line;
        }
        // Otherwise return just the matched part
        return match[0];
      }
    }
  }
  
  // Last resort: return first non-empty line if it's short
  const firstLine = lines[0];
  if (firstLine && firstLine.length < 80 && firstLine.length > 5) {
    return firstLine;
  }
  
  return 'Position';
}

/**
 * Extract company name from JD
 */
function extractCompany(rawText: string): string | undefined {
  const companyPatterns = [
    /(?:company|employer|at\s+)[:\s]+([A-Z][^\n,]+)/i,
    /(?:about\s+)([A-Z][A-Za-z\s&]+?)(?:\s+is|\s+are|\s+-)/i,
    /join\s+(?:the\s+)?([A-Z][A-Za-z\s&]+)\s+team/i,
  ];
  
  for (const pattern of companyPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

/**
 * Extract location from JD
 */
function extractLocation(rawText: string): string | undefined {
  const locationPatterns = [
    /(?:location|based\s+in|office)[:\s]+([^\n]+)/i,
    /(?:^|\n)([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/m,
    /(remote|hybrid|on-?site)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

/**
 * Extract job type from JD
 */
function extractJobType(rawText: string): 'full-time' | 'part-time' | 'contract' | 'remote' | undefined {
  const text = rawText.toLowerCase();
  
  if (text.includes('full-time') || text.includes('full time')) return 'full-time';
  if (text.includes('part-time') || text.includes('part time')) return 'part-time';
  if (text.includes('contract') || text.includes('freelance')) return 'contract';
  if (text.includes('remote only') || text.includes('fully remote')) return 'remote';
  
  return undefined;
}

/**
 * Extract required skills from JD
 */
function extractRequiredSkills(rawText: string): JobRequirement[] {
  const skills: JobRequirement[] = [];
  const foundSkills = new Set<string>();
  
  // Find requirements/qualifications section
  const reqPatterns = [
    /(?:required|must\s+have|requirements?|qualifications?)[:\s]*\n([\s\S]*?)(?=\n\s*(?:preferred|nice|bonus|responsibilities|about|benefits|$))/i,
    /what\s+you(?:'ll)?\s+(?:need|bring)[:\s]*\n([\s\S]*?)(?=\n\s*(?:preferred|nice|bonus|what\s+you|responsibilities|about|benefits|$))/i,
  ];
  
  let reqSection = '';
  for (const pattern of reqPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      reqSection = match[1];
      break;
    }
  }
  
  // Extract skills from requirements section
  const skillsList = extractSkillsFromText(reqSection || rawText);
  
  // Known technical skills to look for
  const knownTechSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
    'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Rails',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
    'GraphQL', 'REST', 'API', 'Microservices', 'CI/CD', 'Git', 'Linux', 'Terraform',
    'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science', 'SQL', 'NoSQL',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Figma', 'Agile', 'Scrum',
  ];
  
  // Add skills from explicit mentions
  for (const skill of knownTechSkills) {
    const regex = new RegExp(`\\b${skill.replace(/[+.]/g, '\\$&')}\\b`, 'gi');
    if (rawText.match(regex) && !foundSkills.has(normalizeSkill(skill))) {
      foundSkills.add(normalizeSkill(skill));
      
      // Determine if required or preferred based on context
      const isRequired = isSkillRequired(rawText, skill);
      skills.push({
        skill,
        level: isRequired ? 'required' : 'preferred',
        years: extractYearsForSkill(rawText, skill),
      });
    }
  }
  
  // Add skills from bullet points
  for (const skill of skillsList) {
    if (!foundSkills.has(normalizeSkill(skill))) {
      foundSkills.add(normalizeSkill(skill));
      skills.push({
        skill,
        level: 'required',
      });
    }
  }
  
  return skills;
}

/**
 * Extract preferred skills from JD
 */
function extractPreferredSkills(rawText: string): JobRequirement[] {
  const skills: JobRequirement[] = [];
  
  // Find preferred/nice-to-have section
  const prefPatterns = [
    /(?:preferred|nice\s+to\s+have|bonus|plus|ideal)[:\s]*\n([\s\S]*?)(?=\n\s*(?:responsibilities|about|benefits|what\s+we|$))/i,
    /(?:would\s+be\s+)?(?:a\s+)?plus[:\s]*\n([\s\S]*?)(?=\n\s*(?:responsibilities|about|benefits|$))/i,
  ];
  
  let prefSection = '';
  for (const pattern of prefPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      prefSection = match[1];
      break;
    }
  }
  
  if (!prefSection) return skills;
  
  const skillsList = extractSkillsFromText(prefSection);
  
  for (const skill of skillsList) {
    skills.push({
      skill,
      level: 'preferred',
    });
  }
  
  return skills;
}

/**
 * Extract responsibilities from JD
 */
function extractResponsibilities(rawText: string): string[] {
  const responsibilities: string[] = [];
  
  // Find responsibilities section
  const respPatterns = [
    /(?:responsibilities|what\s+you(?:'ll)?\s+do|duties|your\s+role)[:\s]*\n([\s\S]*?)(?=\n\s*(?:requirements?|qualifications?|skills?|about|benefits|what\s+you(?:'ll)?\s+(?:need|bring)|$))/i,
    /(?:in\s+this\s+role)[,\s]+you(?:'ll)?[:\s]*([\s\S]*?)(?=\n\s*(?:requirements?|qualifications?|skills?|about|benefits|$))/i,
  ];
  
  let respSection = '';
  for (const pattern of respPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      respSection = match[1];
      break;
    }
  }
  
  if (!respSection) return responsibilities;
  
  // Extract bullet points
  const lines = respSection.split('\n');
  for (const line of lines) {
    const cleanLine = line
      .replace(/^[•▪►○●‣\-*]\s*/, '')
      .trim();
    
    if (cleanLine.length > 15 && cleanLine.length < 500) {
      responsibilities.push(cleanLine);
    }
  }
  
  return responsibilities;
}

/**
 * Extract qualifications from JD
 */
function extractQualifications(rawText: string): string[] {
  const qualifications: string[] = [];
  
  // Find qualifications section
  const qualPatterns = [
    /(?:qualifications?|requirements?|must\s+have)[:\s]*\n([\s\S]*?)(?=\n\s*(?:preferred|responsibilities|about|benefits|nice|bonus|$))/i,
    /(?:what\s+you(?:'ll)?\s+need|you\s+should\s+have)[:\s]*\n([\s\S]*?)(?=\n\s*(?:preferred|responsibilities|about|benefits|nice|bonus|$))/i,
  ];
  
  let qualSection = '';
  for (const pattern of qualPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      qualSection = match[1];
      break;
    }
  }
  
  if (!qualSection) return qualifications;
  
  // Extract bullet points
  const lines = qualSection.split('\n');
  for (const line of lines) {
    const cleanLine = line
      .replace(/^[•▪►○●‣\-*]\s*/, '')
      .trim();
    
    if (cleanLine.length > 15 && cleanLine.length < 500) {
      qualifications.push(cleanLine);
    }
  }
  
  return qualifications;
}

/**
 * Extract experience requirement
 */
function extractExperienceRequirement(rawText: string): { min: number; max?: number } {
  // Look for years of experience patterns
  const expPatterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i,
    /(\d+)[-–—to]+(\d+)\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i,
    /(?:minimum|at\s+least)\s*(\d+)\s*(?:years?|yrs?)/i,
  ];
  
  for (const pattern of expPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      const min = parseInt(match[1], 10);
      const max = match[2] ? parseInt(match[2], 10) : undefined;
      return { min, max };
    }
  }
  
  // Default to 0 if not specified
  return { min: 0 };
}

/**
 * Extract salary information
 */
function extractSalary(rawText: string): { min?: number; max?: number; currency?: string } | undefined {
  // Look for salary patterns
  const salaryPatterns = [
    /\$(\d{2,3})[,]?(\d{3})?\s*[-–—to]+\s*\$?(\d{2,3})[,]?(\d{3})?/i,
    /salary[:\s]+\$?(\d+)[kK]?\s*[-–—to]+\s*\$?(\d+)[kK]?/i,
    /compensation[:\s]+\$?(\d+)[kK]?\s*[-–—to]+\s*\$?(\d+)[kK]?/i,
  ];
  
  for (const pattern of salaryPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      let min: number;
      let max: number;
      
      if (match[2]) {
        // Full numbers like $120,000 - $180,000
        min = parseInt(match[1] + (match[2] || ''), 10);
        max = parseInt(match[3] + (match[4] || ''), 10);
      } else {
        // Shortened like $120K - $180K
        min = parseInt(match[1], 10);
        max = parseInt(match[2] || match[3], 10);
        
        // If numbers are small, they're probably in thousands
        if (min < 1000) min *= 1000;
        if (max < 1000) max *= 1000;
      }
      
      return { min, max, currency: 'USD' };
    }
  }
  
  return undefined;
}

// Helper functions

/**
 * Extract skills from text section
 */
function extractSkillsFromText(text: string): string[] {
  const skills: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const cleanLine = line.replace(/^[•▪►○●‣\-*]\s*/, '').trim();
    
    // Look for skill-like patterns
    if (cleanLine.match(/^(?:proficiency|experience|knowledge|familiarity)\s+(?:in|with)/i)) {
      const skill = cleanLine.replace(/^(?:proficiency|experience|knowledge|familiarity)\s+(?:in|with)\s+/i, '').trim();
      if (skill.length > 1 && skill.length < 50) {
        skills.push(skill);
      }
    }
    
    // Look for comma-separated skills
    if (cleanLine.includes(',') && cleanLine.length < 200) {
      const parts = cleanLine.split(',').map((p) => p.trim());
      for (const part of parts) {
        if (part.length > 1 && part.length < 40 && !part.match(/^\d/)) {
          skills.push(part);
        }
      }
    }
  }
  
  return skills;
}

/**
 * Check if a skill is marked as required in the text
 */
function isSkillRequired(text: string, skill: string): boolean {
  const skillRegex = new RegExp(skill.replace(/[+.]/g, '\\$&'), 'gi');
  const match = text.match(new RegExp(`.{0,100}${skillRegex.source}.{0,100}`, 'gi'));
  
  if (!match) return false;
  
  const context = match[0].toLowerCase();
  return (
    context.includes('required') ||
    context.includes('must have') ||
    context.includes('essential') ||
    context.includes('mandatory') ||
    !context.includes('preferred') &&
    !context.includes('nice to have') &&
    !context.includes('bonus')
  );
}

/**
 * Extract years of experience for a specific skill
 */
function extractYearsForSkill(text: string, skill: string): number | undefined {
  const skillRegex = new RegExp(
    `(\\d+)\\+?\\s*(?:years?|yrs?)\\s*(?:of\\s+)?(?:experience\\s+)?(?:with\\s+)?${skill.replace(/[+.]/g, '\\$&')}`,
    'gi'
  );
  const match = text.match(skillRegex);
  
  if (match) {
    const years = match[0].match(/\d+/);
    return years ? parseInt(years[0], 10) : undefined;
  }
  
  return undefined;
}

