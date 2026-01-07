import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { parseResumeText } from '@/lib/parsers';
import type { ParseResumeResponse } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/parse-resume
 * Parse uploaded resume file (PDF or DOCX)
 */
export async function POST(request: NextRequest): Promise<NextResponse<ParseResumeResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const fileType = fileName.endsWith('.pdf') ? 'pdf' : 
                     fileName.endsWith('.docx') ? 'docx' : null;

    if (!fileType) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Extract text from file
    let rawText: string;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileType === 'pdf') {
      try {
        const pdfData = await pdf(buffer);
        rawText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json(
          { success: false, error: 'Failed to parse PDF. The file may be corrupted or password-protected.' },
          { status: 400 }
        );
      }
    } else {
      try {
        const docxResult = await mammoth.extractRawText({ buffer });
        rawText = docxResult.value;
      } catch (docxError) {
        console.error('DOCX parsing error:', docxError);
        return NextResponse.json(
          { success: false, error: 'Failed to parse DOCX. The file may be corrupted.' },
          { status: 400 }
        );
      }
    }

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'Could not extract meaningful text from the file. Please ensure the resume is not image-based.' },
        { status: 400 }
      );
    }

    // Parse the resume text using basic parsing
    // AI extraction is skipped to avoid rate limits - the main analysis will use AI
    const parsedResume = parseResumeText(rawText, file.name, fileType);

    return NextResponse.json({
      success: true,
      data: parsedResume,
      message: 'Resume parsed successfully',
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while parsing the resume.' },
      { status: 500 }
    );
  }
}

