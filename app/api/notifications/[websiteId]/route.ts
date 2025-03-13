import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/libs/mongo";
import { authOptions } from "@/libs/next-auth";
import { ObjectId } from "mongodb";
import { url } from "inspector";

export async function GET(req: NextRequest, { params }: { params: { websiteId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { websiteId } = params;
    const { db } = await connectToDatabase();
    
    // Verify website ownership before returning notifications
    const website = await db.collection("websites").findOne({
      _id: new ObjectId(websiteId),
      userId: session.user.email
    });
    
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
    
    // Get notifications for this website
    const notifications = await db
      .collection("notifications")
      .find({ websiteId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Transform notifications for frontend
    const transformedNotifications = notifications.map(notification => ({
      id: notification._id.toString(),
      title: notification.title || "",
      message: notification.message || "",
      image: notification.image || "",
      timestamp: notification.timestamp || "now",
      delay: notification.delay || 0
      url: notification.url || "",
    }));
    
    return NextResponse.json(transformedNotifications);
    
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { websiteId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { websiteId } = params;
    const { notifications } = await req.json();
    
    if (!notifications || !Array.isArray(notifications)) {
      return NextResponse.json({ error: "Invalid notifications data" }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Verify website ownership
    const website = await db.collection("websites").findOne({
      _id: new ObjectId(websiteId),
      userId: session.user.email
    });
    
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
    
    // Delete existing notifications
    await db.collection("notifications").deleteMany({
      websiteId,
      userId: session.user.email
    });
    
    // Insert new notifications if any
    if (notifications.length > 0) {
      const notificationsToInsert = notifications.map(notification => ({
        title: notification.title || "",
        message: notification.message || "",
        image: notification.image || "",
        timestamp: notification.timestamp || "now",
        delay: notification.delay || 0,
        websiteId,
        userId: session.user.email,
        createdAt: new Date()
      }));
      
      await db.collection("notifications").insertMany(notificationsToInsert);
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Saved ${notifications.length} notifications` 
    });
    
  } catch (error) {
    console.error("Error saving notifications:", error);
    return NextResponse.json({ error: "Failed to save notifications" }, { status: 500 });
  }
}