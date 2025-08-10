import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/mastra';
import { z } from 'zod';

// Define the structured output schema
const weatherSchema = z.object({
  location: z.string(),
  temperature: z.number(),
  conditions: z.string(),
  summary: z.string().describe('A brief summary of the weather'),
  recommendations: z.array(z.string()).describe('Activity recommendations based on weather'),
});

export async function POST(request: NextRequest) {
  try {
    const { city } = await request.json();

    if (!city) {
      return NextResponse.json(
        { success: false, error: 'City is required' },
        { status: 400 }
      );
    }

    const agent = mastra.getAgent('weatherAgent');

    // Generate structured output
    const result = await agent.generate(
      `Get the weather for ${city} and provide activity recommendations.`,
      {
        output: weatherSchema, // Use structured output
        maxSteps: 3,
      }
    );

    return NextResponse.json({
      success: true,
      data: result.object, // Structured data
    });
  } catch (error) {
    console.error('Structured weather API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
