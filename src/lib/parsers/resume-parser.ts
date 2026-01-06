import type {
  ParsedResume,
  ContactInfo,
  WorkExperience,
  Education,
  Project,
  Certification,
} from '@/types';
import { generateId } from '../utils';

// ============================================================================
// Resume Text Parser
// Extracts structured data from raw resume text
// ============================================================================

/**
 * Parse raw resume text into structured data
 */
export function parseResumeText(
  rawText: string,
  fileName: string,
  fileType: 'pdf' | 'docx'
): ParsedResume {
  const lines = rawText.split('\n').map((line) => line.trim()).filter(Boolean);
  
  return {
    id: generateId(),
    contact: extractContactInfo(rawText, lines),
    summary: extractSummary(rawText),
    skills: extractSkills(rawText),
    experience: extractExperience(rawText),
    education: extractEducation(rawText),
    projects: extractProjects(rawText),
    certifications: extractCertifications(rawText),
    languages: extractLanguages(rawText),
    rawText,
    uploadedAt: new Date(),
    fileName,
    fileType,
  };
}

/**
 * Extract contact information from resume
 */
function extractContactInfo(rawText: string, lines: string[]): ContactInfo {
  // Email pattern
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/i;
  const email = rawText.match(emailPattern)?.[0] || '';
  
  // Phone pattern (various formats)
  const phonePattern = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phone = rawText.match(phonePattern)?.[0] || '';
  
  // LinkedIn pattern
  const linkedinPattern = /(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9-]+)/i;
  const linkedin = rawText.match(linkedinPattern)?.[1] 
    ? `linkedin.com/in/${rawText.match(linkedinPattern)![1]}`
    : undefined;
  
  // GitHub pattern
  const githubPattern = /(?:github\.com\/|github:\s*)([a-zA-Z0-9-]+)/i;
  const github = rawText.match(githubPattern)?.[1]
    ? `github.com/${rawText.match(githubPattern)![1]}`
    : undefined;
  
  // Portfolio/website pattern
  const websitePattern = /(?:portfolio|website|web):\s*(https?:\/\/[^\s]+)/i;
  const portfolio = rawText.match(websitePattern)?.[1];
  
  // Location pattern
  const locationPattern = /(?:^|\n)([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/m;
  const location = rawText.match(locationPattern)?.[1]?.trim();
  
  // Name - typically first non-empty line or before email
  let name = '';
  for (const line of lines.slice(0, 5)) {
    // Skip lines that look like headers, contact info, or URLs
    if (
      line.length > 2 &&
      line.length < 60 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !line.match(/^\d/) &&
      !line.match(/^(resume|cv|curriculum|objective|summary)/i)
    ) {
      name = line;
      break;
    }
  }
  
  return {
    name,
    email,
    phone,
    location,
    linkedin,
    github,
    portfolio,
  };
}

/**
 * Extract professional summary
 */
function extractSummary(rawText: string): string | undefined {
  const summaryPatterns = [
    /(?:professional\s+)?summary[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|skills|work|employment|projects|$))/i,
    /(?:career\s+)?objective[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|skills|work|employment|projects|$))/i,
    /profile[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|skills|work|employment|projects|$))/i,
    /about\s+me[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|skills|work|employment|projects|$))/i,
  ];
  
  for (const pattern of summaryPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      const summary = match[1].trim();
      // Return only if it's a reasonable summary (not too short or too long)
      if (summary.length >= 50 && summary.length <= 2000) {
        return summary;
      }
    }
  }
  
  return undefined;
}

/**
 * Extract skills from resume
 */
function extractSkills(rawText: string): string[] {
  const skills: Set<string> = new Set();
  
  // Try to find skills section
  const skillsPatterns = [
    /(?:technical\s+)?skills[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|work|employment|projects|certifications|$))/i,
    /technologies[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|work|employment|projects|$))/i,
    /competencies[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|work|employment|projects|$))/i,
    /expertise[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|work|employment|projects|$))/i,
  ];
  
  let skillsSection = '';
  for (const pattern of skillsPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      skillsSection = match[1];
      break;
    }
  }
  
  if (skillsSection) {
    // Parse skills from section - handle comma, pipe, or bullet separated lists
    const skillsList = skillsSection
      .replace(/•|▪|►|○|●|‣|\*/g, ',')
      .replace(/\|/g, ',')
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 50);
    
    skillsList.forEach((skill) => {
      // Clean up skill names
      const cleaned = skill.replace(/^[-–—:\s]+|[-–—:\s]+$/g, '').trim();
      if (cleaned && !cleaned.match(/^(and|or|etc|including)$/i)) {
        skills.add(cleaned);
      }
    });
  }
  
  // Also extract known tech skills mentioned anywhere
  const knownSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C\\+\\+', 'C#', 'Ruby', 'Go', 'Rust',
    'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB',
    'React', 'Vue', 'Angular', 'Next\\.js', 'Nuxt', 'Svelte', 'Node\\.js',
    'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Rails', 'Laravel',
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'K8s',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'GraphQL',
    'REST', 'API', 'Microservices', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'Git', 'Linux', 'Terraform', 'Ansible', 'Prometheus', 'Grafana',
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
    'SQL', 'NoSQL', 'HTML', 'CSS', 'SASS', 'SCSS', 'Tailwind',
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
    'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'Data Analysis', 'Data Science', 'Business Intelligence', 'Tableau', 'Power BI',
  ];
  
  for (const skill of knownSkills) {
    const regex = new RegExp(`\\b${skill}\\b`, 'gi');
    if (rawText.match(regex)) {
      skills.add(skill.replace(/\\\+/g, '+').replace(/\\\./g, '.'));
    }
  }
  
  return Array.from(skills);
}

/**
 * Extract work experience
 */
function extractExperience(rawText: string): WorkExperience[] {
  const experiences: WorkExperience[] = [];
  
  // Find experience section
  const expPatterns = [
    /(?:work\s+)?experience[:\s]*\n([\s\S]*?)(?=\n\s*(?:education|skills|projects|certifications|$))/i,
    /employment\s*(?:history)?[:\s]*\n([\s\S]*?)(?=\n\s*(?:education|skills|projects|certifications|$))/i,
    /professional\s+background[:\s]*\n([\s\S]*?)(?=\n\s*(?:education|skills|projects|certifications|$))/i,
  ];
  
  let expSection = '';
  for (const pattern of expPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      expSection = match[1];
      break;
    }
  }
  
  if (!expSection) return experiences;
  
  // Split by job entries - look for date patterns or company names
  const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}\s*[-–—to]+\s*Present/gi;
  
  const entries = expSection.split(/\n(?=[A-Z][^a-z]*\n|.*\d{4})/);
  
  for (const entry of entries) {
    if (entry.trim().length < 20) continue;
    
    const lines = entry.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;
    
    // Extract dates
    const dateMatch = entry.match(datePattern);
    let startDate = '';
    let endDate = '';
    let current = false;
    
    if (dateMatch) {
      const dateStr = dateMatch[0];
      const parts = dateStr.split(/[-–—]|to/i).map((p) => p.trim());
      startDate = parts[0] || '';
      endDate = parts[1] || '';
      current = endDate.toLowerCase().includes('present');
    }
    
    // Extract company and position (usually first two lines or combined)
    let company = '';
    let position = '';
    
    // Try to identify company vs position
    for (const line of lines.slice(0, 3)) {
      const cleanLine = line.replace(datePattern, '').trim();
      if (!cleanLine) continue;
      
      // Position usually contains words like Engineer, Developer, Manager, etc.
      if (cleanLine.match(/engineer|developer|manager|analyst|designer|architect|lead|director|consultant|specialist|coordinator|administrator/i)) {
        position = position || cleanLine;
      } else if (!company && cleanLine.length > 2) {
        company = cleanLine;
      }
    }
    
    // If we still don't have position, use the second line
    if (!position && lines[1]) {
      position = lines[1].replace(datePattern, '').trim();
    }
    
    // Extract description bullets
    const description: string[] = [];
    for (const line of lines.slice(2)) {
      const cleanLine = line
        .replace(/^[•▪►○●‣\-*]\s*/, '')
        .replace(datePattern, '')
        .trim();
      if (cleanLine.length > 10) {
        description.push(cleanLine);
      }
    }
    
    if (company || position) {
      experiences.push({
        id: generateId(),
        company,
        position,
        startDate,
        endDate,
        current,
        description,
      });
    }
  }
  
  return experiences;
}

/**
 * Extract education
 */
function extractEducation(rawText: string): Education[] {
  const education: Education[] = [];
  
  // Find education section
  const eduPattern = /education[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|skills|projects|certifications|work|$))/i;
  const eduMatch = rawText.match(eduPattern);
  
  if (!eduMatch?.[1]) return education;
  
  const eduSection = eduMatch[1];
  const entries = eduSection.split(/\n(?=[A-Z])/);
  
  for (const entry of entries) {
    if (entry.trim().length < 10) continue;
    
    const lines = entry.split('\n').map((l) => l.trim()).filter(Boolean);
    
    // Extract degree
    const degreePattern = /(?:Bachelor|Master|PhD|Ph\.D|Doctor|Associate|MBA|B\.S\.|M\.S\.|B\.A\.|M\.A\.|B\.E\.|M\.E\.)[^,\n]*/i;
    const degreeMatch = entry.match(degreePattern);
    
    // Extract dates
    const datePattern = /\d{4}(?:\s*[-–—]\s*\d{4})?/;
    const dateMatch = entry.match(datePattern);
    
    // Extract GPA
    const gpaPattern = /GPA[:\s]*([0-9.]+)/i;
    const gpaMatch = entry.match(gpaPattern);
    
    const institution = lines[0]?.replace(datePattern, '').trim() || '';
    const degree = degreeMatch?.[0] || lines[1]?.replace(datePattern, '').trim() || '';
    
    if (institution || degree) {
      education.push({
        id: generateId(),
        institution,
        degree,
        field: '', // Often embedded in degree string
        startDate: dateMatch?.[0]?.split(/[-–—]/)[0]?.trim() || '',
        endDate: dateMatch?.[0]?.split(/[-–—]/)[1]?.trim() || dateMatch?.[0] || '',
        gpa: gpaMatch?.[1],
      });
    }
  }
  
  return education;
}

/**
 * Extract projects
 */
function extractProjects(rawText: string): Project[] {
  const projects: Project[] = [];
  
  // Find projects section
  const projPattern = /projects?[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|skills|certifications|work|$))/i;
  const projMatch = rawText.match(projPattern);
  
  if (!projMatch?.[1]) return projects;
  
  const projSection = projMatch[1];
  const entries = projSection.split(/\n(?=[A-Z•▪►○●‣\-*])/);
  
  for (const entry of entries) {
    if (entry.trim().length < 20) continue;
    
    const lines = entry.split('\n').map((l) => l.trim()).filter(Boolean);
    const name = lines[0]?.replace(/^[•▪►○●‣\-*]\s*/, '') || '';
    
    // Extract technologies mentioned
    const techPattern = /(?:technologies?|tech\s*stack|built\s+with|using)[:\s]*([\w\s,]+)/i;
    const techMatch = entry.match(techPattern);
    
    let technologies: string[] = [];
    if (techMatch?.[1]) {
      technologies = techMatch[1].split(/[,|]/).map((t) => t.trim()).filter(Boolean);
    }
    
    // Extract URLs
    const githubPattern = /github\.com\/[\w-]+\/[\w-]+/i;
    const urlPattern = /https?:\/\/[^\s]+/i;
    
    const github = entry.match(githubPattern)?.[0];
    const url = entry.match(urlPattern)?.[0];
    
    // Description is usually the rest
    const description = lines.slice(1)
      .map((l) => l.replace(/^[•▪►○●‣\-*]\s*/, '').trim())
      .filter((l) => l.length > 10)
      .join(' ');
    
    if (name) {
      projects.push({
        id: generateId(),
        name,
        description,
        technologies,
        github,
        url: url !== github ? url : undefined,
      });
    }
  }
  
  return projects;
}

/**
 * Extract certifications
 */
function extractCertifications(rawText: string): Certification[] {
  const certifications: Certification[] = [];
  
  // Find certifications section
  const certPattern = /certifications?[:\s]*\n([\s\S]*?)(?=\n\s*(?:experience|education|skills|projects|work|$))/i;
  const certMatch = rawText.match(certPattern);
  
  if (!certMatch?.[1]) return certifications;
  
  const certSection = certMatch[1];
  const lines = certSection.split('\n').map((l) => l.trim()).filter(Boolean);
  
  for (const line of lines) {
    const cleanLine = line.replace(/^[•▪►○●‣\-*]\s*/, '').trim();
    if (cleanLine.length < 5) continue;
    
    // Extract date
    const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}/i;
    const dateMatch = cleanLine.match(datePattern);
    
    // Extract issuer (often in parentheses or after dash)
    const issuerPattern = /[-–—]\s*([^,\n]+)|by\s+([^,\n]+)|\(([^)]+)\)/i;
    const issuerMatch = cleanLine.match(issuerPattern);
    
    const name = cleanLine
      .replace(datePattern, '')
      .replace(issuerPattern, '')
      .replace(/^[-–—:,\s]+|[-–—:,\s]+$/g, '')
      .trim();
    
    if (name) {
      certifications.push({
        id: generateId(),
        name,
        issuer: (issuerMatch?.[1] || issuerMatch?.[2] || issuerMatch?.[3] || '').trim(),
        date: dateMatch?.[0] || '',
      });
    }
  }
  
  return certifications;
}

/**
 * Extract languages
 */
function extractLanguages(rawText: string): string[] | undefined {
  const langPattern = /languages?[:\s]*\n?([\s\S]*?)(?=\n\s*(?:experience|education|skills|projects|certifications|work|$))/i;
  const langMatch = rawText.match(langPattern);
  
  if (!langMatch?.[1]) return undefined;
  
  const languages = langMatch[1]
    .replace(/•|▪|►|○|●|‣|\*/g, ',')
    .split(/[,\n]/)
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && l.length < 30);
  
  return languages.length > 0 ? languages : undefined;
}

