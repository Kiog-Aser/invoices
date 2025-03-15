import { NextResponse } from "next/server";
import { connectToDatabase } from "@/libs/mongo";
import { ObjectId } from "mongodb";

// Define the config type
type WebsiteConfig = {
  startDelay?: number;
  displayDuration?: number;
  cycleDuration?: number;
  loop?: boolean;
  showCloseButton?: boolean;
  theme?: string;
  updatedAt?: Date;
};

export async function GET(req: Request, { params }: { params: { websiteId: string } }) {
  try {
    const { db } = await connectToDatabase();
    
    // Try to find website with both ObjectId and string ID
    let website;
    if (ObjectId.isValid(params.websiteId)) {
      website = await db.collection("websites").findOne({
        _id: new ObjectId(params.websiteId)
      });
    }

    if (!website) {
      website = await db.collection("websites").findOne({
        websiteId: params.websiteId
      });
    }

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Check if user is pro
    const user = await db.collection("users").findOne({
      email: website.userId
    });
    const isPro = user?.plan === 'pro';

    // Get notifications for this website
    const websiteId = website._id.toString();
    const notifications = await db
      .collection("notifications")
      .find({ websiteId })
      .sort({ createdAt: -1 })
      .toArray();

    // Get config from websiteConfigs collection
    const websiteConfigDoc = await db.collection("websiteConfigs").findOne({
      websiteId: params.websiteId
    });
    
    // Cast the config to our type
    const websiteConfig: WebsiteConfig | null = websiteConfigDoc ? {
      startDelay: websiteConfigDoc.startDelay,
      displayDuration: websiteConfigDoc.displayDuration,
      cycleDuration: websiteConfigDoc.cycleDuration,
      loop: websiteConfigDoc.loop,
      showCloseButton: websiteConfigDoc.showCloseButton,
      theme: websiteConfigDoc.theme,
      updatedAt: websiteConfigDoc.updatedAt
    } : null;

    // Transform for public consumption and ensure all necessary fields
    const transformedNotifications = notifications.map(n => ({
      id: n._id.toString(),
      title: n.title || "",
      message: n.message || "", // Keep message field for compatibility
      body: n.message || "", // Add body field for new embed script
      image: n.image || "",
      url: isPro ? (n.url || "") : "https://www.notifast.fun", // Force NotiFast URL for free users
      timestamp: n.timestamp || "now"
    }));

    // Return the data in the format the embed script expects
    return NextResponse.json({
      notifications: transformedNotifications,
      config: {
        startDelay: websiteConfig?.startDelay || 500,
        displayDuration: websiteConfig?.displayDuration || 5000,
        cycleDuration: websiteConfig?.cycleDuration || 3000,
        loop: isPro ? (websiteConfig?.loop || false) : false,
        showCloseButton: isPro ? (websiteConfig?.showCloseButton || false) : false,
        theme: isPro ? (websiteConfig?.theme || "ios") : "ios"
      }
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}