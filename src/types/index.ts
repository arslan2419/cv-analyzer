// ============================================================================
// Core Types for AI Resume Analyzer
// ============================================================================

// Resume Data Types
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
  achievements?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  achievements?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  highlights?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface ParsedResume {
  id: string;
  contact: ContactInfo;
  summary?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  languages?: string[];
  rawText: string;
  uploadedAt: Date;
  fileName: string;
  fileType: 'pdf' | 'docx';
}

// Job Description Types
export interface JobRequirement {
  skill: string;
  level: 'required' | 'preferred' | 'nice-to-have';
  years?: number;
}

export interface ParsedJobDescription {
  id: string;
  title: string;
  company?: string;
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'remote';
  requiredSkills: JobRequirement[];
  preferredSkills: JobRequirement[];
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
  experience: {
    min: number;
    max?: number;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  rawText: string;
  uploadedAt: Date;
}

// Analysis Types
export interface SkillMatch {
  skill: string;
  status: 'matched' | 'partial' | 'missing';
  resumeContext?: string;
  jdContext?: string;
  importance: 'required' | 'preferred' | 'nice-to-have';
}

export interface ExperienceAnalysis {
  position: string;
  company: string;
  relevanceScore: number;
  matchedKeywords: string[];
  suggestions: string[];
  weakPoints: string[];
}

export interface ATSIssue {
  type: 'format' | 'content' | 'structure' | 'keyword';
  severity: 'critical' | 'warning' | 'suggestion';
  message: string;
  location?: string;
  fix?: string;
}

export interface ATSAnalysis {
  score: number;
  issues: ATSIssue[];
  formatScore: number;
  keywordScore: number;
  structureScore: number;
  readabilityScore: number;
}

export interface KeywordAnalysis {
  keyword: string;
  frequency: {
    resume: number;
    jd: number;
  };
  importance: 'high' | 'medium' | 'low';
  suggestions: string[];
  locations: {
    section: string;
    context: string;
  }[];
}

export interface AnalysisResult {
  id: string;
  resumeId: string;
  jdId: string;
  overallScore: number;
  skillMatchScore: number;
  experienceScore: number;
  keywordScore: number;
  atsScore: number;
  skillMatches: SkillMatch[];
  experienceAnalysis: ExperienceAnalysis[];
  keywordAnalysis: KeywordAnalysis[];
  atsAnalysis: ATSAnalysis;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestions: string[];
  createdAt: Date;
}

// Improvement Types
export type ToneType = 'professional' | 'technical' | 'leadership' | 'confident';

export interface ImprovementRequest {
  section: 'summary' | 'experience' | 'projects' | 'skills';
  originalText: string;
  targetRole?: string;
  tone: ToneType;
  keywords?: string[];
}

export interface ImprovementSuggestion {
  id: string;
  section: string;
  original: string;
  improved: string;
  changes: string[];
  tone: ToneType;
  addedKeywords: string[];
  improvementScore: number;
}

// Version & History Types
export interface ResumeVersion {
  id: string;
  resumeId: string;
  version: number;
  data: ParsedResume;
  analysisId?: string;
  improvements: ImprovementSuggestion[];
  createdAt: Date;
  notes?: string;
}

export interface AnalysisHistory {
  id: string;
  userId?: string;
  resumeVersion: ResumeVersion;
  jd: ParsedJobDescription;
  analysis: AnalysisResult;
  improvements: ImprovementSuggestion[];
  createdAt: Date;
}

// Role Preset Types
export type RoleCategory = 
  | 'frontend-developer'
  | 'backend-developer'
  | 'fullstack-developer'
  | 'data-analyst'
  | 'data-scientist'
  | 'product-manager'
  | 'devops-engineer'
  | 'ui-ux-designer'
  | 'mobile-developer'
  | 'qa-engineer';

export interface RolePreset {
  id: RoleCategory;
  name: string;
  description: string;
  keySkills: string[];
  commonTools: string[];
  scoringWeights: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
  };
  industryKeywords: string[];
}

// Interview Prep Types
export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational' | 'role-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tips?: string[];
  sampleAnswer?: string;
}

export interface InterviewPrep {
  id: string;
  analysisId: string;
  questions: InterviewQuestion[];
  weakAreas: string[];
  prepTips: string[];
  focusSkills: string[];
  createdAt: Date;
}

// Career Insights Types
export interface CareerInsight {
  marketDemand: 'high' | 'medium' | 'low';
  salaryRange?: {
    min: number;
    max: number;
    median: number;
    currency: string;
  };
  trendingSkills: string[];
  skillGaps: {
    skill: string;
    importance: 'critical' | 'recommended' | 'optional';
    resources?: string[];
  }[];
  careerPath: string[];
  recommendations: string[];
}

// UI State Types
export interface UploadState {
  file: File | null;
  status: 'idle' | 'uploading' | 'parsing' | 'success' | 'error';
  progress: number;
  error?: string;
}

export interface AnalysisStep {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface AppState {
  currentStep: number;
  resume: ParsedResume | null;
  jd: ParsedJobDescription | null;
  analysis: AnalysisResult | null;
  improvements: ImprovementSuggestion[];
  selectedRole: RoleCategory | null;
  selectedTone: ToneType;
  isAnalyzing: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ParseResumeResponse extends ApiResponse<ParsedResume> {}
export interface ParseJDResponse extends ApiResponse<ParsedJobDescription> {}
export interface AnalysisResponse extends ApiResponse<AnalysisResult> {}
export interface ImprovementResponse extends ApiResponse<ImprovementSuggestion[]> {}

