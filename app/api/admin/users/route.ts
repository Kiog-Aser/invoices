import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Mark as dynamic to prevent caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongo();
    
    // Fetch all users with selected fields
    const users = await User.find({}).select({
      email: 1,
      name: 1,
      image: 1,
      plan: 1,
      customerId: 1,
      protocols: 1,
      createdAt: 1,
      isAdmin: 1
    }).sort({ createdAt: -1 });
    
    // Transform users for frontend
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name || "No Name",
      image: user.image,
      plan: user.plan || "",
      customerId: user.customerId || "",
      protocolCount: user.protocols?.purchasedCount || 0,
      tokens: user.protocols?.tokens || 0,
      isUnlimited: user.protocols?.isUnlimited || false,
      lastGenerated: user.protocols?.lastGenerated || null,
      createdAt: user.createdAt,
      isAdmin: user.isAdmin || false
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}