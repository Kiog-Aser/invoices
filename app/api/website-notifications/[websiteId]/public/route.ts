import { NextResponse } from "next/server";
import { connectToDatabase } from "@/libs/mongo";
import { ObjectId } from "mongodb";

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

    // Get notifications for this website
    const websiteId = website._id.toString();
    const notifications = await db
      .collection("notifications")
      .find({ websiteId })
      .sort({ createdAt: -1 })
      .toArray();

    // Get config from websiteConfigs collection
    const websiteConfig = await db.collection("websiteConfigs").findOne({
      websiteId: params.websiteId
    });

    // Transform for public consumption and ensure all necessary fields
    const transformedNotifications = notifications.map(n => ({
      id: n._id.toString(),
      title: n.title || "",
      message: n.message || "", // Keep message field for compatibility
      body: n.message || "", // Add body field for new embed script
      image: n.image || "",
      url: n.url || "",
      timestamp: n.timestamp || "now"
    }));

    // Return the data in the format the embed script expects
    return NextResponse.json({
      notifications: transformedNotifications,
      config: websiteConfig || {
        startDelay: 500,
        displayDuration: 5000,
        cycleDuration: 3000,
        loop: false,
        showCloseButton: true,
        theme: "ios"
      }
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}