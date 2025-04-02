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

    // Create a structured prompt for the AI API
    const prompt = `Generate a writing protocol for a ${userRole} in the ${industry} industry who creates ${contentTypes.join(", ")}. 
    Their goals are: ${goals.join(", ")}. 
    Their challenges are: ${challenges.join(", ")}.
    
    The writing protocol should be titled: "${title}"
    
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
      },
      }
    }`;

    // Determine which model to use based on user's selection
    let modelToUse = process.env.USE_AKASH === "true" ? models.akash : models.github;
    
    // Override with DeepSeek model if quality is selected
    if (modelType === 'quality') {
      modelToUse = DEEPSEEK_MODEL;
      console.log(`Using higher quality model: ${modelToUse} for writing protocol generation`);
    } else {
      console.log(`Using fast model: ${modelToUse} for writing protocol generation`);
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

    // Parse the AI response as JSON, handling any "thinking" sections
    let aiGeneratedContent;
    try {
      const responseContent = completion.choices[0].message.content || "";
      
      // Check if we're dealing with a response that might have thinking sections (DeepSeek model)
      if (modelType === 'quality') {
        // Extract only the JSON part by removing any thinking sections
        // Thinking sections might look like: <details type="reasoning" done="true" duration="105">...</details>
        
        // First, try to find JSON content directly
        let jsonContent = responseContent;
        
        // Remove any thinking sections that might be at the beginning
        const thinkingSectionRegex = /<details.*?>[\s\S]*?<\/details>/gm;
        jsonContent = jsonContent.replace(thinkingSectionRegex, '').trim();
        
        // If still no valid JSON, check if there's text before the JSON
        if (!isValidJSON(jsonContent)) {
          // Look for the first '{' character that starts a JSON object
          const jsonStartIndex = jsonContent.indexOf('{');
          if (jsonStartIndex > 0) {
            jsonContent = jsonContent.substring(jsonStartIndex);
          }
        }
        
        // Log the cleaned content
        console.log("Cleaned content for parsing:", jsonContent.substring(0, 100) + "...");
        
        aiGeneratedContent = JSON.parse(jsonContent);
      } else {
        // Standard model response - just parse normally
        aiGeneratedContent = JSON.parse(responseContent);
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.log("Raw response:", completion.choices[0].message.content);
      throw new Error("Failed to parse AI response. The model returned an invalid format.");
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

    // Log the AI's response to see what's being generated
    console.log("=============== AI RESPONSE START ===============");
    console.log(JSON.stringify(aiGeneratedContent, null, 2));
    console.log("=============== AI RESPONSE END ===============");

    // Create new protocol instance with properly formatted aiGeneratedContent
    const protocol = new WritingProtocol({
      userId: session.user.id || session.user.email, // Use ID if available, fallback to email
      title,
      userRole,
      industry,
      contentTypes,
      goals,
      challenges,
      // Directly use the AI generated content structure which matches our schema
      aiGeneratedContent: {
        ...aiGeneratedContent
      }
    });

    // Log the protocol object before saving to see what structure is going to the DB
    console.log("=============== PROTOCOL OBJECT START ===============");
    console.log(JSON.stringify(protocol.toObject(), null, 2));
    console.log("=============== PROTOCOL OBJECT END ===============");

    await protocol.save();

    return NextResponse.json({ 
      success: true, 
      ...protocol.toJSON()
    });
  } catch (error: any) {
    console.error("Writing Protocol Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
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

    // Fetch user's writing protocols
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