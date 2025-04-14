import { NextResponse } from 'next/server';
import { defaultAIClient, getRotatingAkashClient } from '@/libs/akash-ai';
import { models } from '@/libs/akash-ai';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text, action, title = '', personalContext = {}, stream = false } = await request.json();

    // For ideas generation, we don't require text
    if (!text && action !== 'ideas') {
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
        prompt = `Improve the following text for clarity, engagement, and professional tone without changing its core meaning. Make it more compelling and easier to read:
${contextInfo.niche ? `\nContext: This is for a ${contextInfo.role} in the ${contextInfo.niche} industry.` : ''}

${text}`;
        break;
      case 'ideas':
        prompt = `Generate 3-5 content ideas (1-2 sentences each) for a ${contextInfo.role} in the ${contextInfo.niche || 'your'} industry.
${contextInfo.coreMessage ? `Core message: ${contextInfo.coreMessage}` : ''}
${Array.isArray(contextInfo.targetAudience) && contextInfo.targetAudience.length > 0 ? `Target audience: ${contextInfo.targetAudience.join(', ')}` : ''}

Include:
1. Expertise ideas (frameworks, step-by-step guides, tips)
2. Personal journey ideas (your story, lessons learned, case studies) 
3. Client proof ideas (success stories, results, transformations)

${text ? `Use this text as inspiration: ${text}` : ''}`;
        break;
      case 'shorten':
        prompt = `Summarize the following text to about half its length while preserving the key points and main message:

${text}`;
        break;
      case 'rewrite':
        prompt = `Rewrite the following text in a different style while keeping the same information and intent:
${contextInfo.niche ? `\nContext: This is for a ${contextInfo.role} in the ${contextInfo.niche} industry.` : ''}

${text}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    let aiResponse;
    
    // First try using rotating client (Akash)
    const rotatingClient = await getRotatingAkashClient();
    
    if (rotatingClient) {
      try {
        const completion = await rotatingClient.client.chat.completions.create({
          model: models.akash,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });
        
        aiResponse = completion.choices[0]?.message?.content || '';
        // Make sure to release the client back to the pool
        rotatingClient.release();
      } catch (error) {
        console.error('Error with rotating client:', error);
        // If rotatingClient fails, release it anyway
        rotatingClient.release();
        // Fall through to try defaultAIClient
      }
    }
    

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No AI response generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: aiResponse });
    
  } catch (error) {
    console.error('Content assist error:', error);
    return NextResponse.json(
      { error: 'Failed to process content' },
      { status: 500 }
    );
  }
}
