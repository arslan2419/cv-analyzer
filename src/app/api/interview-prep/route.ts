import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewPrep } from '@/lib/ai';
import type { ParsedResume, ParsedJobDescription, AnalysisResult, InterviewPrep } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 90;

interface InterviewPrepResponse {
  success: boolean;
  data?: InterviewPrep;
  error?: string;
  message?: string;
}

/**
 * POST /api/interview-prep
 * Generate interview preparation questions and tips
 */
export async function POST(request: NextRequest): Promise<NextResponse<InterviewPrepResponse>> {
  try {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables. Get a free key at https://aistudio.google.com/apikey' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { resume, jd, analysis } = body as {
      resume: ParsedResume;
      jd: ParsedJobDescription;
      analysis: AnalysisResult;
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

    if (!analysis || !analysis.id) {
      return NextResponse.json(
        { success: false, error: 'Analysis data is required.' },
        { status: 400 }
      );
    }

    // Generate interview prep
    const interviewPrep = await generateInterviewPrep(resume, jd, analysis);

    return NextResponse.json({
      success: true,
      data: interviewPrep,
      message: 'Interview preparation generated successfully',
    });

  } catch (error) {
    console.error('Interview prep error:', error);
    
    if (error instanceof Error) {
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('api key') || errorMessage.includes('api_key') || errorMessage.includes('invalid')) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key configuration.' },
          { status: 401 }
        );
      }
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate') || errorMessage.includes('resource_exhausted')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. The free tier allows 15 requests per minute. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while generating interview preparation. Please try again.' },
      { status: 500 }
    );
  }
}

