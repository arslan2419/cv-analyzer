import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/test-ai
 * Simple test to verify Groq API key is working
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    // Check if API key exists
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GROQ_API_KEY is not set in environment variables',
        step: 'API_KEY_CHECK',
      }, { status: 500 });
    }
    
    console.log('[Test] API Key exists, length:', apiKey.length);
    console.log('[Test] API Key starts with:', apiKey.substring(0, 10) + '...');
    
    // Initialize Groq
    const groq = new Groq({ apiKey });
    
    // Test with llama-3.3-70b-versatile
    const modelName = 'llama-3.3-70b-versatile';
    
    console.log('[Test] Testing model:', modelName);
    
    try {
      // Very simple test prompt
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: 'Say "Hello" in one word.',
          },
        ],
        model: modelName,
        temperature: 0.3,
        max_tokens: 50,
      });
      
      const text = chatCompletion.choices[0]?.message?.content || '';
      
      return NextResponse.json({
        success: true,
        model: modelName,
        response: text,
        message: 'Groq API is working correctly!',
        usage: chatCompletion.usage,
      });
    } catch (modelError: unknown) {
      console.error('[Test] Primary model failed:', modelError);
      
      // Try fallback to llama3-8b-8192
      const fallbackModel = 'llama3-8b-8192';
      
      console.log('[Test] Trying fallback model:', fallbackModel);
      
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: 'Say "Hello" in one word.',
            },
          ],
          model: fallbackModel,
          temperature: 0.3,
          max_tokens: 50,
        });
        
        const text = chatCompletion.choices[0]?.message?.content || '';
        
        return NextResponse.json({
          success: true,
          model: fallbackModel,
          response: text,
          message: 'Groq API working with fallback model',
          note: `Primary model (${modelName}) failed, using ${fallbackModel}`,
          usage: chatCompletion.usage,
        });
      } catch (fallbackError: unknown) {
        // Both models failed
        const primaryErr = modelError as Error;
        const fallbackErr = fallbackError as Error;
        
        return NextResponse.json({
          success: false,
          error: 'Both Groq models failed',
          details: {
            [modelName]: {
              error: primaryErr?.message || String(modelError),
              name: primaryErr?.name,
            },
            [fallbackModel]: {
              error: fallbackErr?.message || String(fallbackError),
              name: fallbackErr?.name,
            },
          },
          suggestions: [
            'Check if your API key is valid at https://console.groq.com/keys',
            'Make sure your Groq account is active',
            'Try creating a new API key',
            'Check Groq API status at https://status.groq.com',
          ],
        }, { status: 500 });
      }
    }
    
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Test] Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      error: err?.message || 'Unknown error',
      errorType: err?.name,
      stack: err?.stack,
    }, { status: 500 });
  }
}
