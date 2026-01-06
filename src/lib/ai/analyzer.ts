// ============================================================================
// AI Analysis Engine using Google Gemini (FREE)
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  AnalysisResult,
  ATSAnalysis,
  ImprovementSuggestion,
  InterviewPrep,
  CareerInsight,
  ToneType,
  RoleCategory,
  ParsedResume,
  ParsedJobDescription,
} from '@/types';
import {
  SYSTEM_PROMPT,
  getAnalysisPrompt,
  getATSAnalysisPrompt,
  getImprovementPrompt,
  getInterviewPrepPrompt,
  getCareerInsightsPrompt,
  getResumeExtractionPrompt,
  getJDExtractionPrompt,
} from './prompts';
import { generateId } from '../utils';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use Gemini 1.5 Flash (free tier friendly, fast, and capable)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  systemInstruction: SYSTEM_PROMPT,
});

// Generation config for consistent outputs
const generationConfig = {
  temperature: 0.3,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

/**
 * Parse JSON from AI response, handling potential formatting issues
 */
function parseAIResponse<T>(response: string): T {
  // Try to extract JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in AI response');
  }
  
  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    // Try to fix common JSON issues
    let fixed = jsonMatch[0]
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/'/g, '"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    
    return JSON.parse(fixed) as T;
  }
}

/**
 * Generate content using Gemini with retry logic
 */
async function generateContent(prompt: string, retries = 3): Promise<string> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const response = result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('Empty response from Gemini');
      }
      
      return text;
    } catch (error) {
      lastError = error as Error;
      
      // If rate limited, wait before retrying
      if (lastError.message.includes('429') || lastError.message.includes('quota')) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('Failed to generate content');
}

/**
 * Analyze resume against job description
 */
export async function analyzeResumeVsJD(
  resume: ParsedResume,
  jd: ParsedJobDescription,
  rolePreset?: RoleCategory
): Promise<AnalysisResult> {
  const prompt = getAnalysisPrompt(resume.rawText, jd.rawText, rolePreset);
  
  const content = await generateContent(prompt);
  
  const analysis = parseAIResponse<Omit<AnalysisResult, 'id' | 'resumeId' | 'jdId' | 'atsScore' | 'atsAnalysis' | 'createdAt'>>(content);
  
  // Get ATS analysis separately
  const atsAnalysis = await analyzeATSCompatibility(resume.rawText);
  
  return {
    id: generateId(),
    resumeId: resume.id,
    jdId: jd.id,
    ...analysis,
    atsScore: atsAnalysis.score,
    atsAnalysis,
    createdAt: new Date(),
  };
}

/**
 * Analyze resume for ATS compatibility
 */
export async function analyzeATSCompatibility(resumeText: string): Promise<ATSAnalysis> {
  const prompt = getATSAnalysisPrompt(resumeText);
  
  const content = await generateContent(prompt);
  
  return parseAIResponse<ATSAnalysis>(content);
}

/**
 * Generate improved resume section
 */
export async function improveResumeSection(
  originalText: string,
  section: 'summary' | 'experience' | 'projects' | 'skills',
  tone: ToneType,
  keywords: string[] = [],
  targetRole?: string
): Promise<ImprovementSuggestion> {
  const prompt = getImprovementPrompt(originalText, section, tone, keywords, targetRole);
  
  const content = await generateContent(prompt);
  
  const result = parseAIResponse<{
    improved: string;
    changes: string[];
    addedKeywords: string[];
    improvementScore: number;
  }>(content);
  
  return {
    id: generateId(),
    section,
    original: originalText,
    improved: result.improved,
    changes: result.changes,
    tone,
    addedKeywords: result.addedKeywords,
    improvementScore: result.improvementScore,
  };
}

/**
 * Generate interview preparation questions
 */
export async function generateInterviewPrep(
  resume: ParsedResume,
  jd: ParsedJobDescription,
  analysis: AnalysisResult
): Promise<InterviewPrep> {
  const analysisStr = JSON.stringify({
    overallScore: analysis.overallScore,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    missingSkills: analysis.missingSkills,
  });
  
  const prompt = getInterviewPrepPrompt(resume.rawText, jd.rawText, analysisStr);
  
  const content = await generateContent(prompt);
  
  const result = parseAIResponse<{
    questions: InterviewPrep['questions'];
    weakAreas: { area: string; prepTip: string }[];
    focusSkills: string[];
  }>(content);
  
  return {
    id: generateId(),
    analysisId: analysis.id,
    questions: result.questions,
    weakAreas: result.weakAreas.map((w) => w.area),
    prepTips: result.weakAreas.map((w) => w.prepTip),
    focusSkills: result.focusSkills,
    createdAt: new Date(),
  };
}

/**
 * Generate career insights
 */
export async function generateCareerInsights(
  resume: ParsedResume,
  targetRole: string
): Promise<CareerInsight> {
  const prompt = getCareerInsightsPrompt(resume.rawText, targetRole);
  
  const content = await generateContent(prompt);
  
  const result = parseAIResponse<{
    currentStrengths: string[];
    skillGaps: CareerInsight['skillGaps'];
    careerPath: string[];
    recommendations: { action: string; priority: string; timeframe: string }[];
    trendingSkills: string[];
    marketPosition: { competitiveness: string; analysis: string };
  }>(content);
  
  return {
    marketDemand: result.marketPosition.competitiveness as 'high' | 'medium' | 'low',
    trendingSkills: result.trendingSkills,
    skillGaps: result.skillGaps,
    careerPath: result.careerPath,
    recommendations: result.recommendations.map((r) => r.action),
  };
}

/**
 * AI-assisted resume extraction for complex formats
 */
export async function extractResumeWithAI(resumeText: string): Promise<{
  contact: ParsedResume['contact'];
  summary?: string;
  skills: string[];
  experience: ParsedResume['experience'];
  education: ParsedResume['education'];
  projects: ParsedResume['projects'];
  certifications: ParsedResume['certifications'];
  languages?: string[];
}> {
  const prompt = getResumeExtractionPrompt(resumeText);
  
  const content = await generateContent(prompt);
  
  const result = parseAIResponse<{
    contact: ParsedResume['contact'];
    summary?: string;
    skills: string[];
    experience: Array<{
      company: string;
      position: string;
      location?: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string[];
    }>;
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
      gpa?: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      url?: string;
      github?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
    }>;
    languages?: string[];
  }>(content);
  
  // Add IDs to all items
  return {
    ...result,
    experience: result.experience?.map((exp) => ({ ...exp, id: generateId() })) || [],
    education: result.education?.map((edu) => ({ ...edu, id: generateId() })) || [],
    projects: result.projects?.map((proj) => ({ ...proj, id: generateId() })) || [],
    certifications: result.certifications?.map((cert) => ({ ...cert, id: generateId() })) || [],
  };
}

/**
 * AI-assisted JD extraction for complex formats
 */
export async function extractJDWithAI(jdText: string): Promise<{
  title: string;
  company?: string;
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'remote';
  requiredSkills: ParsedJobDescription['requiredSkills'];
  preferredSkills: ParsedJobDescription['preferredSkills'];
  responsibilities: string[];
  qualifications: string[];
  experience: { min: number; max?: number };
  salary?: { min?: number; max?: number; currency?: string };
  keywords: string[];
}> {
  const prompt = getJDExtractionPrompt(jdText);
  
  const content = await generateContent(prompt);
  
  return parseAIResponse(content);
}
