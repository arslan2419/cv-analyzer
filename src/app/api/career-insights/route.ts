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
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add GROQ_API_KEY to environment variables. Get a free key at https://console.groq.com/keys' },
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
      { success: false, error: 'An unexpected error occurred while generating career insights. Please try again.' },
      { status: 500 }
    );
  }
}

