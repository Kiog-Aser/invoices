import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Feedback from "@/models/Feedback";

// GET a specific feedback (admin or creator only)
export async function GET(
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
    
    await connectMongo();
    
    const feedback = await Feedback.findById(params.id);
    
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }
    
    // Only allow the creator or admins to view
    if (feedback.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// PATCH to update a feedback (admin only for status updates)
export async function PATCH(
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
    
    await connectMongo();
    
    const feedback = await Feedback.findById(params.id);
    
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }
    
    const { status, adminResponse } = await req.json();
    
    // Only admins can update status or add admin response
    if ((status || adminResponse) && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can update status or respond to feedback" },
        { status: 403 }
      );
    }
    
    // Update fields if provided
    if (status) {
      feedback.status = status;
    }
    
    if (adminResponse !== undefined) {
      feedback.adminResponse = adminResponse;
    }
    
    await feedback.save();
    
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

// DELETE a feedback (admin only or original creator)
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
    
    await connectMongo();
    
    const feedback = await Feedback.findById(params.id);
    
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }
    
    // Only allow admins or the original creator to delete
    if (!session.user.isAdmin && feedback.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this feedback" },
        { status: 403 }
      );
    }
    
    await Feedback.findByIdAndDelete(params.id);
    
    return NextResponse.json(
      { message: "Feedback deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
