import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import OpenAI from 'openai'; // Use OpenAI library for a standard test

// Define the structure for the request body
interface TestConnectionRequest {
  endpoint: string;
  apiKey: string;
  model: string; // Expect a specific model for testing
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: TestConnectionRequest = await req.json();
    const { endpoint, apiKey, model } = body;

    if (!endpoint || !apiKey || !model) {
      return NextResponse.json({ error: 'Missing required fields: endpoint, apiKey, model' }, { status: 400 });
    }

    // Initialize OpenAI client with provided config
    // Note: baseURL might need adjustment depending on the provider's compatibility
    // Some providers might require specific headers not handled by the default OpenAI client.
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: endpoint,
    });

    // Perform a simple test call (e.g., list models or a simple chat completion)
    try {
      // Example: Simple chat completion test
      const completion = await openai.chat.completions.create({
        model: model, // Use the provided model
        messages: [{ role: 'user', content: 'Say hello!' }],
        max_tokens: 10,
        stream: false, // Don't stream for a simple test
      });

      // Check if the response looks okay (this might need adjustment based on provider)
      if (completion.choices && completion.choices.length > 0) {
        return NextResponse.json({ success: true, message: 'Connection successful!', response: completion.choices[0].message?.content || 'No content' });
      } else {
        return NextResponse.json({ success: false, error: 'Invalid response structure from AI provider' }, { status: 400 });
      }

    } catch (apiError: any) {
      console.error('[AI_TEST_CONNECTION_API_ERROR]', apiError);
      // Provide more specific error feedback if possible
      let errorMessage = 'Connection failed.';
      if (apiError.status === 401) {
        errorMessage = 'Authentication failed. Check your API Key.';
      } else if (apiError.status === 404) {
        errorMessage = 'API endpoint or model not found. Check configuration.';
      } else if (apiError.message) {
        errorMessage = `Connection failed: ${apiError.message}`;
      }
      // Always return JSON, never HTML
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }

  } catch (error) {
    console.error('[AI_TEST_CONNECTION_POST]', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
