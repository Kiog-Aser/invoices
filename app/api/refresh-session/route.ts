import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/libs/mongo"; 
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";

export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get the updated user data from the database
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log("Refreshing session with plan:", user.plan);
    
    // Make sure to return the user data in a format that NextAuth expects
    // The structure here should match what's expected in your next-auth.ts callbacks
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image || session.user.image,
        plan: user.plan || "pro",  // Ensure plan is never undefined
        customerId: user.customerId || ""  // Ensure customerId is never undefined
      }
    });
    
  } catch (error) {
    console.error("Error refreshing session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}