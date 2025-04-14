import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import WritingProtocol from "@/models/WritingProtocol";


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Use consistent userId format with what we used during protocol creation
    const userId = session.user.id || session.user.email;
    
    // Enhanced logging for debugging
    console.log("Fetching protocol with ID:", params.id);
    
    let protocol;
    try {
      // Check if the id param is a valid MongoDB ObjectId (24 hex characters)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(params.id);
      
      if (isValidObjectId) {
        // First try with the ID directly
        protocol = await WritingProtocol.findOne({
          _id: params.id,
          userId
        });
        
        // If not found, try with just the ID (ignore userId constraint for testing)
        if (!protocol) {
          protocol = await WritingProtocol.findById(params.id);
          console.log("Found protocol by ID only:", !!protocol);
        }
      } else {
        // If not a valid ObjectId, try to find by title
        console.log("Looking up protocol by title:", params.id);
        protocol = await WritingProtocol.findOne({
          title: params.id,
          userId
        });
        
        // If not found, try without userId constraint for testing
        if (!protocol) {
          protocol = await WritingProtocol.findOne({
            title: params.id
          });
          console.log("Found protocol by title only:", !!protocol);
        }
      }
    } catch (err) {
      console.error("Error finding protocol:", err);
    }

    if (!protocol) {
      return NextResponse.json({ error: "Protocol not found" }, { status: 404 });
    }

    return NextResponse.json(protocol);
  } catch (error) {
    console.error("Error fetching protocol:", error);
    return NextResponse.json(
      { error: "Failed to fetch protocol" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Get the userId consistently
    const userId = session.user.id || session.user.email;
    
    // Validate ID parameter
    if (!params.id) {
      console.error("Missing protocol ID");
      return NextResponse.json({ error: "Missing protocol ID" }, { status: 400 });
    }

    // Log the deletion attempt for debugging
    console.log("Deleting protocol with ID:", params.id);
    
    try {
      // Use findOneAndDelete with better error handling
      const result = await WritingProtocol.findOneAndDelete({
        _id: params.id,
        userId: userId
      });

      if (!result) {
        console.log("Protocol not found for deletion");
        return NextResponse.json({ error: "Protocol not found" }, { status: 404 });
      }
      
      console.log("Protocol deleted successfully");
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("Error in MongoDB deletion operation:", err);
      return NextResponse.json({ error: "Invalid protocol ID format" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error deleting protocol:", error);
    return NextResponse.json(
      { error: "Failed to delete protocol" },
      { status: 500 }
    );
  }
}