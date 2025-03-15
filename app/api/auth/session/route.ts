import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get current session first
    const session = await getServerSession(authOptions);
    
    // Check if this is a manual update request
    const shouldUpdate = req.nextUrl.searchParams.has('update');
    
    if (shouldUpdate && session?.user?.email) {
      console.log("Updating session for user:", session.user.email);
      
      // Connect to MongoDB and fetch fresh user data
      await connectMongo();
      const user = await User.findOne({ email: session.user.email });
      
      if (!user) {
        console.warn("User not found in database:", session.user.email);
        return NextResponse.json({ user: null });
      }
      
      console.log("Found user data:", {
        id: user._id,
        plan: user.plan,
        customerId: user.customerId
      });
      
      // Return the updated user data
      return NextResponse.json({ 
        user: {
          id: user._id.toString(),
          name: user.name || session.user.name,
          email: user.email,
          image: user.image || session.user.image,
          plan: user.plan || "",
          customerId: user.customerId || "",
          createdAt: user.createdAt
        }
      });
    }
    
    // Always return a properly structured JSON object
    return NextResponse.json(session || { user: null });
  } catch (error) {
    console.error("Error in session route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
