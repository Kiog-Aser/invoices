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
    
    // Find all users that need updating - include null, undefined, and invalid values
    const usersToUpdate = await User.find({
      $or: [
        { plan: { $exists: false } },
        { plan: null },
        { plan: { $nin: ['', 'pro'] } } // Also fix any invalid plan values
      ]
    });
    
    console.log(`Found ${usersToUpdate.length} users that need plan field updates`);
    
    const results = {
      updated: 0,
      errors: 0,
      details: [] as string[]
    };
    
    // Update each user to set plan to empty string (free plan)
    for (const user of usersToUpdate) {
      try {
        // If user has customerId or priceId, they might be a pro user
        const shouldBePro = user.customerId || user.priceId;
        user.plan = shouldBePro ? "pro" : "";
        await user.save();
        results.updated++;
        results.details.push(`Updated user ${user._id} to ${user.plan} plan`);
      } catch (err) {
        results.errors++;
        results.details.push(`Failed to update user ${user._id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
    
    // Verify all users now have valid plan values
    const invalidUsers = await User.countDocuments({
      $or: [
        { plan: { $exists: false } },
        { plan: null },
        { plan: { $nin: ['', 'pro'] } }
      ]
    });
    
    if (invalidUsers > 0) {
      console.error(`⚠️ Still found ${invalidUsers} users with invalid plan values`);
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Migration completed: ${results.updated} users updated, ${results.errors} errors`,
      details: results.details
    });
  } catch (error) {
    console.error("❌ Error in user migration:", error);
    return NextResponse.json(
      { error: "Migration failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}