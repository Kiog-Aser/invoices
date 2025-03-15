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
    
    // Get the raw request body and signature
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature") || "";
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("❌ No webhook secret configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err) {
      console.error("❌ Error verifying webhook signature:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log(`✅ Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💰 Processing checkout completion for session:", session.id);

        const customerId = session.customer as string;
        const clientReferenceId = session.client_reference_id;
        
        console.log("📋 Session details:", {
          customerId,
          clientReferenceId,
          customerEmail: session.customer_email
        });
        
        // First try to find user by customerId
        let user = await User.findOne({ customerId });
        
        // If not found and we have a client_reference_id, try finding by that
        if (!user && clientReferenceId) {
          user = await User.findById(clientReferenceId);
        }
        
        // If still not found and we have a customer email, try finding by email
        if (!user && session.customer_email) {
          user = await User.findOne({ email: session.customer_email });
        }

        if (user) {
          console.log(`📝 Found user ${user._id}, updating to pro plan...`);
          user.plan = "pro";
          if (!user.customerId) {
            user.customerId = customerId;
          }
          await user.save();
          console.log(`✨ Updated user ${user._id} to pro plan successfully`);
        } else {
          console.error("❌ Could not find user with any of the following:", {
            customerId,
            clientReferenceId,
            customerEmail: session.customer_email
          });
        }
        break;
      }
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
