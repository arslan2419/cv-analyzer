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
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('api key') || errorMessage.includes('api_key') || errorMessage.includes('invalid')) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key. Please check your Gemini API key configuration.' },
          { status: 401 }
        );
      }
      
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate') || errorMessage.includes('resource_exhausted')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. The free tier allows 15 requests per minute. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      
      if (errorMessage.includes('json') || errorMessage.includes('parse')) {
        return NextResponse.json(
          { success: false, error: 'Failed to parse AI response. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during analysis. Please try again.' },
      { status: 500 }
    );
  }
}

