import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import FeatureRequest from "@/models/FeatureRequest";

// GET a specific feature request
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate the ID parameter
    if (!params.id || params.id === "undefined") {
      return NextResponse.json(
        { error: "Invalid feature request ID" },
        { status: 400 }
      );
    }

    await connectMongo();
    
    // Find the feature request
    const featureRequest = await FeatureRequest.findById(params.id);
    
    if (!featureRequest) {
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(featureRequest);
  } catch (error) {
    console.error("Error fetching feature request:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature request" },
      { status: 500 }
    );
  }
}

// PATCH to update a feature request (admin only for status updates)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const data = await req.json();
    const { status, comment, anonymousName } = data;
    
    // For status updates, require admin authentication
    if (status) {
      if (!session?.user) {
        return NextResponse.json(
          { error: "You must be logged in" },
          { status: 401 }
        );
      }
      
      if (!session.user.isAdmin) {
        return NextResponse.json(
          { error: "Only admins can update the status" },
          { status: 403 }
        );
      }
    }
    
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
    
    // Update status if provided (admin only)
    if (status && session?.user?.isAdmin) {
      featureRequest.status = status;
    }
    
    // Add comment if provided
    if (comment) {
      if (session?.user) {
        // For logged-in users
        featureRequest.comments.push({
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name || "Anonymous",
          text: comment,
        });
      } else {
        // For anonymous users
        featureRequest.comments.push({
          userId: "anonymous",
          userEmail: "anonymous",
          userName: anonymousName || "Anonymous",
          text: comment,
        });
      }
    }
    
    await featureRequest.save();
    
    return NextResponse.json(featureRequest);
  } catch (error) {
    console.error("Error updating feature request:", error);
    return NextResponse.json(
      { error: "Failed to update feature request" },
      { status: 500 }
    );
  }
}

// DELETE a feature request (admin only or original creator)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }
    
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
    
    // Only allow admins or the original creator to delete
    if (!session.user.isAdmin && featureRequest.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this feature request" },
        { status: 403 }
      );
    }
    
    await FeatureRequest.findByIdAndDelete(params.id);
    
    return NextResponse.json(
      { message: "Feature request deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting feature request:", error);
    return NextResponse.json(
      { error: "Failed to delete feature request" },
      { status: 500 }
    );
  }
}
