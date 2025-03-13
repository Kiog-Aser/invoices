import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/libs/mongo";
import { authOptions } from "@/libs/next-auth";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { websiteId } = params;
    const { db } = await connectToDatabase();
    
    // Try to find website with both ObjectId and string ID
    let website;
    if (ObjectId.isValid(websiteId)) {
      website = await db.collection("websites").findOne({
        _id: new ObjectId(websiteId),
        userId: session.user.email
      });
    }
    
    if (!website) {
      website = await db.collection("websites").findOne({
        websiteId,
        userId: session.user.email
      });
    }
    
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
    
    // Return with consistent ID format
    return NextResponse.json({
      ...website,
      websiteId: website.websiteId || website._id.toString(),
      _id: website._id.toString()
    });
  } catch (error) {
    console.error("Error fetching website:", error);
    return NextResponse.json({ error: "Failed to fetch website data" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { websiteId } = params;
    const { config } = await req.json();
    
    if (!config || typeof config !== "object") {
      return NextResponse.json({ error: "Invalid config data" }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Verify website ownership with both ID formats
    let website;
    if (ObjectId.isValid(websiteId)) {
      website = await db.collection("websites").findOne({
        _id: new ObjectId(websiteId),
        userId: session.user.email
      });
    }
    
    if (!website) {
      website = await db.collection("websites").findOne({
        websiteId,
        userId: session.user.email
      });
    }
    
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
    
    // Update using the correct ID format
    const updateQuery = ObjectId.isValid(websiteId)
      ? { _id: new ObjectId(websiteId) }
      : { websiteId };
    
    // Only update the config and updatedAt timestamp
    const result = await db.collection("websites").updateOne(
      updateQuery,
      {
        $set: {
          config,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 });
    }
    
    // Return the updated website
    return NextResponse.json({
      success: true,
      message: "Settings updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating website:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}