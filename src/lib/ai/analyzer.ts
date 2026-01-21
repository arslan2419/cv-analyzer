// ============================================================================
// AI Analysis Engine using Groq (Fast LLM Inference)
// ============================================================================

import Groq from 'groq-sdk';
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

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Use Llama 3.3 70B - powerful and fast model available on Groq
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Clean input text by removing null characters and other problematic characters
 */
function cleanInputText(text: string): string {
  return text
    .replace(/\u0000/g, '') // Remove null characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Parse JSON from AI response, handling potential formatting issues
 */
function parseAIResponse<T>(response: string): T {
  // Log response for debugging
  console.log('[Groq] Raw response preview:', response.substring(0, 500));
  
  // Try to extract JSON from markdown code blocks first
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : response;
  
  // If no code block, try to find JSON object
  if (!codeBlockMatch) {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Groq] No JSON found in response:', response);
      throw new Error('No valid JSON found in AI response');
    }
    jsonStr = jsonMatch[0];
  }
  
  // Clean the JSON string
  jsonStr = jsonStr
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
  
  try {
    return JSON.parse(jsonStr) as T;
  } catch (firstError) {
    console.log('[Groq] First parse attempt failed, trying fixes...');
    
    try {
      // Try to fix common JSON issues
      let fixed = jsonStr
        // Fix trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix unescaped newlines in strings (between quotes)
        .replace(/(?<=":[ ]*"[^"]*)\n(?=[^"]*")/g, '\\n')
        // Fix single quotes to double quotes (careful with apostrophes)
        .replace(/(?<=[\[{,]\s*)'([^']+)'(?=\s*:)/g, '"$1"')
        // Remove any BOM
        .replace(/^\uFEFF/, '');
      
      return JSON.parse(fixed) as T;
    } catch (secondError) {
      console.error('[Groq] JSON parse failed. Original:', jsonStr.substring(0, 200));
      throw new Error(`Failed to parse AI response as JSON: ${(firstError as Error).message}`);
    }
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
const MIN_REQUEST_INTERVAL = 500; // Groq is much faster, can handle more requests

/**
 * Generate content using Groq with retry logic and exponential backoff
 */
async function generateContent(prompt: string, retries = 3): Promise<string> {
  // Clean the prompt to remove problematic characters
  const cleanedPrompt = cleanInputText(prompt);
  
  // Ensure minimum interval between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();
  
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[Groq] Attempt ${attempt + 1}/${retries} - Sending request to ${MODEL}...`);
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT + '\n\nIMPORTANT: Always respond with valid JSON only. No markdown, no explanations, just the JSON object.',
          },
          {
            role: 'user',
            content: cleanedPrompt,
          },
        ],
        model: MODEL,
        temperature: 0.3,
        max_tokens: 8192,
        top_p: 0.95,
        response_format: { type: 'json_object' },
      });
      
      const text = chatCompletion.choices[0]?.message?.content;
      
      if (!text) {
        throw new Error('Empty response from Groq');
      }
      
      console.log(`[Groq] Success! Response length: ${text.length} chars`);
      return text;
    } catch (error: unknown) {
      lastError = error as Error;
      
      // Log full error details for debugging
      console.error('[Groq] Error details:', {
        name: lastError?.name,
        message: lastError?.message,
        status: (error as { status?: number })?.status,
        statusText: (error as { statusText?: string })?.statusText,
      });
      
      const errorMessage = lastError?.message?.toLowerCase() || '';
      const errorString = String(error).toLowerCase();
      
      // Check various rate limit indicators
      const isRateLimited = 
        errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('rate') || 
        errorMessage.includes('too many requests') ||
        errorString.includes('429');
      
      if (isRateLimited) {
        // Wait time: 5s, 10s, 20s
        const waitTime = Math.min(5000 * Math.pow(2, attempt), 30000);
        console.log(`[Groq] Rate limited. Waiting ${waitTime / 1000}s before retry...`);
        await delay(waitTime);
        continue;
      }
      
      // For other errors, throw immediately with more context
      const enhancedError = new Error(
        `Groq API Error: ${lastError?.message || 'Unknown error'}. ` +
        `Check console for details. Make sure your GROQ_API_KEY is valid.`
      );
      throw enhancedError;
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
