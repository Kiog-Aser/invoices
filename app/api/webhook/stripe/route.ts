import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  console.log("⚡️ Stripe webhook received - Starting processing");
  try {
    // Log headers for debugging
    const relevantHeaders = {
      'stripe-signature': req.headers.get("stripe-signature"),
      'content-type': req.headers.get("content-type"),
    };
    console.log("📨 Webhook headers:", relevantHeaders);

    // Connect to database first
    console.log("🔌 Connecting to MongoDB...");
    await connectMongo();
    console.log("✅ MongoDB connected");

    // Get the raw request body
    const payload = await req.text();
    console.log("📦 Received webhook payload length:", payload.length);
    
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      console.error("❌ No Stripe signature found");
      return NextResponse.json({ error: "No Stripe signature" }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      console.log("🔐 Verifying Stripe signature...");
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("✅ Signature verified successfully");
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", {
        error: err.message,
        secret: process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 4) + "..." // Log first 4 chars for debugging
      });
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`✨ Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💰 Checkout session completed:", {
          sessionId: session.id,
          customerId: session.customer,
          clientReferenceId: session.client_reference_id
        });

        const customerId = session.customer as string;
        
        // Find the user and update their plan
        const user = await User.findOne({ customerId });

        if (user) {
          console.log(`📝 Found user by customerId: ${user._id}`);
          user.plan = "pro";
          await user.save();
          console.log(`✅ Updated user ${user._id} to pro plan`);
        } else {
          // If we can't find by customerId, try to find by client_reference_id
          if (session.client_reference_id) {
            console.log(`🔍 Looking for user by client_reference_id: ${session.client_reference_id}`);
            const userById = await User.findById(session.client_reference_id);
            if (userById) {
              console.log(`📝 Found user by client_reference_id: ${userById._id}`);
              userById.plan = "pro";
              userById.customerId = customerId;
              await userById.save();
              console.log(`✅ Updated user ${userById._id} to pro plan`);
            } else {
              console.error(`❌ No user found with client_reference_id ${session.client_reference_id}`);
            }
          } else {
            console.error(`❌ No user found with customerId ${customerId} and no client_reference_id available`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook processing error:", {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: `Webhook processing failed: ${error.message}` },
      { status: 500 }
    );
  }
}
