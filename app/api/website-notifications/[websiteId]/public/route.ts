import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/libs/mongo";
import { ObjectId } from "mongodb";
import { Notification } from "@/models/Notification";

interface WebsiteConfig {
  startDelay?: number;
  displayDuration?: number;
  cycleDuration?: number;
  maxVisibleNotifications?: number;
  theme?: string;
  loop?: boolean;
  showCloseButton?: boolean;
}

const DEFAULT_CONFIG: WebsiteConfig = {
  startDelay: 500,
  displayDuration: 30000,
  cycleDuration: 3000,
  maxVisibleNotifications: 5,
  theme: 'ios',
  loop: false,
  showCloseButton: false
};

export async function GET(req: NextRequest, { params }: { params: { websiteId: string } }) {
  try {
    const { websiteId } = params;
    const { db } = await connectToDatabase();
    
    // Find website and its owner
    let website;
    if (ObjectId.isValid(websiteId)) {
      website = await db.collection("websites").findOne({
        _id: new ObjectId(websiteId)
      });
    }
    
    if (!website) {
      website = await db.collection("websites").findOne({ websiteId });
    }
    
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Get user's plan status
    const user = await db.collection("users").findOne({
      email: website.userId
    });

    const isPro = user?.plan === 'pro';

    // Get notifications and config from website document
    const notifications = website.notifications || [];
    const config = website.config || {};

    // Apply free plan limitations
    const sanitizedConfig: WebsiteConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      // Force default theme for free users
      theme: isPro ? (config.theme || 'ios') : 'ios',
      // Disable pro features for free users
      loop: isPro ? Boolean(config.loop) : false,
      showCloseButton: isPro ? Boolean(config.showCloseButton) : false
    };

    // Limit notifications for free users and remove URLs
    const sanitizedNotifications = notifications
      .slice(0, isPro ? undefined : 5)
      .map((notification: Partial<Notification>) => ({
        ...notification,
        url: isPro ? notification.url : ''
      }));

    return NextResponse.json({
      notifications: sanitizedNotifications,
      config: sanitizedConfig
    });

  } catch (error) {
    console.error('Error fetching public notifications:', error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}