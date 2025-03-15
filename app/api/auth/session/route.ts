import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check if this is a manual update request
    const shouldUpdate = req.nextUrl.searchParams.has('update');
    
    if (shouldUpdate) {
      // Get the current session
      const session = await getServerSession(authOptions);
      
      if (!session || !session.user?.email) {
        return NextResponse.json({ user: null }); // Return a valid JSON response
      }
      
      // Connect to MongoDB and fetch fresh user data
      await connectMongo();
      const user = await User.findOne({ email: session.user.email });
      
      if (!user) {
        return NextResponse.json({ user: null }); // Return a valid JSON response
      }
      
      // Return the updated user data
      return NextResponse.json({ 
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          plan: user.plan || "",
          customerId: user.customerId || "", // Include customerId needed by NextAuth
          createdAt: user.createdAt
        }
      });
    }
    
    // If not a manual update request, just return the current session
    const session = await getServerSession(authOptions);
    
    // Always return a properly structured JSON object, even when session is null
    return NextResponse.json(session || { user: null });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
