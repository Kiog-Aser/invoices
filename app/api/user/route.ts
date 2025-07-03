import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Mark route as dynamic to prevent caching
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Connect to MongoDB to get fresh user data
    await connectMongo();
    
    // Get the user from the database with the most up-to-date information
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Return the user data including plan information
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      plan: user.plan || "",
      customerId: user.customerId || "",
      createdAt: user.createdAt
    });
    
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}