import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import WritingProtocol from "@/models/WritingProtocol";

// Mark as dynamic to prevent caching
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectMongo();

    // Check if the user is an admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get user details
    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's protocols
    const protocols = await WritingProtocol.find({ userId: params.userId })
      .sort({ createdAt: -1 });

    // Transform user data for the response
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      protocolCount: protocols.length,
      tokens: user.protocols?.tokens || 0,
      isUnlimited: user.protocols?.isUnlimited || false,
      lastGenerated: user.protocols?.lastGenerated || null
    };

    return NextResponse.json({
      user: userData,
      protocols: protocols
    });
  } catch (error) {
    console.error("Error fetching user protocols:", error);
    return NextResponse.json(
      { error: "Failed to fetch user protocols" },
      { status: 500 }
    );
  }
}