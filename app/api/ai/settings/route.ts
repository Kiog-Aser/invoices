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
    const user = await User.findById(session.user.id).select('aiProviderConfigs defaultAIModelId');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return both configs and defaultModelId
    return NextResponse.json({
      configs: user.aiProviderConfigs || [],
      defaultModelId: user.defaultAIModelId || 'default',
    });

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
    const { configs, defaultModelId } = body;

    // Basic validation: Check if configs is an array
    if (!Array.isArray(configs)) {
      return NextResponse.json({ error: 'Invalid input: Expected an array of configurations.' }, { status: 400 });
    }

    // Deeper validation (optional but recommended): Check each config object
    for (const config of configs) {
      if (!config.name || !config.endpoint || !config.models || !config.apiKey) {
        return NextResponse.json({ error: `Invalid configuration object: Missing fields in provider named '${config.name || 'Unnamed'}'.` }, { status: 400 });
      }
    }

    await connectMongo();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { aiProviderConfigs: configs, defaultAIModelId: defaultModelId } },
      { new: true, upsert: false }
    ).select('aiProviderConfigs defaultAIModelId');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      configs: updatedUser.aiProviderConfigs,
      defaultModelId: updatedUser.defaultAIModelId || 'default',
    });

  } catch (error) {
    console.error('[AI_SETTINGS_POST]', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
