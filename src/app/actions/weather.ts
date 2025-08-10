'use server';

import { mastra } from '@/mastra';

export async function getWeatherInfo(formData: FormData) {
  try {
    const city = formData.get('city')?.toString();
    
    if (!city) {
      throw new Error('City is required');
    }

    const agent = mastra.getAgent('weatherAgent');

    const result = await agent.generate(
      `What's the weather like in ${city}?`,
      {
        maxSteps: 3,
      }
    );

    return {
      success: true,
      response: result.text,
      city,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getWeatherWithMessage(message: string) {
  try {
    const agent = mastra.getAgent('weatherAgent');

    const result = await agent.generate(message, {
      maxSteps: 3,
    });

    return {
      success: true,
      response: result.text,
      usage: result.usage,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
