import { NextRequest, NextResponse } from 'next/server';
import { generateCareerInsights } from '@/lib/ai';
import type { ParsedResume, CareerInsight } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface CareerInsightsResponse {
  success: boolean;
  data?: CareerInsight;
  error?: string;
  message?: string;
}

/**
 * POST /api/career-insights
 * Generate career insights and recommendations
 */
export async function POST(request: NextRequest): Promise<NextResponse<CareerInsightsResponse>> {
  try {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables. Get a free key at https://aistudio.google.com/apikey' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { resume, targetRole } = body as {
      resume: ParsedResume;
      targetRole: string;
    };

    // Validate inputs
    if (!resume || !resume.rawText) {
      return NextResponse.json(
        { success: false, error: 'Resume data is required.' },
        { status: 400 }
      );
    }

    if (!targetRole || typeof targetRole !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Target role is required.' },
        { status: 400 }
      );
    }

    // Generate career insights
    const insights = await generateCareerInsights(resume, targetRole);

    return NextResponse.json({
      success: true,
      data: insights,
      message: 'Career insights generated successfully',
    });

  } catch (error) {
    console.error('Career insights error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key configuration.' },
          { status: 401 }
        );
      }
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again shortly.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while generating career insights.' },
      { status: 500 }
    );
  }
}

