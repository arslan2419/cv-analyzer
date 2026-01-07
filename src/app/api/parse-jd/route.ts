import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { parseJobDescriptionText } from '@/lib/parsers';
import type { ParseJDResponse } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/parse-jd
 * Parse job description from text or PDF file
 */
export async function POST(request: NextRequest): Promise<NextResponse<ParseJDResponse>> {
  try {
    const contentType = request.headers.get('content-type') || '';

    let rawText: string;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const text = formData.get('text') as string | null;

      if (file) {
        // Parse PDF file
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          return NextResponse.json(
            { success: false, error: 'Only PDF files are supported for job description uploads.' },
            { status: 400 }
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: 'File too large. Maximum size is 5MB.' },
            { status: 400 }
          );
        }

        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const pdfData = await pdf(buffer);
          rawText = pdfData.text;
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          return NextResponse.json(
            { success: false, error: 'Failed to parse PDF file.' },
            { status: 400 }
          );
        }
      } else if (text) {
        rawText = text;
      } else {
        return NextResponse.json(
          { success: false, error: 'No file or text provided.' },
          { status: 400 }
        );
      }
    } else {
      // Handle JSON body with text
      const body = await request.json();
      rawText = body.text;

      if (!rawText || typeof rawText !== 'string') {
        return NextResponse.json(
          { success: false, error: 'No job description text provided.' },
          { status: 400 }
        );
      }
    }

    if (rawText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'Job description text is too short.' },
        { status: 400 }
      );
    }

    // Parse the job description using basic parsing
    // AI extraction is skipped to avoid rate limits - the main analysis will use AI
    const parsedJD = parseJobDescriptionText(rawText);

    return NextResponse.json({
      success: true,
      data: parsedJD,
      message: 'Job description parsed successfully',
    });

  } catch (error) {
    console.error('JD parsing error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while parsing the job description.' },
      { status: 500 }
    );
  }
}

