import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import { githubAIClient, models, getRotatingAkashClient, RotatingClient, QUALITY_MODEL } from "@/libs/github-ai";
import WritingProtocol from "@/models/WritingProtocol";

// Helper function to check if a string is valid JSON
function isValidJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Helper function to fix common JSON syntax errors
function fixCommonJsonErrors(jsonString: string) {
  let fixed = jsonString;
  
  // Fix duplicate commas
  fixed = fixed.replace(/,\s*,/g, ',');
  
  // Fix trailing commas in objects and arrays
  fixed = fixed.replace(/,\s*}/g, '}');
  fixed = fixed.replace(/,\s*]/g, ']');
  
  // Fix missing quotes around property names
  fixed = fixed.replace(/(\w+):/g, '"$1":');
  
  // Fix dangling properties without values
  fixed = fixed.replace(/"[^"]+"\s*:(?!\s*["{\[0-9tf])/g, '$&null');
  
  // Remove any non-JSON text at the end (after the closing brace)
  const lastBrace = fixed.lastIndexOf('}');
  if (lastBrace !== -1) {
    fixed = fixed.substring(0, lastBrace + 1);
  }
  
  // Check for missing closing brackets
  const openBraces = (fixed.match(/{/g) || []).length;
  const closeBraces = (fixed.match(/}/g) || []).length;
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/]/g) || []).length;
  
  // Add missing closing braces/brackets
  for (let i = 0; i < openBraces - closeBraces; i++) {
    fixed += '}';
  }
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    fixed += ']';
  }
  
  return fixed;
}

// Helper function to get the base URL for API calls
function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3001"; // Fallback for development
}

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    // Check if AI client is available
    if (!githubAIClient) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 503 }
      );
    }

    // Get request body
    const { 
      title,
      userRole,
      industry,
      contentTypes,
      goals,
      challenges,
      modelType,
      experience,
      timeAvailability,
      audience,
      audienceDetails,
      onlinePresence,
      leadMagnets,
      leadMagnetDetails,
      offers,
      offerDetails,
      hasLeadMagnets,
      hasOffers,
      contentBalance
    } = await req.json();

    // Validate required fields
    if (!title || !userRole || !industry || !contentTypes || !goals || !challenges) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectMongo();

    // First, create a new protocol with 'processing' status
    const protocol = new WritingProtocol({
      userId: session.user.id || session.user.email,
      title,
      userRole,
      industry,
      contentTypes,
      goals,
      challenges,
      status: 'processing',
      modelType,
      // Initialize with empty structure to prevent null errors
      aiGeneratedContent: {
        nicheAuthority: {
          fullNiche: '',
          coreMessage: '',
          uniqueMechanism: '',
          targetAudience: [],
        },
        contentPillars: {
          expertise: {
            title: '',
            contentIdeas: [],
          },
          personalJourney: {
            title: '',
            contentIdeas: [],
          },
          clientProof: {
            title: '',
            contentIdeas: [],
          },
        },
        repurposeSystem: {
          thoughtLeadershipArticle: {
            headline: '',
            hook: '',
            storytelling: '',
            valuePoints: [],
            cta: '',
          },
          formats: {
            shortForm: [],
            threads: {
              hook: '',
              body: [],
              cta: '',
            },
          },
        },
        contentCalendar: {
          days: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          },
        },
        conversionFunnel: {
          awareness: {
            goal: '',
            contentStrategy: [],
            leadMagnet: '',
            outreach: '',
          },
          activeFollowers: {
            goal: '',
            strategies: [],
          },
          conversion: {
            goal: '',
            strategies: [],
            offers: [],
            callToAction: '',
          },
        },
      }
    });

    await protocol.save();
    
    // Return the protocol ID immediately to avoid timeout
    const response = NextResponse.json({ 
      success: true, 
      _id: protocol._id,
      status: 'processing',
      message: 'Your writing protocol is being generated. Please check back in a moment.'
    });

    // Start background processing without waiting for completion
    generateProtocolContent(protocol._id.toString(), {
      title,
      userRole,
      industry,
      contentTypes,
      goals,
      challenges,
      modelType,
      experience,
      timeAvailability,
      audience,
      audienceDetails,
      onlinePresence,
      leadMagnets,
      leadMagnetDetails,
      offers,
      offerDetails,
      hasLeadMagnets,
      hasOffers,
      contentBalance
    }).catch(error => {
      console.error('Background processing error:', error);
    });

    return response;
  } catch (error: any) {
    console.error("Writing Protocol Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Background processing function
async function generateProtocolContent(
  protocolId: string, 
  data: { 
    title: string; 
    userRole: string;
    industry: string;
    contentTypes: string[];
    goals: string[];
    challenges: string[];
    modelType?: 'fast' | 'quality';
    experience?: string;
    timeAvailability?: string;
    audience?: string[];
    audienceDetails?: string;
    onlinePresence?: {
      platforms?: string[];
      platformDetails?: Record<string, { followersCount?: number; postFrequency?: string }>;
    };
    leadMagnets?: string[];
    leadMagnetDetails?: string;
    offers?: string[];
    offerDetails?: string;
    hasLeadMagnets?: boolean;
    hasOffers?: boolean;
    contentBalance?: 'education' | 'conversion' | 'balanced';
  }
) {
  try {
    await connectMongo();
    
    // Create a structured prompt for the AI API
    const prompt = `Generate a personalized writing protocol for a ${data.userRole} in the ${data.industry} industry.

    USER BACKGROUND AND CONTEXT:
    - Role: ${data.userRole}
    - Industry: ${data.industry}
    - Experience level: ${data.experience || "Not specified"}
    - Time availability: ${data.timeAvailability || "Not specified"}
    - Writes content types: ${data.contentTypes.join(", ")}
    - Content goals: ${typeof data.goals === 'string' ? data.goals : data.goals.join(", ")}
    - Writing challenges: ${typeof data.challenges === 'string' ? data.challenges : data.challenges.join(", ")}
    
    AUDIENCE INFORMATION:
    - Target audience categories: ${data.audience ? data.audience.join(", ") : "Not specified"}
    ${data.audienceDetails ? `- Audience details: ${data.audienceDetails}` : ""}
    
    ONLINE PRESENCE:
    ${data.onlinePresence?.platforms && data.onlinePresence.platforms.length > 0 
    ? `- Current platforms: ${data.onlinePresence.platforms.join(", ")}
    ${data.onlinePresence.platforms.map(platform => {
      const details = data.onlinePresence?.platformDetails?.[platform];
      if (details) {
        return `- ${platform} Stats: ${details.followersCount} with posting frequency ${details.postFrequency}`;
      }
      return '';
    }).filter(Boolean).join('\n    ')}`
    : "- No significant online presence yet"}
    
    BUSINESS CONTEXT:
    ${data.hasLeadMagnets 
    ? `- Existing lead magnets: ${data.leadMagnets?.join(", ") || "None"}
    ${data.leadMagnetDetails ? `- Lead magnet details: ${data.leadMagnetDetails}` : ""}`
    : "- No lead magnets currently"}
    
    ${data.hasOffers
    ? `- Products/services offered: ${data.offers?.join(", ") || "None"}
    ${data.offerDetails ? `- Offer details: ${data.offerDetails}` : ""}`
    : "- No specific products or services defined yet"}
    
    PROTOCOL BALANCE PREFERENCE:
    ${data.contentBalance 
      ? data.contentBalance === 'education' 
        ? '- Focus more on educational content (80% educational, 20% promotional)'
        : data.contentBalance === 'conversion'
          ? '- Focus more on conversion and promotional content (40% educational, 60% promotional)'
          : '- Balanced approach between educational and promotional content (50% educational, 50% promotional)'
      : '- Balanced approach between educational and promotional content (50% educational, 50% promotional)'
    }
    
    The writing protocol should be titled: "${data.title}"
    
    Create a comprehensive writing protocol with these sections:
    
    1. NICHE AUTHORITY: Build a clear niche authority position for this user based on their industry, role, and audience. Include:
       - Full niche definition (very specific)
       - Core message that positions them as an authority
       - Unique mechanism or approach they can own
       - Target audience segments with specific pain points
    
    2. CONTENT PILLARS: Create 3 content pillars that showcase expertise, personal journey, and client proof:
       - For each pillar: title, description, and at least 5 specific content ideas
       - Make sure pillars are balanced and aligned with their goals
       - Adapt complexity to their experience level
       - Ensure content volume matches their time availability
    
    3. REPURPOSE SYSTEM: Design a comprehensive content repurposing system:
       - A long-form content template (article/video) with headline, hook, storytelling structure, and value points
       - Ways to break it down into at least 3 short-form content types
       - Thread template with hook, key points, and call-to-action
       - Adaptation strategies for each platform they use
    
    4. CONTENT CALENDAR: Create a realistic content calendar based on:
       - Their time availability (${data.timeAvailability || "Not specified"})
       - Current posting frequency (if any)
       - A progressive approach that builds momentum
       - Balance between different content types and platforms
    
    5. CONVERSION FUNNEL: Design a conversion strategy that includes:
       ${data.hasLeadMagnets 
       ? `- How to optimize their existing lead magnets (${data.leadMagnets?.join(", ") || "None"})`
       : "- Suggestions for lead magnets they could create"}
       ${data.hasOffers
       ? `- How to effectively promote their current offers (${data.offers?.join(", ") || "None"})`
       : "- Ideas for potential offers they could develop"}
       - Specific call-to-action strategies for each platform
       - Content-to-conversion pathway

    Format the response as JSON with the following structure:
    {
      "nicheAuthority": {
        "fullNiche": "string",
        "coreMessage": "string",
        "uniqueMechanism": "string",
        "targetAudience": ["string", "string"]
      },
      "contentPillars": {
        "expertise": {
          "title": "string",
          "contentIdeas": ["string", "string", "string", "string", "string"]
        },
        "personalJourney": {
          "title": "string",
          "contentIdeas": ["string", "string", "string", "string", "string"]
        },
        "clientProof": {
          "title": "string",
          "contentIdeas": ["string", "string", "string", "string", "string"]
        }
      },
      "repurposeSystem": {
        "thoughtLeadershipArticle": {
          "headline": "string",
          "hook": "string",
          "storytelling": "string",
          "valuePoints": ["string", "string", "string"],
          "cta": "string"
        },
        "formats": {
          "shortForm": ["string", "string", "string"],
          "threads": {
            "hook": "string",
            "body": ["string", "string", "string"],
            "cta": "string"
          }
        }
      },
      "contentCalendar": {
        "days": {
          "monday": [{"type": "content", "title": "string"}],
          "tuesday": [{"type": "content", "title": "string"}],
          "wednesday": [{"type": "content", "title": "string"}],
          "thursday": [{"type": "content", "title": "string"}],
          "friday": [{"type": "content", "title": "string"}],
          "saturday": [{"type": "content", "title": "string"}],
          "sunday": [{"type": "content", "title": "string"}]
        }
      },
      "conversionFunnel": {
        "awareness": {
          "goal": "string",
          "contentStrategy": ["string", "string", "string"],
          "leadMagnet": "string",
          "outreach": "string"
        },
        "activeFollowers": {
          "goal": "string",
          "strategies": ["string", "string", "string"]
        },
        "conversion": {
          "goal": "string",
          "strategies": ["string", "string", "string"],
          "offers": ["string", "string"],
          "callToAction": "string"
        }
      }
    }`;

    // Determine which model to use - always use the quality model (deepseek)
    let modelToUse = QUALITY_MODEL;
    console.log(`Using quality model: ${modelToUse} for writing protocol generation`);

    try {
      let aiGeneratedContent: any;
      
      // Check if we should use the rotating Akash client
      if (process.env.USE_AKASH === "true") {
        console.log("Using rotating Akash client for writing protocol generation");
        
        // Get a client from the rotation pool with available quota
        const rotatingClient = await getRotatingAkashClient();
        
        if (!rotatingClient) {
          throw new Error("All Akash API clients are at capacity. Please try again later.");
        }
        
        try {
          // Send request to AI using the rotating client
          const completion = await rotatingClient.client.chat.completions.create({
            model: modelToUse,
            messages: [
              { 
                role: "user", 
                content: prompt 
              }
            ],
            temperature: 0.7,
            max_tokens: 16000,
            response_format: { type: "json_object" }
          });
          
          // Process the completion
          if (!completion.choices[0]?.message?.content) {
            throw new Error("Failed to generate writing protocol");
          }
          
          // Process response content
          const responseContent = completion.choices[0].message.content || "";
          let jsonContent = responseContent;
          
          // Remove any thinking sections in various formats
          const thinkingPatterns = [
            /<think>[\s\S]*?<\/think>/gm,
            /<details.*?>[\s\S]*?<\/details>/gm,
            /```json\s*([\s\S]*?)```/gm,
          ];
          
          // Apply each pattern to remove thinking sections
          thinkingPatterns.forEach(pattern => {
            if (pattern.toString().includes('```json')) {
              const matches = [...jsonContent.matchAll(pattern)];
              if (matches.length > 0) {
                jsonContent = matches[0][1];
              }
            } else {
              jsonContent = jsonContent.replace(pattern, '').trim();
            }
          });
          
          // Look for the actual JSON content if we haven't yet found it
          if (!isValidJSON(jsonContent)) {
            const jsonStartIndex = jsonContent.indexOf('{');
            const jsonEndIndex = jsonContent.lastIndexOf('}');
            
            if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
              jsonContent = jsonContent.substring(jsonStartIndex, jsonEndIndex + 1);
            }
          }
          
          jsonContent = jsonContent.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          console.log("Cleaned content for parsing:", jsonContent.substring(0, 100) + "...");
          
          try {
            aiGeneratedContent = JSON.parse(jsonContent);
          } catch (parseError) {
            console.error("Initial parsing failed:", parseError);
            const fixedContent = fixCommonJsonErrors(jsonContent);
            console.log("Attempting with fixed content:", fixedContent.substring(0, 100) + "...");
            aiGeneratedContent = JSON.parse(fixedContent);
          }
          
          // Update the protocol with the generated content
          await WritingProtocol.findByIdAndUpdate(protocolId, {
            aiGeneratedContent: {
              ...aiGeneratedContent
            },
            status: 'completed'
          });
          
          console.log(`Successfully generated and updated protocol ${protocolId}`);
        } finally {
          // Always release the client back to the pool
          rotatingClient.release();
        }
      } else {
        // Use the default client (GitHub or fallback)
        if (!githubAIClient) {
          throw new Error("AI service is not configured");
        }
        
        // Send request to AI using the default client
        const completion = await githubAIClient.chat.completions.create({
          model: modelToUse,
          messages: [
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 16000,
          response_format: { type: "json_object" }
        });

        if (!completion.choices[0]?.message?.content) {
          throw new Error("Failed to generate writing protocol");
        }

        // Parse the AI response as JSON, handling any thinking sections
        const responseContent = completion.choices[0].message.content || "";
        let jsonContent = responseContent;
        
        // Remove any thinking sections in various formats
        const thinkingPatterns = [
          /<think>[\s\S]*?<\/think>/gm,
          /<details.*?>[\s\S]*?<\/details>/gm,
          /```json\s*([\s\S]*?)```/gm,
        ];
        
        // Apply each pattern to remove thinking sections
        thinkingPatterns.forEach(pattern => {
          if (pattern.toString().includes('```json')) {
            const matches = [...jsonContent.matchAll(pattern)];
            if (matches.length > 0) {
              jsonContent = matches[0][1];
            }
          } else {
            jsonContent = jsonContent.replace(pattern, '').trim();
          }
        });
        
        // Look for the actual JSON content if we haven't yet found it
        if (!isValidJSON(jsonContent)) {
          const jsonStartIndex = jsonContent.indexOf('{');
          const jsonEndIndex = jsonContent.lastIndexOf('}');
          
          if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
            jsonContent = jsonContent.substring(jsonStartIndex, jsonEndIndex + 1);
          }
        }
        
        jsonContent = jsonContent.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        console.log("Cleaned content for parsing:", jsonContent.substring(0, 100) + "...");
        
        try {
          aiGeneratedContent = JSON.parse(jsonContent);
        } catch (parseError) {
          console.error("Initial parsing failed:", parseError);
          const fixedContent = fixCommonJsonErrors(jsonContent);
          console.log("Attempting with fixed content:", fixedContent.substring(0, 100) + "...");
          aiGeneratedContent = JSON.parse(fixedContent);
        }
        
        // Update the protocol with the generated content
        await WritingProtocol.findByIdAndUpdate(protocolId, {
          aiGeneratedContent: {
            ...aiGeneratedContent
          },
          status: 'completed'
        });

        console.log(`Successfully generated and updated protocol ${protocolId}`);
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      
      // Update protocol with error status
      await WritingProtocol.findByIdAndUpdate(protocolId, {
        status: 'failed',
        statusMessage: aiError.message || 'Failed to generate writing protocol. Please try again.'
      });
      
      // Refund token for the user
      try {
        const baseUrl = getBaseUrl();
        await fetch(`${baseUrl}/api/user/refund-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        console.log(`✅ Token refunded for failed AI generation: ${protocolId}`);
      } catch (refundError) {
        console.error("Failed to refund token:", refundError);
      }
    }
  } catch (error) {
    console.error("Background protocol generation error:", error);
    
    // Update protocol with error status
    try {
      await WritingProtocol.findByIdAndUpdate(protocolId, {
        status: 'failed',
        statusMessage: error.message || 'An unexpected error occurred. Please try again.'
      });
      
      // Refund token for the user
      try {
        const baseUrl = getBaseUrl();
        await fetch(`${baseUrl}/api/user/refund-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        console.log(`✅ Token refunded for failed protocol processing: ${protocolId}`);
      } catch (refundError) {
        console.error("Failed to refund token:", refundError);
      }
    } catch (dbError) {
      console.error("Failed to update protocol with error status:", dbError);
    }
  }
}

export async function GET(req: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    await connectMongo();

    // Check if we're requesting a specific protocol by ID
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Fetch a specific protocol by ID
      const protocol = await WritingProtocol.findOne({
        _id: id,
        userId: session.user.id || session.user.email
      });

      if (!protocol) {
        return NextResponse.json(
          { error: "Protocol not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(protocol);
    }

    // Otherwise, fetch all protocols for the user
    const protocols = await WritingProtocol.find({
      userId: session.user.id || session.user.email
    }).sort({ createdAt: -1 });

    return NextResponse.json(protocols);
  } catch (error: any) {
    console.error("Error fetching protocols:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch protocols" },
      { status: 500 }
    );
  }
}