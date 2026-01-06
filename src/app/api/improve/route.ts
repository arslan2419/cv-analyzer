import { NextRequest, NextResponse } from 'next/server';
import { improveResumeSection } from '@/lib/ai';
import type { ImprovementResponse, ToneType } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/improve
 * Generate AI-powered improvements for resume sections
 */
export async function POST(request: NextRequest): Promise<NextResponse<ImprovementResponse>> {
  try {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables. Get a free key at https://aistudio.google.com/apikey' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { sections, tone, keywords, targetRole } = body as {
      sections: Array<{
        section: 'summary' | 'experience' | 'projects' | 'skills';
        text: string;
      }>;
      tone: ToneType;
      keywords?: string[];
      targetRole?: string;
    };

    // Validate inputs
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one section is required for improvement.' },
        { status: 400 }
      );
    }

    if (!tone || !['professional', 'technical', 'leadership', 'confident'].includes(tone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tone. Must be one of: professional, technical, leadership, confident.' },
        { status: 400 }
      );
    }

    // Generate improvements for each section
    const improvements = await Promise.all(
      sections.map(async ({ section, text }) => {
        if (!text || text.trim().length < 10) {
          throw new Error(`Section "${section}" has insufficient content for improvement.`);
        }
        return improveResumeSection(text, section, tone, keywords, targetRole);
      })
    );

    return NextResponse.json({
      success: true,
      data: improvements,
      message: 'Improvements generated successfully',
    });

  } catch (error) {
    console.error('Improvement error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('insufficient content')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
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
      { success: false, error: 'An unexpected error occurred while generating improvements.' },
      { status: 500 }
    );
  }
}

