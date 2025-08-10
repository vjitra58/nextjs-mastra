import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/mastra';

export async function POST(request: NextRequest) {
  try {
    const { message, city } = await request.json();

    // Get the weather agent from Mastra
    const agent = mastra.getAgent('weatherAgent');

    // Generate response using the agent
    const result = await agent.generate(
      message || `What's the weather like in ${city}?`,
      {
        maxSteps: 3, // Allow multiple tool calls if needed
      }
    );

    return NextResponse.json({
      success: true,
      response: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json(
      { success: false, error: 'City parameter is required' },
      { status: 400 }
    );
  }

  try {
    const agent = mastra.getAgent('weatherAgent');
    
    const result = await agent.generate(
      `What's the weather like in ${city}?`,
      {
        maxSteps: 3,
      }
    );

    return NextResponse.json({
      success: true,
      response: result.text,
      city,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
