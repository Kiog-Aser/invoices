import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import FeatureRequest from "@/models/FeatureRequest";

// POST to vote on a feature request
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Validate the ID parameter
    if (!params.id || params.id === "undefined") {
      return NextResponse.json(
        { error: "Invalid feature request ID" },
        { status: 400 }
      );
    }
    
    await connectMongo();
    
    const featureRequest = await FeatureRequest.findById(params.id);
    
    if (!featureRequest) {
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 }
      );
    }
    
    // Check if this is an anonymous vote or authenticated vote
    if (!session?.user) {
      // Handle anonymous vote - use a special ID
      const anonymousId = "anonymous";
      
      // Check if the anonymous user has already voted
      const hasVoted = featureRequest.votes.includes(anonymousId);
      
      if (hasVoted) {
        // Remove vote (toggle)
        featureRequest.votes = featureRequest.votes.filter(id => id !== anonymousId);
      } else {
        // Add vote
        featureRequest.votes.push(anonymousId);
      }
      
      await featureRequest.save();
      
      return NextResponse.json({
        message: hasVoted ? "Anonymous vote removed" : "Anonymous vote added",
        voteCount: featureRequest.votes.length,
        hasVoted: !hasVoted
      });
    } else {
      // Handle authenticated vote
      const userId = session.user.id;
      
      // Check if user has already voted
      const hasVoted = featureRequest.votes.includes(userId);
      
      if (hasVoted) {
        // Remove vote (toggle)
        featureRequest.votes = featureRequest.votes.filter(id => id !== userId);
      } else {
        // Add vote
        featureRequest.votes.push(userId);
      }
      
      await featureRequest.save();
      
      return NextResponse.json({
        message: hasVoted ? "Vote removed" : "Vote added",
        voteCount: featureRequest.votes.length,
        hasVoted: !hasVoted
      });
    }
  } catch (error) {
    console.error("Error voting on feature request:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
