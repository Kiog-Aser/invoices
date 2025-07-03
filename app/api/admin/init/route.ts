import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    await connectMongo();
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { isAdmin: true } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Force session refresh
    const response = await fetch("/api/auth/session?update=true", {
      method: "GET",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting admin:", error);
    return NextResponse.json(
      { error: "Failed to set admin" },
      { status: 500 }
    );
  }
}