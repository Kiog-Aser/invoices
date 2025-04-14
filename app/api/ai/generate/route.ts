import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { models, getRotatingAkashClient, QUALITY_MODEL } from "@/libs/akash-ai";

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

    // Get request body
    const { prompt, type, commandId, modelType, useAkashAPI } = await req.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Determine which model to use based on user's selection and preferences
    // If useAkashAPI is set to true in the request, use Akash regardless of env settings
    let forceAkash = useAkashAPI === true;
    let modelToUse = models.akash // Default to fast model
    
    // Override with QUALITY_MODEL if quality is selected
    if (modelType === 'quality') {
      modelToUse = QUALITY_MODEL;
      console.log(`Using higher quality model: ${modelToUse} for AI content generation`);
    } else {
      console.log(`Using fast model: ${modelToUse} for AI content generation`);
    }

    try {
      let aiResponse: string = '';
      
      // Check if we should use the rotating Akash client
      if (forceAkash || process.env.USE_AKASH === "true") {
        console.log("Using rotating Akash client for AI content generation");
        
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
            max_tokens: 2048
          });
          
          // Process the completion
          aiResponse = completion.choices[0]?.message?.content || 
            "Sorry, I couldn't generate a response. Please try again.";
          
          console.log(`Successfully generated AI content for command ${commandId}`);
        } finally {
          // Always release the client back to the pool
          rotatingClient.release();
        }
      };

      return NextResponse.json({ 
        success: true, 
        response: aiResponse,
        commandId
      });
      
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);
      
      return NextResponse.json(
        { 
          error: aiError.message || "Failed to generate content", 
          commandId 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("AI Content Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}