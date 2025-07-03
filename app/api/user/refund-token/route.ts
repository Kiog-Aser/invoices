import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Find the user in the database
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user has protocol access configuration
    if (!user.protocols) {
      user.protocols = { tokens: 0, isUnlimited: false, purchasedCount: 0 };
    }

    // Unlimited users don't need token refunds
    if (user.protocols.isUnlimited) {
      return NextResponse.json({ success: true, message: "User has unlimited access, no refund needed" });
    }

    // Refund one token
    user.protocols.tokens += 1;
    
    // Save the updated user document
    await user.save();

    return NextResponse.json({ 
      success: true, 
      tokens: user.protocols.tokens,
      message: "Token refunded successfully" 
    });
  } catch (error) {
    console.error("Failed to refund token:", error);
    return NextResponse.json({ error: "Failed to refund token" }, { status: 500 });
  }
}