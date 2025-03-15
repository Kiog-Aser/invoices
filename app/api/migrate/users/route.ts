import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// This is a one-time migration route to ensure all users have the plan field set
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Connect to MongoDB
    await connectMongo();
    console.log("🔄 Starting user migration to ensure plan field is set");
    
    // Find all users where plan field is undefined or null
    const usersToUpdate = await User.find({
      $or: [
        { plan: { $exists: false } },
        { plan: null }
      ]
    });
    
    console.log(`Found ${usersToUpdate.length} users without plan field`);
    
    // Update each user to set plan to empty string (free plan)
    for (const user of usersToUpdate) {
      user.plan = "";
      await user.save();
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${usersToUpdate.length} users to have plan field set` 
    });
  } catch (error) {
    console.error("❌ Error in user migration:", error);
    return NextResponse.json(
      { error: "Migration failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}