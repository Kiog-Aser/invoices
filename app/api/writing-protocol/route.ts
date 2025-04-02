import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import { githubAIClient, models } from "@/libs/github-ai";
import WritingProtocol from "@/models/WritingProtocol";

// Model constants
const DEEPSEEK_MODEL = "DeepSeek-R1";

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
      modelType
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
      modelType
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
  }
) {
  try {
    await connectMongo();
    
    // Create a structured prompt for the AI API
    const prompt = `Generate a writing protocol for a ${data.userRole} in the ${data.industry} industry who creates ${data.contentTypes.join(", ")}. 
    Their goals are: ${data.goals.join(", ")}. 
    Their challenges are: ${data.challenges.join(", ")}.
    
    The writing protocol should be titled: "${data.title}"
    
    Create a comprehensive writing protocol with these sections:
    
    # DETAILED GUIDANCE FOR EACH SECTION
        
        ## 1. NICHE AUTHORITY
        
        ### Full Niche
        Be ultra-specific to differentiate the user. Don't just say "fitness coach" but something like "Virtual strength coach for busy tech professionals over 40 who want to prevent injuries while building functional strength."
        
        Example for Marketing Consultant:
        "Data-driven marketing strategy consultant for B2B SaaS companies in the $1-5M ARR range looking to scale their customer acquisition."
        
        ### Core Message
        This should be a clear, compelling statement that resonates with their target audience's pain points and desired outcomes.
        
        Example for Productivity Coach:
        "Transform chaos into clarity with science-backed systems that help high-achievers accomplish more while working less."
        
        ### Unique Mechanism
        This must be a concrete methodology, framework, or approach that only they offer. Make it sound unique yet credible.
        
        Example for Health Coach:
        "The Metabolic Reset Protocol — A 4-phase approach that combines intermittent fasting, circadian rhythm optimization, and micronutrient balancing to revitalize cellular health."
        
        ### Target Audience
        List 3-4 very specific audience segments with psychographic and demographic details.
        
        Example for Parenting Coach:
        "- First-time parents with high-stress corporate jobs adjusting to work-life balance\n- Parents of neurodivergent children seeking compassionate behavioral management strategies\n- Blended families navigating complex dynamics between step-siblings and co-parenting"
        
        ## 2. CONTENT PILLARS
        
        ### Expertise Content
        Generate 5-6 specific article ideas that demonstrate the user's specialized knowledge. Include compelling titles, not generic topics.
        
        Example for Real Estate Agent:
        "- '7 Hidden Property Deal-Breakers That Most First-Time Homebuyers Miss During Viewings'\n- 'The 30-60-90 Day Timeline: What to Expect After Your Offer Is Accepted'"
        
        ### Personal Journey
        Create 5-6 story-based content ideas that show the user's credibility through their personal experiences.
        
        Example for Fitness Trainer:
        "- 'How I Overcame Chronic Back Pain: The 3 Exercise Mistakes That Were Sabotaging My Recovery'\n- 'From Injured Athlete to Master Trainer: 5 Mindset Shifts That Transformed My Approach to Fitness'"
        
        ### Client Proof & Credibility
        Generate 5-6 ideas for content that showcase client results without being too salesy.
        
        Example for Business Coach:
        "- 'Case Study: How [Client] Doubled Their Revenue in 90 Days by Restructuring Their Sales Process'\n- '3 Success Patterns I've Observed After Coaching 50+ Entrepreneurs to Six Figure Businesses'"
        
        ## 3. REPURPOSE SYSTEM
        
        ### Thought-Leadership Article
        Create a specific example with headline, hook, storytelling approach, value points and CTA that feels natural for their industry. Also specify how many times per week the user should publish thought-leadership articles (typically 1-3 times per week).
        
        Example for Tech Consultant:
        "Headline: '3 Cybersecurity Blind Spots That Put Small Law Firms at Massive Risk'\nHook: 'A single data breach costs the average small law firm $108,000—yet 82% are missing these three critical protections.'\nFrequency: 2 times per week"
        
        ### Short-Form Content
        Provide 3-4 specific examples tailored to the user's industry that could work on platforms like Twitter, LinkedIn, or Instagram. Also specify how many times per week the user should publish short-form content (typically 5-7 times per week).
        
        Example for Career Coach:
        "- 'The resume gets you noticed, but your interview story gets you hired. Instead of reciting achievements, structure your answer as: Challenge → Action → Unexpected obstacles → Resolution → Results.'\n- 'Stop applying to job postings. Start connecting with people who already work where you want to be. A 15-minute coffee chat is worth 50 applications.'\nFrequency: 7 times per week (daily)"
        
        ### Thread Structure
        Create a specific thread outline with hook, body points, and CTA that would resonate with the user's audience. Also specify how many times per week the user should publish threads (typically 2-3 times per week).
        
        Example for Personal Finance Creator:
        "Hook: 'I paid off $87,000 in student loans in 19 months while making $55K. No family money. No lottery. Just 5 unconventional decisions most people aren't willing to make:'\nBody: ['1. I house-hacked with 3 roommates in a 2-bedroom apartment, cutting my rent to $400/mo in a major city', '2. I negotiated a 4-day workweek with a 10% pay cut, then used that day for a side business that eventually made $1,500/mo']\nFrequency: 3 times per week"
        
        ## 4. CONTENT CALENDAR
        Design a weekly content calendar with structured content types for each day based on the user's industry, audience habits, and the content types they selected. For each day, specify 1-3 content types to post.
        
        For each content item, include:
        1. The content type (e.g., newsletter, article, tweet, short-form, thread, video, story)
        2. A brief description of what the content should cover
        
        Align this calendar with:
        - The user's repurpose system (thoughtLeadershipArticle, shortForm, threads)
        - Their content pillars (expertise, personal journey, client proof)
        - Their publishing frequency preferences
        
        Example for a Digital Marketing Coach:
        "Monday: [
          {
            \"type\": \"short-form\",
            \"title\": \"Monday motivation tip aligned with core message\"
          },
          {
            \"type\": \"newsletter\",
            \"title\": \"Weekly strategy breakdown from expertise pillar\"
          }
        ],
        Tuesday: [
          {
            \"type\": \"tweet\",
            \"title\": \"Quick insight about industry trend\"
          },
          {
            \"type\": \"carousel\",
            \"title\": \"Step-by-step process visual from unique mechanism\"
          }
        ]"
        
        ## 5. CONVERSION FUNNEL
        
        ### Awareness Stage
        Include specific platforms, content strategies, lead magnet ideas, and outreach approaches tailored to the user's industry.
        
        Example for Online Course Creator:
        "Goal: Generate awareness among potential students who don't realize they need your expertise\nContent Strategy: ['YouTube tutorials covering frequently searched problems in your niche', 'Participating in relevant podcasts as a guest expert']\nLead Magnet: '5-Day Email Challenge: Mastering [Specific Skill] Fundamentals with Daily 15-Minute Exercises'\nOutreach: 'Strategic comments on viral industry posts offering genuine value and subtle expertise demonstration'"
        
        ### Active Followers Stage
        Suggest specific strategies to nurture followers into paying clients/customers.
        
        Example for Web Designer:
        "Goal: Convert engaged followers into discovery call bookings\nStrategies: ['Weekly website review livestreams where you analyze follower-submitted websites', 'Limited-time portfolio reviews with actionable feedback delivered via voice notes', 'Behind-the-scenes case studies revealing your unique design process']"
        
        ### Conversion Stage (Optional)
        Based on the industry and content type, decide if an additional conversion stage is needed. If appropriate, include specific strategies to convert active followers into paying customers, suggest offers, and provide a compelling call to action.
        
        Example for Online Course Creator:
        "Goal: Convert engaged prospects into course purchasers\nStrategies: ['Limited enrollment periods with exclusive bonuses', 'Free workshop showcasing a preview of the course content', 'Alumni testimonials highlighting specific outcomes']\nOffers: ['Core course with 6-week curriculum', 'VIP option with 1:1 coaching calls', 'Payment plan options']\nCall To Action: 'Join the waitlist to be notified when enrollment opens and receive a free guide to [Specific Outcome]'"

    Format your response as JSON with this exact structure:
    {
      "nicheAuthority": {
        "fullNiche": "Detailed description of the full niche for the user",
        "coreMessage": "Core brand message that's clear and compelling",
        "uniqueMechanism": "Specific unique approach/mechanism",
        "targetAudience": ["Specific audience segment 1", "Specific audience segment 2"]
      },
      "contentPillars": {
        "expertise": {
          "title": "Expertise (Skills & Knowledge)",
          "contentIdeas": ["Specific article idea 1 with title", "Specific article idea 2 with title"]
        },
        "personalJourney": {
          "title": "Personal Journey (Storytelling & Relatability)",
          "contentIdeas": ["Specific article idea 1 with title", "Specific article idea 2 with title"]
        },
        "clientProof": {
          "title": "Client Proof & Credibility",
          "contentIdeas": ["Specific article idea 1 with title", "Specific article idea 2 with title"]
        }
      },
      "repurposeSystem": {
        "thoughtLeadershipArticle": {
          "headline": "Specific headline example",
          "hook": "Attention-grabbing hook example",
          "storytelling": "Specific storytelling approach",
          "valuePoints": ["Specific value point 1", "Specific value point 2"],
          "cta": "Specific call-to-action example",
          "frequency": (relevant number, 1-7 indicating how many times per week, only return the number)
        },
        "formats": {
          "shortForm": ["Specific short-form post example 1", "Specific short-form post example 2"],
          "shortFormFrequency": (relevant number, 1-7 indicating how many times per week, only return the number),
          "threads": {
            "hook": "Specific thread hook example",
            "body": ["Specific thread point 1", "Specific thread point 2"],
            "cta": "Specific thread CTA example",
            "frequency": (relevant number, 1-7 indicating how many times per week, only return the number)
          }
        }
      },
      "contentCalendar": {
        "days": {
          "monday": [
            { "type": "content-type-1", "title": "Brief description of content 1" },
            { "type": "content-type-2", "title": "Brief description of content 2" }
          ],
          "tuesday": [
            { "type": "content-type-1", "title": "Brief description of content 1" }
          ],
          "wednesday": [
            { "type": "content-type-1", "title": "Brief description of content 1" },
            { "type": "content-type-2", "title": "Brief description of content 2" }
          ],
          "thursday": [
            { "type": "content-type-1", "title": "Brief description of content 1" }
          ],
          "friday": [
            { "type": "content-type-1", "title": "Brief description of content 1" },
            { "type": "content-type-2", "title": "Brief description of content 2" }
          ],
          "saturday": [
            { "type": "content-type-1", "title": "Brief description of content 1" }
          ],
          "sunday": [
            { "type": "content-type-1", "title": "Brief description of content 1" }
          ]
        }
      },
      "conversionFunnel": {
        "awareness": {
          "goal": "Specific awareness stage goal",
          "contentStrategy": ["Specific strategy 1", "Specific strategy 2"],
          "leadMagnet": "Specific lead magnet idea",
          "outreach": "Specific outreach strategy"
        },
        "activeFollowers": {
          "goal": "Specific active followers stage goal",
          "strategies": ["Specific strategy 1", "Specific strategy 2"]
        },
        "conversion": {
          "goal": "Specific conversion stage goal",
          "strategies": ["Specific strategy 1", "Specific strategy 2"],
          "offers": ["Specific offer 1", "Specific offer 2"],
          "callToAction": "Specific call-to-action"
        }
      }
    }`;

    // Determine which model to use based on user's selection
    let modelToUse = process.env.USE_AKASH === "true" ? models.akash : models.github;
    
    // Override with DeepSeek model if quality is selected
    if (data.modelType === 'quality') {
      modelToUse = DEEPSEEK_MODEL;
      console.log(`Using higher quality model: ${modelToUse} for writing protocol generation`);
    } else {
      console.log(`Using fast model: ${modelToUse} for writing protocol generation`);
    }

    try {
      // Check if AI client is available
      if (!githubAIClient) {
        throw new Error("AI service is not configured");
      }
      
      // Send request to AI
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
      let aiGeneratedContent;
      try {
        const responseContent = completion.choices[0].message.content || "";
        
        // First, clean up any special thinking sections from DeepSeek or other models
        let jsonContent = responseContent;
        
        // Remove any thinking sections in various formats
        const thinkingPatterns = [
          /<think>[\s\S]*?<\/think>/gm,           // <think>...</think>
          /<details.*?>[\s\S]*?<\/details>/gm,    // <details>...</details>
          /```json\s*([\s\S]*?)```/gm,            // ```json ... ```
        ];
        
        // Apply each pattern to remove thinking sections
        thinkingPatterns.forEach(pattern => {
          // For JSON code blocks, we want to extract the content, not remove it
          if (pattern.toString().includes('```json')) {
            const matches = [...jsonContent.matchAll(pattern)];
            if (matches.length > 0) {
              // Use the first JSON code block found
              jsonContent = matches[0][1];
            }
          } else {
            // For other patterns, remove them entirely
            jsonContent = jsonContent.replace(pattern, '').trim();
          }
        });
        
        // Look for the actual JSON content if we haven't yet found it
        if (!isValidJSON(jsonContent)) {
          // Find the first occurrence of a JSON object
          const jsonStartIndex = jsonContent.indexOf('{');
          const jsonEndIndex = jsonContent.lastIndexOf('}');
          
          if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
            jsonContent = jsonContent.substring(jsonStartIndex, jsonEndIndex + 1);
          }
        }
        
        // Additional cleanup for any JSON formatting errors
        // Sometimes the model adds an extra comma at the end of an object
        jsonContent = jsonContent.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        
        // Log the cleaned content for debugging
        console.log("Cleaned content for parsing:", jsonContent.substring(0, 100) + "...");
        
        try {
          aiGeneratedContent = JSON.parse(jsonContent);
        } catch (parseError) {
          console.error("Initial parsing failed:", parseError);
          
          // Last resort: try to manually fix common JSON syntax errors
          const fixedContent = fixCommonJsonErrors(jsonContent);
          console.log("Attempting with fixed content:", fixedContent.substring(0, 100) + "...");
          aiGeneratedContent = JSON.parse(fixedContent);
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        console.log("Raw response:", completion.choices[0].message.content);
        
        // Update protocol with error status
        await WritingProtocol.findByIdAndUpdate(protocolId, {
          status: 'failed',
          statusMessage: 'Failed to parse AI response. Please try again.'
        });
        return;
      }

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

      // Update the protocol with the generated content and set status to completed
      await WritingProtocol.findByIdAndUpdate(protocolId, {
        aiGeneratedContent: {
          ...aiGeneratedContent
        },
        status: 'completed'
      });

      console.log(`Successfully generated and updated protocol ${protocolId}`);
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      
      // Update protocol with error status
      await WritingProtocol.findByIdAndUpdate(protocolId, {
        status: 'failed',
        statusMessage: aiError.message || 'Failed to generate writing protocol. Please try again.'
      });
    }
  } catch (error) {
    console.error("Background protocol generation error:", error);
    
    // Update protocol with error status
    try {
      await WritingProtocol.findByIdAndUpdate(protocolId, {
        status: 'failed',
        statusMessage: error.message || 'An unexpected error occurred. Please try again.'
      });
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