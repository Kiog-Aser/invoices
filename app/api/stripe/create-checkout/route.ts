import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { createCheckout } from "@/libs/stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// By default, it doesn't force users to be authenticated. But if they are, it will prefill the Checkout data with their email and/or credit card
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    await connectMongo();

    const user = session?.user?.email 
      ? await User.findOne({ email: session.user.email }).select('+plan')
      : null;
      
    console.log("Creating checkout for user:", user?._id?.toString() || "anonymous");
    console.log("User ID from request:", body.userId);

    const stripeSessionURL = await createCheckout({
      mode: body.mode || "payment",
      priceId: body.priceId,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      clientReferenceId: body.userId || user?._id?.toString(),
      user: user ? {
        email: user.email,
        customerId: user.customerId,
      } : undefined,
    });

    if (!stripeSessionURL) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    console.log("Checkout session created successfully");
    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error("Create checkout error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
