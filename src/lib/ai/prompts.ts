// ============================================================================
// AI Prompts for Resume Analysis
// Carefully crafted to avoid hallucination and preserve user content accuracy
// ============================================================================

import type { ToneType, RoleCategory } from '@/types';

/**
 * System prompt for all resume analysis tasks
 */
export const SYSTEM_PROMPT = `You are an expert resume analyzer and career coach with 15+ years of experience in HR, recruiting, and career development. Your expertise spans multiple industries and job levels.

CRITICAL RULES:
1. NEVER invent or fabricate information that isn't in the resume
2. NEVER add skills, experiences, or achievements not mentioned by the user
3. NEVER hallucinate companies, dates, or metrics
4. Always preserve the factual accuracy of the user's content
5. When improving text, enhance wording while keeping the facts intact
6. If information is missing, acknowledge it - don't fill gaps with assumptions
7. Provide actionable, specific feedback based ONLY on provided content
8. Be encouraging but honest about areas needing improvement

Your responses should be in valid JSON format when requested.`;

/**
 * Prompt for analyzing resume against job description
 */
export function getAnalysisPrompt(
  resumeText: string,
  jdText: string,
  rolePreset?: RoleCategory
): string {
  const roleContext = rolePreset
    ? `\n\nThe candidate is targeting a ${rolePreset.replace(/-/g, ' ')} role. Weight your analysis accordingly.`
    : '';

  return `Analyze this resume against the job description and provide a comprehensive analysis.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}
${roleContext}

Provide your analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "skillMatchScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "keywordScore": <number 0-100>,
  "skillMatches": [
    {
      "skill": "<skill name>",
      "status": "<matched|partial|missing>",
      "resumeContext": "<where it appears in resume, if applicable>",
      "jdContext": "<how JD mentions it>",
      "importance": "<required|preferred|nice-to-have>"
    }
  ],
  "experienceAnalysis": [
    {
      "position": "<job title>",
      "company": "<company name>",
      "relevanceScore": <number 0-100>,
      "matchedKeywords": ["<keyword1>", "<keyword2>"],
      "suggestions": ["<improvement suggestion>"],
      "weakPoints": ["<identified weakness>"]
    }
  ],
  "keywordAnalysis": [
    {
      "keyword": "<keyword>",
      "frequency": {
        "resume": <count in resume>,
        "jd": <count in JD>
      },
      "importance": "<high|medium|low>",
      "suggestions": ["<where to add this keyword>"]
    }
  ],
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "missingSkills": ["<skill1>", "<skill2>"],
  "suggestions": ["<actionable suggestion1>", "<actionable suggestion2>"]
}

IMPORTANT:
- Base scores ONLY on content that exists in the resume
- Every skill match must reference actual content from the resume
- Be specific about where improvements should be made
- Do not suggest adding skills the candidate doesn't have
- Focus on presentation and phrasing improvements`;
}

/**
 * Prompt for ATS compatibility analysis
 */
export function getATSAnalysisPrompt(resumeText: string): string {
  return `Analyze this resume for ATS (Applicant Tracking System) compatibility.

RESUME:
${resumeText}

Analyze for:
1. Format issues (tables, columns, images, unusual characters)
2. Section naming (standard vs non-standard headers)
3. Keyword optimization
4. Structure and organization
5. Readability by automated systems

Provide your analysis in the following JSON format:
{
  "score": <number 0-100>,
  "formatScore": <number 0-100>,
  "keywordScore": <number 0-100>,
  "structureScore": <number 0-100>,
  "readabilityScore": <number 0-100>,
  "issues": [
    {
      "type": "<format|content|structure|keyword>",
      "severity": "<critical|warning|suggestion>",
      "message": "<clear description of the issue>",
      "location": "<where in the resume>",
      "fix": "<specific fix recommendation>"
    }
  ]
}

Scoring guidelines:
- 90-100: Excellent ATS compatibility
- 70-89: Good, minor improvements needed
- 50-69: Fair, several issues to address
- 0-49: Poor, significant formatting/content issues

Be specific about issues and provide actionable fixes.`;
}

/**
 * Prompt for improving resume sections
 */
export function getImprovementPrompt(
  originalText: string,
  section: string,
  tone: ToneType,
  keywords: string[] = [],
  targetRole?: string
): string {
  const toneGuidelines = {
    professional: 'Use polished, business-appropriate language. Focus on achievements and impact.',
    technical: 'Emphasize technical skills, methodologies, and tools. Use industry-specific terminology.',
    leadership: 'Highlight leadership, team management, strategic thinking, and cross-functional collaboration.',
    confident: 'Use strong, assertive language. Lead with achievements and measurable impact.',
  };

  const keywordSection = keywords.length > 0
    ? `\n\nPRIORITY KEYWORDS TO NATURALLY INCORPORATE (only where factually accurate):
${keywords.join(', ')}`
    : '';

  const roleSection = targetRole
    ? `\n\nTARGET ROLE: ${targetRole}`
    : '';

  return `Improve this resume ${section} section while preserving all factual content.

ORIGINAL TEXT:
${originalText}

TONE: ${tone}
${toneGuidelines[tone]}
${keywordSection}
${roleSection}

CRITICAL RULES:
1. PRESERVE all facts, numbers, dates, and achievements exactly
2. NEVER add metrics or achievements that don't exist
3. NEVER claim skills or experiences not mentioned
4. Improve wording, structure, and impact WITHOUT changing facts
5. Use strong action verbs at the start of bullet points
6. Quantify achievements only if numbers are already present
7. Remove weak phrases like "responsible for", "helped with", "assisted in"
8. Make it more concise while maintaining substance

Provide your response in the following JSON format:
{
  "improved": "<the improved text>",
  "changes": [
    "<specific change 1>",
    "<specific change 2>"
  ],
  "addedKeywords": ["<keyword1>", "<keyword2>"],
  "improvementScore": <number showing improvement percentage 0-100>
}

IMPORTANT: The improved text must be a direct enhancement of the original - same facts, better presentation.`;
}

/**
 * Prompt for generating interview questions
 */
export function getInterviewPrepPrompt(
  resumeText: string,
  jdText: string,
  analysisResult: string
): string {
  return `Based on this resume, job description, and analysis, generate likely interview questions.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

ANALYSIS SUMMARY:
${analysisResult}

Generate questions across these categories:
1. Behavioral questions based on resume experiences
2. Technical questions about listed skills
3. Situational questions for job responsibilities
4. Questions about potential weak areas

Provide your response in the following JSON format:
{
  "questions": [
    {
      "question": "<interview question>",
      "type": "<behavioral|technical|situational|role-specific>",
      "difficulty": "<easy|medium|hard>",
      "category": "<skills|experience|culture-fit|problem-solving>",
      "tips": ["<tip1>", "<tip2>"],
      "why": "<brief explanation of why this might be asked>"
    }
  ],
  "weakAreas": [
    {
      "area": "<weak area>",
      "prepTip": "<how to prepare>"
    }
  ],
  "focusSkills": ["<skill to emphasize>", "<skill to emphasize>"]
}

Generate 8-12 diverse questions that the candidate should prepare for.
Focus on their specific background and the job requirements.`;
}

/**
 * Prompt for career insights
 */
export function getCareerInsightsPrompt(
  resumeText: string,
  targetRole: string
): string {
  return `Analyze this resume and provide career insights for transitioning to or advancing in a ${targetRole} role.

RESUME:
${resumeText}

Provide insights in the following JSON format:
{
  "currentStrengths": ["<strength1>", "<strength2>"],
  "skillGaps": [
    {
      "skill": "<skill name>",
      "importance": "<critical|recommended|optional>",
      "reason": "<why this skill matters>"
    }
  ],
  "careerPath": ["<current level>", "<next step>", "<future goal>"],
  "recommendations": [
    {
      "action": "<specific action>",
      "priority": "<high|medium|low>",
      "timeframe": "<immediate|short-term|long-term>"
    }
  ],
  "trendingSkills": ["<trending skill relevant to their field>"],
  "marketPosition": {
    "competitiveness": "<high|medium|low>",
    "analysis": "<brief market analysis>"
  }
}

Base all insights on the actual content of the resume. Don't assume skills or experiences not listed.`;
}

/**
 * Prompt for extracting structured data from resume with AI assistance
 */
export function getResumeExtractionPrompt(resumeText: string): string {
  return `Extract structured information from this resume.

RESUME TEXT:
${resumeText}

Extract and return in this JSON format:
{
  "contact": {
    "name": "<full name>",
    "email": "<email>",
    "phone": "<phone>",
    "location": "<city, state/country>",
    "linkedin": "<linkedin url if present>",
    "github": "<github url if present>",
    "portfolio": "<portfolio url if present>"
  },
  "summary": "<professional summary if present, null if not>",
  "skills": ["<skill1>", "<skill2>"],
  "experience": [
    {
      "company": "<company name>",
      "position": "<job title>",
      "location": "<location if present>",
      "startDate": "<start date>",
      "endDate": "<end date or Present>",
      "current": <true if current job, false otherwise>,
      "description": ["<bullet point 1>", "<bullet point 2>"]
    }
  ],
  "education": [
    {
      "institution": "<school name>",
      "degree": "<degree type>",
      "field": "<field of study>",
      "startDate": "<start date>",
      "endDate": "<end date>",
      "gpa": "<gpa if present, null if not>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "description": "<project description>",
      "technologies": ["<tech1>", "<tech2>"],
      "url": "<project url if present>",
      "github": "<github url if present>"
    }
  ],
  "certifications": [
    {
      "name": "<certification name>",
      "issuer": "<issuing organization>",
      "date": "<date obtained>"
    }
  ],
  "languages": ["<language1>", "<language2>"]
}

IMPORTANT:
- Extract ONLY information that is explicitly stated
- Use null for missing fields
- Preserve original text accurately
- Do not infer or assume information`;
}

/**
 * Prompt for extracting structured data from job description with AI assistance
 */
export function getJDExtractionPrompt(jdText: string): string {
  return `Extract structured information from this job description.

JOB DESCRIPTION:
${jdText}

Extract and return in this JSON format:
{
  "title": "<job title>",
  "company": "<company name if present>",
  "location": "<location>",
  "type": "<full-time|part-time|contract|remote>",
  "requiredSkills": [
    {
      "skill": "<skill name>",
      "level": "required",
      "years": <years required if specified, null otherwise>
    }
  ],
  "preferredSkills": [
    {
      "skill": "<skill name>",
      "level": "preferred"
    }
  ],
  "responsibilities": ["<responsibility 1>", "<responsibility 2>"],
  "qualifications": ["<qualification 1>", "<qualification 2>"],
  "experience": {
    "min": <minimum years>,
    "max": <maximum years if specified, null otherwise>
  },
  "salary": {
    "min": <minimum salary if present, null otherwise>,
    "max": <maximum salary if present, null otherwise>,
    "currency": "<currency code>"
  },
  "keywords": ["<important keyword 1>", "<important keyword 2>"]
}

Focus on extracting:
- Explicit skill requirements (distinguish required vs preferred)
- Years of experience requirements
- Key responsibilities
- Important keywords for ATS matching`;
}

