import { NextRequest, NextResponse } from 'next/server';
import { analyzeResumeVsJD } from '@/lib/ai';
import type { AnalysisResponse, ParsedResume, ParsedJobDescription, RoleCategory } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST /api/analyze
 * Analyze resume against job description using AI
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  try {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables. Get a free key at https://aistudio.google.com/apikey' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { resume, jd, rolePreset } = body as {
      resume: ParsedResume;
      jd: ParsedJobDescription;
      rolePreset?: RoleCategory;
    };

    // Validate inputs
    if (!resume || !resume.rawText) {
      return NextResponse.json(
        { success: false, error: 'Resume data is required.' },
        { status: 400 }
      );
    }

    if (!jd || !jd.rawText) {
      return NextResponse.json(
        { success: false, error: 'Job description data is required.' },
        { status: 400 }
      );
    }

    // Perform analysis
    const analysis = await analyzeResumeVsJD(resume, jd, rolePreset);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: 'Analysis completed successfully',
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Check for specific Gemini errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key. Please check your Gemini API key configuration.' },
          { status: 401 }
        );
      }
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again in a few moments.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}

