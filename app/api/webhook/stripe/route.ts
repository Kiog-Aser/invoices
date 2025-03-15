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
  try {
    // Connect to database first
    await connectMongo();

    console.log("⚡️ Stripe webhook received");

    // Get the raw request body
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err) {
      console.error("❌ Error verifying Stripe webhook signature:", err);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    console.log(`✅ Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💰 Processing checkout completion for session:", session.id);

        const customerId = session.customer as string;
        
        // Find the user and update their plan
        const user = await User.findOne({ customerId });

        if (user) {
          console.log(`📝 Found user ${user._id} with email ${user.email}, updating to pro plan...`);
          user.plan = "pro";
          await user.save();
          console.log(`✨ Updated user ${user._id} to pro plan successfully`);
        } else {
          // If we can't find by customerId, try to find by client_reference_id (which might be the user id)
          if (session.client_reference_id) {
            const userById = await User.findById(session.client_reference_id);
            if (userById) {
              console.log(`📝 Found user by client_reference_id ${userById._id}, updating to pro plan...`);
              userById.plan = "pro";
              userById.customerId = customerId; // Save the customerId for future reference
              await userById.save();
              console.log(`✨ Updated user ${userById._id} to pro plan successfully`);
            } else {
              console.error(`❌ No user found with client_reference_id ${session.client_reference_id}`);
            }
          } else {
            console.error(`❌ No user found with customerId ${customerId} and no client_reference_id available`);
          }
        }

        break;
      }
      // Handle other webhook events as needed
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error in Stripe webhook handler:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}