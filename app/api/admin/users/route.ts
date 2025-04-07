import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import WritingProtocol from "@/models/WritingProtocol";

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
    
    // Get protocol counts for all users
    const userIds = users.map(user => user._id.toString());
    const protocolCounts = await WritingProtocol.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);
    
    // Create a map of userId to protocol count
    const protocolCountMap = new Map();
    protocolCounts.forEach(item => {
      protocolCountMap.set(item._id.toString(), item.count);
    });
    
    // Transform users for frontend
    const transformedUsers = users.map(user => {
      const userId = user._id.toString();
      return {
        id: userId,
        email: user.email,
        name: user.name || "No Name",
        image: user.image,
        plan: user.plan || "",
        customerId: user.customerId || "",
        protocolCount: protocolCountMap.get(userId) || 0,
        tokens: user.protocols?.tokens || 0,
        isUnlimited: user.protocols?.isUnlimited || false,
        lastGenerated: user.protocols?.lastGenerated || null,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin || false
      };
    });

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}