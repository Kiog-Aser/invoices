import { OpenAI } from 'openai'; // Import OpenAI type if not already
import { NextResponse } from 'next/server'; // Import NextResponse
import { getServerSession } from 'next-auth/next'; // Import getServerSession
import { authOptions } from '@/libs/next-auth'; // Import authOptions
import connectMongo from '@/libs/mongo'; // Import connectMongo
import User from '@/models/User'; // Import User model
import { getRotatingAkashClient } from '@/libs/akash-ai'; // Import getRotatingAkashClient

// Helper function to create a streaming response
function createStreamingResponse(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          controller.enqueue(encoder.encode(content)); // Encode content before enqueueing
        }
      }
      controller.close();
    },
  });
  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// --- Type guard for async iterable (streaming) ---
function isAsyncIterable(obj: any): obj is AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk> {
  return obj && typeof obj[Symbol.asyncIterator] === 'function';
}

export async function POST(request: Request) {
  try {
    const { text, action, title = '', personalContext = {}, stream = true, providerConfig, providerId, modelId, chatHistory = [] } = await request.json(); // Accept providerConfig or providerId, add chatHistory

    // For ideas, article (outline), and chat generation, we don't require initial text
    if (!text && action !== 'ideas' && action !== 'article' && action !== 'chat') { // Allow chat without initial text
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Extract personalized context if available
    const { niche, coreMessage, industry, role, contentIdeas } = personalContext;
    const contextInfo = {
      niche: niche || industry || '',
      role: role || 'content creator',
      coreMessage: coreMessage || '',
      targetAudience: personalContext.targetAudience || []
    };

    // Choose prompt based on action
    let systemPrompt = ''; // Define system prompt separately
    let userPrompt = ''; // Define user prompt separately
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []; // Use messages array for chat

    switch (action) {
      // ... existing cases ...
      case 'improve':
        systemPrompt = `Improve the following text for clarity, engagement, and professional tone without changing its core meaning. Make it more compelling and easier to read, only give back the rewritten text without any additional comments or explanations, don't put it in quotes. ${contextInfo.niche ? `\nContext: This is for a ${contextInfo.role} in the ${contextInfo.niche} industry.` : ''}`;
        userPrompt = text;
        messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }];
        break;
      case 'ideas':
        systemPrompt = `Generate 3-5 content ideas for a ${contextInfo.role} in the ${contextInfo.niche || 'your'} industry.\n${contextInfo.coreMessage ? `Core message: ${contextInfo.coreMessage}` : ''}\n${Array.isArray(contextInfo.targetAudience) && contextInfo.targetAudience.length > 0 ? `Target audience: ${contextInfo.targetAudience.join(', ')}` : ''}\n\n- Give me high-level, headline-expert quality headlines, use **markdown bold**)\n- Use a numbered list (1. 2. 3. etc)\n- Group ideas by type: Expertise, Personal Journey, Client Proof (give 5 ideas for each type)\n\nOnly respond with the ideas, no extra text. Use markdown formatting for clarity.`;
        userPrompt = "Generate ideas.";
        messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }];
        break;
      case 'article':
        systemPrompt = `Generate a structured outline for an article titled "${title || '[Insert Title]'}" for a ${contextInfo.role} in the ${contextInfo.niche} industry.\n\n1. **Hook**: Write a bold, curiosity-driven opening that addresses the reader's pain points or goals.\n2. **Core Message**: Summarize the article's key lesson or value proposition in 1 sentence.\n3. **Actionable Sections**: Include 3-5 subheadings with practical advice (e.g., step-by-step systems, frameworks, or relatable stories).\n4. **Closing**: End with a strong call-to-action encouraging immediate next steps.\n\nOnly respond with the outline, no extra text. Use markdown and a numbered list for clarity.`;
        userPrompt = `Generate outline for "${title || '[Insert Title]'}" article.`;
        messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }];
        break;
      case 'shorten':
        systemPrompt = `Summarize the following text to about half its length while preserving the key points and main message, only give back the rewritten text without any additional comments or explanations, don't put it in quotes. Format properly, and use markdown for readability.`;
        userPrompt = text;
        messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }];
        break;
      case 'rewrite':
        systemPrompt = `Rewrite the following text in a different style while keeping the same information and intent, only give back the rewritten text without any additional comments or explanations, don't put it in quotes: ${contextInfo.niche ? `\nContext: This is for a ${contextInfo.role} in the ${contextInfo.niche} industry.` : ''}`;
        userPrompt = text;
        messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }];
        break;
      case 'earning-optimiser':
        systemPrompt = `You are a world-class content monetization strategist. Analyze the following content and provide:\n- A Monetisation Score (0-100)\n- 3-5 concise, high-impact suggestions to improve monetisation. Each suggestion should be a single sentence, actionable, and valuable. Use markdown to bold the key action or concept in each suggestion (e.g., **Add a clear CTA**: ...). Do not use generic or empty responses. If the content is missing information, make smart assumptions based on typical online businesses. Use plain text and markdown for bolding only.\n\nFormat your response as:\nMonetisation Score: <number>\nSuggestions:\n1. **<action 1>**: <short explanation>\n2. **<action 2>**: <short explanation>\n3. **<action 3>**: <short explanation>\n4. **<action 4>**: <short explanation>\n5. **<action 5>**: <short explanation>\n\nDon't add any extra text or explanations. Only respond with the score and suggestions, no empty bullet points as well.`;
        userPrompt = `Content:\n${text}`;
        messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }];
        break;
      // +++ NEW CHAT ACTION +++
      case 'chat':
        systemPrompt = `You are a helpful AI assistant integrated into a content editor. Be concise and helpful. ${contextInfo.niche ? `The user is a ${contextInfo.role} in the ${contextInfo.niche} industry.` : ''}`;
        // Construct messages array from history and new prompt
        messages = [
          { role: 'system', content: systemPrompt },
          ...(chatHistory as OpenAI.Chat.Completions.ChatCompletionMessageParam[]), // Add previous messages
          { role: 'user', content: text } // Add the new user message
        ];
        break;
      // +++ END NEW CHAT ACTION +++
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    let openai: OpenAI | null = null; // Initialize openai as null

    // If a providerConfig is provided, use it
    if (providerConfig && providerConfig.apiKey && providerConfig.endpoint && providerConfig.models) {
      try {
        openai = new OpenAI({
          apiKey: providerConfig.apiKey,
          baseURL: providerConfig.endpoint,
        });
      } catch (error) {
        console.error("Error initializing OpenAI with providerConfig:", error);
        // Potentially return an error response or fallback
      }
    }

    // If a providerId is provided, fetch the user's config from DB
    if (!openai && providerId && modelId) { // Only fetch if openai wasn't initialized above
      // Get user session
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      await connectMongo; // Fix: don't call as a function, just await the promise
      const user = await User.findById(session.user.id).select('aiProviderConfigs');
      const config = user?.aiProviderConfigs?.find((c: any) => c.id === providerId);
      if (config) {
        try {
          openai = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.endpoint,
          });
        } catch (error) {
          console.error("Error initializing OpenAI with providerId:", error);
          // Potentially return an error response or fallback
        }
      } else {
         console.warn(`AI Provider config with ID ${providerId} not found for user ${session.user.id}`);
         // Don't return error yet, try rotating client
      }
    }

    // Determine the model to use
    const resolvedModelId = modelId || (providerConfig?.models?.split(',')[0]?.trim()) || 'default-model'; // Add fallback model

    // Try using the specific client first if available
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: resolvedModelId,
          messages: messages,
          stream: stream,
        });
        if (stream && isAsyncIterable(completion)) {
          return createStreamingResponse(completion);
        } else {
          return NextResponse.json(completion);
        }
      } catch (error) {
        console.error("Error with configured OpenAI client:", error);
        // Fall through to try rotating client if the specific one fails
      }
    }

    // Fallback to rotating client (Akash) if no specific client worked or was configured
    const rotatingClient = await getRotatingAkashClient();

    if (rotatingClient) {
      try {
        const completion = await rotatingClient.client.chat.completions.create({
          model: resolvedModelId, // Use the resolved model ID, not hardcoded
          messages: messages,
          stream: stream,
        });
        if (stream && isAsyncIterable(completion)) {
          return createStreamingResponse(completion);
        } else {
          return NextResponse.json(completion);
        }
      } catch (error) {
        console.error("Error with rotating Akash client:", error);
        // Fall through to the final error response
      }
    }

    // If all attempts fail
    return NextResponse.json(
      { error: 'No available AI client or all clients failed' },
      { status: 503 }
    );

  } catch (error: any) { // Catch any type of error
    console.error('Content assist error:', error);
    // Ensure error is serializable for JSON response
    const errorMessage = error instanceof Error ? error.message : 'Failed to process content';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}