import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Feedback from "@/models/Feedback";

// GET all feedback (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }
    
    // Only admins can see all feedback
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    await connectMongo();
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    
    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    
    const feedback = await Feedback.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// POST a new feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to submit feedback" },
        { status: 401 }
      );
    }
    
    await connectMongo();
    
    const { content, isPublic } = await req.json();
    
    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: "Feedback content is required" },
        { status: 400 }
      );
    }
    
    // Create new feedback
    const feedback = new Feedback({
      content,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name || "Anonymous",
      isPublic: isPublic === true // Default to false if not explicitly set
    });
    
    await feedback.save();
    
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}
