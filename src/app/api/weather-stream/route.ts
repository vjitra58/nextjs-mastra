import { NextRequest } from 'next/server';
import { mastra } from '@/mastra';

export async function POST(request: NextRequest) {
  try {
    const { message, city } = await request.json();

    const agent = mastra.getAgent('weatherAgent');

    // Create a streaming response
    const stream = await agent.stream(
      message || `What's the weather like in ${city}?`,
      {
        maxSteps: 3,
      }
    );

    // Create a ReadableStream to send chunks to the client
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.textStream) {
            // Send each chunk as Server-Sent Events format
            const data = `data: ${JSON.stringify({ chunk })}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }
          
          // Send final completion message
          const finalData = `data: ${JSON.stringify({ 
            done: true, 
            usage: stream.usage 
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(finalData));
          
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Streaming weather API error:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
