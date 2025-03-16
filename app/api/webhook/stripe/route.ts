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
    const relevantHeaders = {
      'stripe-signature': req.headers.get("stripe-signature") ? "present" : "missing",
      'content-type': req.headers.get("content-type"),
    };
    console.log("📨 Webhook headers:", relevantHeaders);

    await connectMongo();
    
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature");
    
    if (!sig) {
      console.error("❌ No Stripe signature found");
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      
      const user = await User.findOne({ customerId });

      if (user) {
        user.plan = "pro";
        await user.save();
        console.log(`✅ Updated user ${user._id} to pro plan`);
      } else if (session.client_reference_id) {
        const userById = await User.findById(session.client_reference_id);
        if (userById) {
          userById.plan = "pro";
          userById.customerId = customerId;
          await userById.save();
          console.log(`✅ Updated user ${userById._id} to pro plan`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
