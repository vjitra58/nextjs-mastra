# Next.js with Mastra Weather Agent

This is a [Next.js](https://nextjs.org) project integrated with [Mastra](https://mastra.ai) framework for AI agents, workflows, and tools.

## Features

- **Weather Agent**: AI-powered weather assistant using Google Gemini Flash model
- **Multiple API Patterns**: Demonstrates various ways to call Mastra agents from Next.js
- **Weather Tool**: Fetches real-time weather data using Open-Meteo API
- **TypeScript**: Full type safety with Zod schemas

## Getting Started

### 1. Environment Setup

Copy the environment variables and add your API keys:

```bash
cp .env.local.example .env.local
```

Add your Google Generative AI API key to `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```

You can get your Google API key from: https://aistudio.google.com/app/apikey

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Routes

The project includes multiple examples of calling Mastra agents from Next.js:

1. **Basic Agent Call** - `/api/weather` (POST)
2. **Agent with Query Parameters** - `/api/weather` (GET) 
3. **Streaming Response** - `/api/weather/stream` (POST)
4. **Structured Output** - `/api/weather/structured` (POST)
5. **Server Actions** - Used in React components

## Architecture

```
src/
├── mastra/
│   ├── agents/
│   │   └── weather-agent.ts    # Gemini Flash weather assistant
│   ├── tools/
│   │   └── weather-tool.ts     # Weather data fetching tool
│   └── workflows/
│       └── weather-workflow.ts # Weather workflow
├── app/
│   ├── api/
│   │   └── weather/            # API route examples
│   └── page.tsx               # Main page with examples
```

## Technologies

- **Next.js 15**: React framework with App Router
- **Mastra**: AI agent framework
- **Google Gemini Flash**: Language model for the weather agent
- **AI SDK v4**: Language model abstraction
- **TypeScript**: Type safety
- **Zod**: Schema validation

## Learn More

- [Mastra Documentation](https://mastra.ai/docs) - Learn about Mastra agents and workflows
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Google AI Studio](https://aistudio.google.com/) - Get your Google API key
