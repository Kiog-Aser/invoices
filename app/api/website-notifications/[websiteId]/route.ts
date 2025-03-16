import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/libs/mongo";
import { authOptions } from "@/libs/next-auth";
import { ObjectId } from "mongodb";
import { Notification } from "@/models/Notification";

// Default config that should be used consistently
const DEFAULT_CONFIG = {
  startDelay: 500,
  displayDuration: 30000,
  cycleDuration: 3000,
  loop: false,
  showCloseButton: false,
  theme: "ios",
  maxVisibleNotifications: 5
};

export async function GET(req: NextRequest, { params }: { params: { websiteId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { websiteId } = params;
    const { db } = await connectToDatabase();
    
    // Verify website ownership and get website data
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

    // Return with merged default config and notifications from website document
    return NextResponse.json({ 
      website,
      config: {
        ...DEFAULT_CONFIG,
        ...(website.config || {}),
      },
      notifications: (website.notifications || []).map((n: any) => ({
        id: n.id || n._id?.toString(),
        title: n.title || "",
        message: n.message || "",
        image: n.image || "",
        timestamp: n.timestamp || "now",
        url: n.url || "",
        delay: n.delay || 0
      }))
    });

  } catch (error) {
    console.error("Error fetching website notifications:", error);
    return NextResponse.json({ error: "Failed to fetch website notifications" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { websiteId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { websiteId } = params;
    const { notifications, config } = await req.json();
    
    const { db } = await connectToDatabase();

    // Check if user is pro
    const user = await db.collection("users").findOne({
      email: session.user.email
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const isPro = user.plan === 'pro';
    
    // Verify website ownership
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

    // Validate notification count for free users
    if (!isPro && notifications?.length > 5) {
      return NextResponse.json({ 
        error: "Free users are limited to 5 notifications" 
      }, { status: 403 });
    }

    // Validate and sanitize config based on user's plan
    const sanitizedConfig = {
      startDelay: config?.startDelay || 500,
      displayDuration: config?.displayDuration || 30000,
      cycleDuration: config?.cycleDuration || 3000,
      maxVisibleNotifications: config?.maxVisibleNotifications || 5,
      theme: isPro ? (config?.theme || 'ios') : 'ios',
      loop: isPro ? Boolean(config?.loop) : false,
      showCloseButton: isPro ? Boolean(config?.showCloseButton) : false
    };

    // Sanitize notifications
    const sanitizedNotifications = notifications?.map((notification: Partial<Notification>) => ({
      ...notification,
      url: isPro ? notification.url : '', // Remove URLs for free users
    })) || [];

    // Update in database
    await db.collection("websites").updateOne(
      { _id: website._id },
      {
        $set: {
          notifications: sanitizedNotifications,
          config: sanitizedConfig,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { websiteId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { websiteId } = params;
    const { id } = await req.json();
    
    const { db } = await connectToDatabase();
    
    // Verify website ownership
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

    // Remove notification from the notifications array
    await db.collection("websites").updateOne(
      { _id: website._id },
      { 
        $pull: { 
          notifications: { id: id }
        }
      }
    );

    return NextResponse.json({ message: "Notification deleted successfully" });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}