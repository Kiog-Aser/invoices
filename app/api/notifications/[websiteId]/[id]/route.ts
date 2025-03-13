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
    
    return NextResponse.json({ccessing properties
      ...updatedNotification, {
      id: updatedNotification._id.toString(),ed to find updated notification" }, { status: 404 });
      _id: updatedNotification._id.toString()
    });
  } catch (error) {onse.json({
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }   _id: updatedNotification._id.toString()
}   });
  } catch (error) {
// DELETE a specific notification notification:", error);
export async function DELETE({ error: "Failed to update notification" }, { status: 500 });
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {TE a specific notification
    const session = await getServerSession(authOptions);
    q: NextRequest,
    if (!session?.user?.email) {ring } }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } {
    const session = await getServerSession(authOptions);
    const { id } = params;
    if (!session?.user?.email) {
    // Validate ID format for MongoDBr: "Unauthorized" }, { status: 401 });
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }onst { id } = params;
    
    const { db } = await connectToDatabase();
    if (!ObjectId.isValid(id)) {
    // First check if the notification exists and belongs to the user{ status: 400 });
    const existingNotification = await db.collection("notifications").findOne({
      _id: new ObjectId(id),
      userId: session.user.emailToDatabase();
    });
    // First check if the notification exists and belongs to the user
    if (!existingNotification) { await db.collection("notifications").findOne({
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    } userId: session.user.email
    });
    // Delete the notification
    const result = await db.collection("notifications").deleteOne({
      _id: new ObjectId(id)son({ error: "Notification not found" }, { status: 404 });
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Notification not deleted" }, { status: 500 });
    } _id: new ObjectId(id)
    });
    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {tedCount === 0) {
    console.error("Error deleting notification:", error); deleted" }, { status: 500 });
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  } 
}   return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}