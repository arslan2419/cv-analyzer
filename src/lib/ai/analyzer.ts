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
 * Delay helper for rate limiting
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Track last request time to prevent rapid calls
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 4000; // Minimum 4 seconds between requests

/**
 * Generate content using Gemini with retry logic and exponential backoff
 */
async function generateContent(prompt: string, retries = 3): Promise<string> {
  // Ensure minimum interval between requests to avoid rate limits
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();
  
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
      const errorMessage = lastError.message?.toLowerCase() || '';
      
      // If rate limited, wait with exponential backoff before retrying
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate') || errorMessage.includes('resource_exhausted')) {
        // Longer wait times: 10s, 20s, 40s
        const waitTime = Math.min(10000 * Math.pow(2, attempt), 60000); // Max 60 seconds
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`);
        await delay(waitTime);
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  throw lastError || new Error('Failed to generate content after retries');
}

/**
 * Analyze resume against job description
 * Combined analysis + ATS check in single API call to avoid rate limits
 */
export async function analyzeResumeVsJD(
  resume: ParsedResume,
  jd: ParsedJobDescription,
  rolePreset?: RoleCategory
): Promise<AnalysisResult> {
  const prompt = getAnalysisPrompt(resume.rawText, jd.rawText, rolePreset);
  
  const content = await generateContent(prompt);
  
  // Parse combined response (includes both analysis and ATS data)
  const analysis = parseAIResponse<{
    overallScore: number;
    skillMatchScore: number;
    experienceScore: number;
    keywordScore: number;
    skillMatches: AnalysisResult['skillMatches'];
    experienceAnalysis: AnalysisResult['experienceAnalysis'];
    keywordAnalysis: AnalysisResult['keywordAnalysis'];
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    suggestions: string[];
    atsAnalysis: ATSAnalysis;
  }>(content);
  
  return {
    id: generateId(),
    resumeId: resume.id,
    jdId: jd.id,
    overallScore: analysis.overallScore,
    skillMatchScore: analysis.skillMatchScore,
    experienceScore: analysis.experienceScore,
    keywordScore: analysis.keywordScore,
    skillMatches: analysis.skillMatches || [],
    experienceAnalysis: analysis.experienceAnalysis || [],
    keywordAnalysis: analysis.keywordAnalysis || [],
    strengths: analysis.strengths || [],
    weaknesses: analysis.weaknesses || [],
    missingSkills: analysis.missingSkills || [],
    suggestions: analysis.suggestions || [],
    atsScore: analysis.atsAnalysis?.score || 75,
    atsAnalysis: analysis.atsAnalysis || {
      score: 75,
      formatScore: 75,
      keywordScore: 75,
      structureScore: 75,
      readabilityScore: 75,
      issues: [],
    },
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
