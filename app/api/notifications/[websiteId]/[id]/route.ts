import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/libs/mongo";
import { authOptions } from "@/libs/next-auth";
import { ObjectId } from "mongodb";

// GET a specific notification
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    // Validate ID format for MongoDB
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    const notification = await db.collection("notifications").findOne({
      _id: new ObjectId(id),
      userId: session.user.email
    });
    
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      ...notification,
      id: notification._id.toString(),
      _id: notification._id.toString()
    });
  } catch (error) {
    console.error("Error getting notification:", error);
    return NextResponse.json({ error: "Failed to fetch notification" }, { status: 500 });
  }
}

// PUT/UPDATE a specific notification
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    // Validate ID format for MongoDB
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }
    
    const updates = await req.json();
    
    // Sanitize and validate the updates
    const sanitizedUpdates = {
      ...updates,
      title: updates.title || "",
      message: updates.message || "",
      image: updates.image || "",
      timestamp: updates.timestamp || "now",
      delay: updates.delay || 0,
      url: updates.url || "", // Explicitly include URL
      updatedAt: new Date()
    };

    const { db } = await connectToDatabase();
    
    // First check if the notification exists and belongs to the user
    const existingNotification = await db.collection("notifications").findOne({
      _id: new ObjectId(id),
      userId: session.user.email
    });
    
    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    
    // Update the notification with sanitized data
    const result = await db.collection("notifications").updateOne(
      { _id: new ObjectId(id) },
      { $set: sanitizedUpdates }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 });
    }
    
    // Get the updated notification
    const updatedNotification = await db.collection("notifications").findOne({
      _id: new ObjectId(id)
    });
    
    return NextResponse.json({
      ...updatedNotification,
      id: updatedNotification._id.toString(),
      _id: updatedNotification._id.toString()
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

// DELETE a specific notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    // Validate ID format for MongoDB
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // First check if the notification exists and belongs to the user
    const existingNotification = await db.collection("notifications").findOne({
      _id: new ObjectId(id),
      userId: session.user.email
    });
    
    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    
    // Delete the notification
    const result = await db.collection("notifications").deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Notification not deleted" }, { status: 500 });
    }
    
    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}