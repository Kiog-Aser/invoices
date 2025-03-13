import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/libs/mongo";
import { authOptions } from "@/libs/next-auth";
import { ObjectId } from "mongodb";

// Default config that should be used consistently
const DEFAULT_CONFIG = {
  startDelay: 500,
  displayDuration: 30000,
  cycleDuration: 3000,
  loop: false,
  showCloseButton: false,
  theme: "ios"
};

export async function GET(req: NextRequest, { params }: { params: { websiteId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { websiteId } = params;
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

    // Get config from websiteConfigs collection
    const config = await db.collection("websiteConfigs").findOne({
      websiteId,
      userId: session.user.email
    });

    // Get notifications for this website
    const websiteIdStr = website._id.toString();
    const notifications = await db
      .collection("notifications")
      .find({ websiteId: websiteIdStr })
      .toArray();

    // Return with merged default config
    return NextResponse.json({ 
      website,
      config: {
        ...DEFAULT_CONFIG,
        ...(config || {}),
      },
      notifications: notifications.map(n => ({
        id: n._id.toString(),
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
    
    const websiteIdStr = website._id.toString();
    
    // Update website config in websiteConfigs collection
    if (config) {
      // Merge with default config to ensure all fields exist
      const mergedConfig = {
        ...DEFAULT_CONFIG,
        ...config,
        updatedAt: new Date()
      };

      // Use upsert to create or update using websiteId directly
      await db.collection("websiteConfigs").updateOne(
        { 
          websiteId,
          userId: session.user.email 
        },
        {
          $set: mergedConfig
        },
        { upsert: true }
      );
    }
    
    // Update notifications if provided
    if (notifications && Array.isArray(notifications)) {
      // First remove existing notifications
      await db.collection("notifications").deleteMany({
        websiteId: websiteIdStr
      });
      
      // Then insert new ones
      if (notifications.length > 0) {
        const notificationsToInsert = notifications.map(notification => ({
          title: notification.title || "",
          message: notification.message || "",
          image: notification.image || "",
          timestamp: notification.timestamp || "now",
          delay: notification.delay || 0,
          url: notification.url || "",
          websiteId: websiteIdStr,
          userId: session.user.email,
          createdAt: new Date()
        }));
        
        await db.collection("notifications").insertMany(notificationsToInsert);
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Website notifications updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating website notifications:", error);
    return NextResponse.json({ error: "Failed to update website notifications" }, { status: 500 });
  }
}