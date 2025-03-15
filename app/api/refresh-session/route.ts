import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/libs/mongo"; 
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      // Return a valid format that NextAuth can handle instead of an error
      return NextResponse.json({ user: null });
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get the updated user data from the database
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      // Return a valid format that NextAuth can handle instead of an error
      return NextResponse.json({ user: null });
    }
    
    console.log("Refreshing session with plan:", user.plan);
    
    // Make sure to return the user data in a format that NextAuth expects
    return NextResponse.json({ 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image || session.user.image,
        plan: user.plan || "",
        customerId: user.customerId || ""
      }
    });
    
  } catch (error) {
    console.error("Error refreshing session:", error);
    // Return a consistent format even for errors
    return NextResponse.json({ user: null, error: "Failed to refresh session" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectMongo();

    // Get fresh user data from database
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return the updated user data
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      customerId: user.customerId
    });
  } catch (error) {
    console.error("Error refreshing session:", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}