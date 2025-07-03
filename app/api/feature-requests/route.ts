import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import FeatureRequest from "@/models/FeatureRequest";

// GET all feature requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    await connectMongo();

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    
    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    
    // Get feature requests
    const featureRequests = await FeatureRequest.find(query)
      .sort({ createdAt: -1 });
    
    return NextResponse.json(featureRequests);
  } catch (error) {
    console.error("Error fetching feature requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature requests" },
      { status: 500 }
    );
  }
}

// POST a new feature request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    await connectMongo();
    
    const data = await req.json();
    const { title, description, anonymous, userName } = data;
    
    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }
    
    // Create feature request - handle both authenticated and anonymous users
    let featureRequest;
    
    if (session?.user) {
      // Authenticated user submission
      featureRequest = new FeatureRequest({
        title,
        description,
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name || "Anonymous User",
        votes: [session.user.id], // Auto-vote for your own feature request
      });
    } else {
      // Anonymous user submission
      featureRequest = new FeatureRequest({
        title,
        description,
        userId: "anonymous",
        userEmail: "anonymous@user.com",
        userName: userName || "Anonymous User",
        votes: ["anonymous"], // Auto-vote for your own feature request
      });
    }
    
    await featureRequest.save();
    
    return NextResponse.json(featureRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating feature request:", error);
    return NextResponse.json(
      { error: "Failed to create feature request" },
      { status: 500 }
    );
  }
}
