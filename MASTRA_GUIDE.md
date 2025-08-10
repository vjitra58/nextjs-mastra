# Calling Mastra Agents from Next.js API Routes

This project demonstrates various ways to call Mastra agents from Next.js when Mastra is integrated into your Next.js application.

## Setup

1. **Install dependencies:**
   ```bash
   npm install @mastra/core @mastra/memory @mastra/libsql @mastra/loggers @ai-sdk/openai zod
   ```

2. **Configure Next.js** - Add to `next.config.ts`:
   ```typescript
   const nextConfig: NextConfig = {
     serverExternalPackages: ["@mastra/*"],
   };
   ```

3. **Set environment variables** - Add to `.env`:
   ```bash
   OPENAI_API_KEY=your-openai-api-key-here
   ```

## Different Ways to Call Agents

### 1. Server Actions (Recommended for Forms)

**File:** `src/app/actions/weather.ts`

```typescript
'use server';

import { mastra } from '@/mastra';

export async function getWeatherInfo(formData: FormData) {
  const city = formData.get('city')?.toString();
  const agent = mastra.getAgent('weatherAgent');
  
  const result = await agent.generate(`What's the weather like in ${city}?`, {
    maxSteps: 3,
  });
  
  return { success: true, response: result.text };
}
```

**Usage in component:**
```jsx
<form action={getWeatherInfo}>
  <input name="city" required />
  <button type="submit">Get Weather</button>
</form>
```

### 2. API Routes (GET/POST)

**File:** `src/app/api/weather/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/mastra';

export async function POST(request: NextRequest) {
  const { city } = await request.json();
  const agent = mastra.getAgent('weatherAgent');
  
  const result = await agent.generate(`What's the weather like in ${city}?`, {
    maxSteps: 3,
  });
  
  return NextResponse.json({
    success: true,
    response: result.text,
    usage: result.usage,
  });
}
```

**Usage from client:**
```javascript
const response = await fetch('/api/weather', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ city: 'London' }),
});
const data = await response.json();
```

### 3. Streaming API Routes

**File:** `src/app/api/weather-stream/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { mastra } from '@/mastra';

export async function POST(request: NextRequest) {
  const { city } = await request.json();
  const agent = mastra.getAgent('weatherAgent');
  
  const stream = await agent.stream(`What's the weather like in ${city}?`, {
    maxSteps: 3,
  });
  
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream.textStream) {
        const data = `data: ${JSON.stringify({ chunk })}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }
      controller.close();
    },
  });
  
  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

### 4. Structured Output API Routes

**File:** `src/app/api/weather-structured/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/mastra';
import { z } from 'zod';

const weatherSchema = z.object({
  location: z.string(),
  temperature: z.number(),
  conditions: z.string(),
  summary: z.string(),
  recommendations: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  const { city } = await request.json();
  const agent = mastra.getAgent('weatherAgent');
  
  const result = await agent.generate(
    `Get weather for ${city} and provide activity recommendations.`,
    {
      output: weatherSchema,
      maxSteps: 3,
    }
  );
  
  return NextResponse.json({
    success: true,
    data: result.object, // Structured data according to schema
  });
}
```

## Key Considerations

### 1. Import Mastra Instance
Always import your configured Mastra instance:
```typescript
import { mastra } from '@/mastra';
```

### 2. Get Agent Reference
```typescript
const agent = mastra.getAgent('weatherAgent');
```

### 3. Use maxSteps for Tool Calls
When your agent uses tools, set `maxSteps` to allow multiple LLM calls:
```typescript
const result = await agent.generate(message, {
  maxSteps: 3, // Allows agent to call tools and respond
});
```

### 4. Error Handling
Always wrap agent calls in try-catch blocks:
```typescript
try {
  const result = await agent.generate(message);
  return { success: true, response: result.text };
} catch (error) {
  return { success: false, error: error.message };
}
```

### 5. Serverless Compatibility
For deployment to Vercel/Netlify, remove `LibSQLStore` usage:
- Remove from `src/mastra/index.ts`
- Remove from agent memory configurations
- Use cloud databases instead for persistent storage

## Running the Demo

1. **Add your OpenAI API key** to `.env`
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Visit** `http://localhost:3000` to see the demo

The demo page shows all four methods working together:
- Server Actions with forms
- Regular API calls
- Streaming responses
- Structured output

## Agent Generation Methods

### `.generate()` - Standard Response
Returns complete response after all tool calls are finished:
```typescript
const result = await agent.generate(message, { maxSteps: 3 });
console.log(result.text); // Complete response
console.log(result.usage); // Token usage
```

### `.stream()` - Streaming Response
Returns a stream for real-time responses:
```typescript
const stream = await agent.stream(message, { maxSteps: 3 });
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk); // Stream each chunk
}
```

### Structured Output
Get typed responses according to a schema:
```typescript
const result = await agent.generate(message, {
  output: zodSchema,
  maxSteps: 3,
});
console.log(result.object); // Typed object matching schema
```

## Best Practices

1. **Use Server Actions** for form submissions and user interactions
2. **Use API Routes** for programmatic access and third-party integrations
3. **Use streaming** for long-running responses to improve UX
4. **Use structured output** when you need consistent, typed responses
5. **Always handle errors** gracefully
6. **Set appropriate maxSteps** based on your tools and use case
7. **Remove LibSQLStore** for serverless deployments
