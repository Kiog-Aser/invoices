import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';

// Define the structure for AI Provider Config expected in the request/response
// Ensure this matches the frontend interface
interface AIProviderConfig {
  id: string;
  name: string;
  endpoint: string;
  models: string;
  apiKey: string;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongo();
    const user = await User.findById(session.user.id).select('aiProviderConfigs');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return empty array if no configs exist yet
    const configs = user.aiProviderConfigs || [];

    return NextResponse.json(configs);

  } catch (error) {
    console.error('[AI_SETTINGS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const configs: AIProviderConfig[] = body;

    // Basic validation: Check if it's an array
    if (!Array.isArray(configs)) {
      return NextResponse.json({ error: 'Invalid input: Expected an array of configurations.' }, { status: 400 });
    }

    // Deeper validation (optional but recommended): Check each config object
    for (const config of configs) {
      if (!config.name || !config.endpoint || !config.models || !config.apiKey) {
        return NextResponse.json({ error: `Invalid configuration object: Missing fields in provider named '${config.name || 'Unnamed'}'.` }, { status: 400 });
      }
      // Add more specific validation if needed (e.g., URL format for endpoint)
    }

    await connectMongo();

    // IMPORTANT: In a real application, API keys should be encrypted before saving.
    // This example stores them directly for simplicity, which is NOT secure.

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { aiProviderConfigs: configs } },
      { new: true, upsert: false } // `new: true` returns the updated document
    ).select('aiProviderConfigs');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser.aiProviderConfigs);

  } catch (error) {
    console.error('[AI_SETTINGS_POST]', error);
    // Handle potential JSON parsing errors
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
