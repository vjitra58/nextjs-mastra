'use client';

import { useState } from 'react';
import { getWeatherInfo } from './actions/weather';

export default function WeatherDemo() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [streamResponse, setStreamResponse] = useState<string>('');

  // Handle form submission with Server Actions
  const handleServerAction = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await getWeatherInfo(formData);
      if (result.success) {
        setResponse(result.response || '');
      } else {
        setResponse(`Error: ${result.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle API route call
  const handleApiCall = async (city: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });
      const data = await res.json();
      
      if (data.success) {
        setResponse(data.response);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle streaming API call
  const handleStreamCall = async (city: string) => {
    setLoading(true);
    setStreamResponse('');
    
    try {
      const response = await fetch('/api/weather-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                setStreamResponse(prev => prev + data.chunk);
              }
              if (data.done) {
                setLoading(false);
              }
            } catch {
              // Ignore JSON parse errors
            }
          }
        }
      }
    } catch (error) {
      setStreamResponse(`Error: ${error}`);
      setLoading(false);
    }
  };

  // Handle structured output call
  const handleStructuredCall = async (city: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/weather-structured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });
      const data = await res.json();
      
      if (data.success) {
        setResponse(JSON.stringify(data.data, null, 2));
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Mastra Weather Agent Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the power of AI agents with Google Gemini Flash. Try different interaction patterns 
            including server actions, API routes, and real-time streaming.
          </p>
          <div className="flex justify-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Google Gemini Flash
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Mastra Framework
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Next.js Integration
            </span>
          </div>
        </div>
        
        {/* Server Actions Form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              1. Server Actions (Form Submission)
            </h2>
            <p className="text-sm text-gray-600 mt-1">Traditional form submission with server-side processing</p>
          </div>
          <div className="p-6">
            <form action={handleServerAction} className="space-y-4">
              <div className="relative">
                <input
                  name="city"
                  placeholder="Enter city name (e.g., London, New York, Tokyo)"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
                <svg className="absolute right-3 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get Weather (Server Action)
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* API Routes */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              2. API Routes (Client-Side Calls)
            </h2>
            <p className="text-sm text-gray-600 mt-1">Different patterns for calling Mastra agents from client-side code</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative">
              <input
                id="api-city"
                placeholder="Enter city name (e.g., Paris, Berlin, Sydney)"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg className="absolute right-3 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  const city = (document.getElementById('api-city') as HTMLInputElement).value;
                  if (city) handleApiCall(city);
                }}
                disabled={loading}
                className="px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Regular API
              </button>
              <button
                onClick={() => {
                  const city = (document.getElementById('api-city') as HTMLInputElement).value;
                  if (city) handleStreamCall(city);
                }}
                disabled={loading}
                className="px-4 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Streaming API
              </button>
              <button
                onClick={() => {
                  const city = (document.getElementById('api-city') as HTMLInputElement).value;
                  if (city) handleStructuredCall(city);
                }}
                disabled={loading}
                className="px-4 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Structured API
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {(response || streamResponse || loading) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center border-b pb-2">Results</h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Regular Response */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Response
                    </h3>
                    {response && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        ✓ Complete
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  {loading && !response ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Processing your request...</span>
                    </div>
                  ) : response ? (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-80">
                          {response}
                        </pre>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Response received at {new Date().toLocaleTimeString()}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(response)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No response yet...</p>
                      <p className="text-gray-400 text-xs mt-1">Submit a request to see results here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Streaming Response */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Streaming Response
                    </h3>
                    {streamResponse && (
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {loading ? '⚡ Streaming...' : '✓ Complete'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  {loading && !streamResponse ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="ml-3 text-gray-600">Streaming response...</span>
                    </div>
                  ) : streamResponse ? (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-80">
                          {streamResponse}
                        </pre>
                        {loading && (
                          <div className="mt-2 flex items-center text-purple-600">
                            <div className="animate-pulse w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                            <span className="text-xs">Streaming in progress...</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Stream started at {new Date().toLocaleTimeString()}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(streamResponse)}
                          className="text-purple-600 hover:text-purple-800 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No streaming response yet...</p>
                      <p className="text-gray-400 text-xs mt-1">Use the streaming API to see real-time results</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
