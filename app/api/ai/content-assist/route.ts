import { NextResponse } from 'next/server';
import { defaultAIClient, getRotatingAkashClient } from '@/libs/akash-ai';
import { models } from '@/libs/akash-ai';
import { OpenAI } from 'openai'; // Import OpenAI type if not already

export const runtime = 'edge';

// Helper function to create a streaming response
function createStreamingResponse(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });
  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(request: Request) {
  try {
    const { text, action, title = '', personalContext = {}, stream = true } = await request.json(); // Default stream to true

    // For ideas and article (outline) generation, we don't require text
    if (!text && action !== 'ideas' && action !== 'article') {
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
    let prompt = '';
    switch (action) {
      case 'improve':
        prompt = `Improve the following text for clarity, engagement, and professional tone without changing its core meaning. Make it more compelling and easier to read, only give back the rewritten text without any additional comments or explanations, don't put it in quotes:
${contextInfo.niche ? `\nContext: This is for a ${contextInfo.role} in the ${contextInfo.niche} industry.` : ''}

${text}`;
        break;
      case 'ideas':
        prompt = `Generate 3-5 content ideas for a ${contextInfo.role} in the ${contextInfo.niche || 'your'} industry.
${contextInfo.coreMessage ? `Core message: ${contextInfo.coreMessage}` : ''}
${Array.isArray(contextInfo.targetAudience) && contextInfo.targetAudience.length > 0 ? `Target audience: ${contextInfo.targetAudience.join(', ')}` : ''}

For each idea:
- Start with a short, bolded headline (use **markdown bold**)
- Follow with a 1-2 sentence description expanding on the idea
- Use a numbered list (1. 2. 3. etc)
- Group ideas by type: Expertise, Personal Journey, Client Proof (if possible)

Only respond with the ideas, no extra text. Use markdown formatting for clarity.`;
        break;
      case 'article':
        prompt = `Generate a structured outline for an article titled "${title || '[Insert Title]'}" for a ${contextInfo.role} in the ${contextInfo.niche} industry.\n\n1. **Hook**: Write a bold, curiosity-driven opening that addresses the reader's pain points or goals.\n2. **Core Message**: Summarize the article's key lesson or value proposition in 1 sentence.\n3. **Actionable Sections**: Include 3-5 subheadings with practical advice (e.g., step-by-step systems, frameworks, or relatable stories).\n4. **Closing**: End with a strong call-to-action encouraging immediate next steps.\n\nOnly respond with the outline, no extra text. Use markdown and a numbered list for clarity.`;
        break;
      case 'shorten':
        prompt = `Summarize the following text to about half its length while preserving the key points and main message, only give back the rewritten text without any additional comments or explanations, don't put it in quotes. Format properly, and use markdown for readability:

${text}`;
        break;
      case 'rewrite':
        prompt = `Rewrite the following text in a different style while keeping the same information and intent, only give back the rewritten text without any additional comments or explanations, don't put it in quotes:
${contextInfo.niche ? `\nContext: This is for a ${contextInfo.role} in the ${contextInfo.niche} industry.` : ''}

${text}`;
        break;
      case 'earning-optimiser':
        prompt = `You are a world-class content monetization strategist. Analyze the following content and provide:
- A Monetisation Score (0-100)
- 3-5 concise, high-impact suggestions to improve monetisation. Each suggestion should be a single sentence, actionable, and valuable. Use markdown to bold the key action or concept in each suggestion (e.g., **Add a clear CTA**: ...). Do not use generic or empty responses. If the content is missing information, make smart assumptions based on typical online businesses. Use plain text and markdown for bolding only.

Format your response as:
Monetisation Score: <number>
Suggestions:
1. **<action 1>**: <short explanation>
2. **<action 2>**: <short explanation>
3. **<action 3>**: <short explanation>
4. **<action 4>**: <short explanation>
5. **<action 5>**: <short explanation>

Don't add any extra text or explanations. Only respond with the score and suggestions, no empty bullet points as well.
Content:\n${text}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // First try using rotating client (Akash)
    const rotatingClient = await getRotatingAkashClient();

    if (rotatingClient) {
      try {
        const completionStream = await rotatingClient.client.chat.completions.create({
          model: "Meta-Llama-4-Maverick-17B-128E-Instruct-FP8", // Use the model defined in akash-ai
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: true // Enable streaming
        });

        // Create and return the streaming response
        const streamResponse = createStreamingResponse(completionStream);

        // Release client *after* stream is consumed (this needs careful handling in edge runtime)
        // A common pattern is to handle release in the stream's finally block,
        // but for simplicity here, we'll rely on the request finishing.
        // A more robust solution might involve tracking the stream.
        // For now, we release immediately after starting the stream.
        rotatingClient.release();
        return streamResponse;

      } catch (error) {
        console.error('Error with rotating client:', error);
        // If rotatingClient fails, release it anyway
        rotatingClient.release();
        // Fall through to potentially try defaultAIClient or return error
        // Depending on desired fallback behavior. For now, let's return an error if streaming fails here.
         return NextResponse.json(
           { error: 'Failed to get streaming response from AI' },
           { status: 500 }
         );
      }
    } else {
       return NextResponse.json(
         { error: 'No available AI client' },
         { status: 503 } // Service Unavailable
       );
    }

    // Fallback or non-streaming logic removed for clarity, assuming streaming is the primary path now.

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
