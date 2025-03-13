import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    
    if (!token || !email) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Find user with matching token
    const user = await User.findOne({
      email,
      'activationToken.token': token,
      'activationToken.expires': { $gt: new Date() }
    });
    
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Update user to pro plan and clear token
    await User.findOneAndUpdate(
      { email },
      { 
        plan: "pro",
        $unset: { activationToken: "" }
      }
    );
    
    // Redirect to success page
    return NextResponse.redirect(new URL("/activation-success", req.url));
  } catch (error) {
    console.error("Error activating pro plan:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}