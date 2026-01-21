import { NextRequest, NextResponse } from 'next/server';
import { analyzeResumeLocally } from '@/lib/analysis';
import type { AnalysisResponse, ParsedResume, ParsedJobDescription } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30; // Much faster now - no AI call needed

/**
 * POST /api/analyze
 * Analyze resume against job description using LOCAL keyword matching
 * No AI required - instant results with no rate limits!
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  try {
    const body = await request.json();
    const { resume, jd } = body as {
      resume: ParsedResume;
      jd: ParsedJobDescription;
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

    // Perform LOCAL analysis - no AI, no rate limits!
    const analysis = analyzeResumeLocally(resume, jd);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: 'Analysis completed successfully',
    });

  } catch (error) {
    console.error('Analysis error:', error);

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during analysis. Please try again.' },
      { status: 500 }
    );
  }
}
