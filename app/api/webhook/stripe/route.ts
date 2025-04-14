import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Define the exact price IDs from the landing page
const PRICE_ID_SINGLE_PROTOCOL = "price_1RAEzBQF2yOHJOkbGoyJKFUh";  // $39
const PRICE_ID_UNLIMITED_ACCESS = "price_1RAF0yQF2yOHJOkbGp7h8r08";  // $159

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
      console.log("Full session data:", JSON.stringify(session, null, 2));
      
      const customerId = session.customer as string;
      let priceId = null;
      
      // Try multiple approaches to get the price ID
      try {
        // Approach 1: Direct access if expanded in the event
        if (session.line_items?.data?.[0]?.price?.id) {
          priceId = session.line_items.data[0].price.id;
          console.log("✅ Found price ID from line_items:", priceId);
        } 
        // Approach 2: Get from metadata if available
        else if (session.metadata?.priceId) {
          priceId = session.metadata.priceId;
          console.log("✅ Found price ID from metadata:", priceId);
        }
        // Approach 3: Fetch expanded session data
        else {
          console.log("⚠️ Price ID not found in session, fetching expanded session...");
          const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items.data.price']
          });
          
          if (expandedSession.line_items?.data?.[0]?.price?.id) {
            priceId = expandedSession.line_items.data[0].price.id;
            console.log("✅ Found price ID from expanded session:", priceId);
          }
        }
      } catch (error) {
        console.error("❌ Error getting price ID:", error);
      }
      
      console.log(`📝 Processing completed checkout for priceId: ${priceId}`);
      
      let user;
      
      // First try to find user by customerId
      user = await User.findOne({ customerId });
      
      // If user not found by customerId, try by client_reference_id
      if (!user && session.client_reference_id) {
        user = await User.findById(session.client_reference_id);
        // If found by client_reference_id, update their customerId
        if (user && customerId) {
          user.customerId = customerId;
        }
      }
      
      // If still no user, try by customer email (if available)
      if (!user && session.customer_details?.email) {
        user = await User.findOne({ email: session.customer_details.email });
        // If found by email, update their customerId
        if (user && customerId) {
          user.customerId = customerId;
        }
      }
      
      if (!user) {
        console.error(`❌ No user found for checkout session ${session.id}`);
        return NextResponse.json({ received: true });
      }

      // Only set 'pro' plan for unlimited access - not for single token purchases
      if (priceId === PRICE_ID_UNLIMITED_ACCESS) {
        user.plan = "pro";
        console.log(`✅ Updated user ${user._id} to pro plan for unlimited access`);
      } else {
        // For single token purchases, don't set pro plan
        console.log(`ℹ️ Not setting pro plan for single protocol purchase`);
      }
      
      // Handle different pricing plans based on the exact price IDs from the landing page
      // Single Protocol ($39)
      if (priceId === PRICE_ID_SINGLE_PROTOCOL) {
        console.log(`✅ Adding single protocol token to user ${user._id}`);
        
        // Initialize protocols object if needed
        if (!user.protocols) {
          user.protocols = {
            tokens: 0, 
            isUnlimited: false,
            purchasedCount: 0
          };
        }
        
        // Add one token
        user.protocols.tokens = (user.protocols.tokens || 0) + 1;
        console.log(`✅ User now has ${user.protocols.tokens} token(s)`);
      }
      // Unlimited Access ($159)
      else if (priceId === PRICE_ID_UNLIMITED_ACCESS) {
        console.log(`✅ Granting unlimited protocol access to user ${user._id}`);
        
        // Initialize and set unlimited access
        if (!user.protocols) {
          user.protocols = {
            tokens: 0, 
            isUnlimited: true,
            purchasedCount: 0
          };
        } else {
          user.protocols.isUnlimited = true;
        }
        console.log(`✅ User now has unlimited protocol access`);
      }
      // Legacy or unknown product - don't grant tokens or pro access
      else {
        console.log(`⚠️ Unknown or missing priceId ${priceId}, not granting any special access`);
        
        // For unknown products, ensure protocols object exists but don't add tokens
        if (!user.protocols) {
          user.protocols = {
            tokens: 0, 
            isUnlimited: false,
            purchasedCount: 0
          };
        }
      }
      
      await user.save();
      console.log(`✅ Successfully updated user ${user._id} with new access:`, JSON.stringify({
        plan: user.plan,
        protocols: user.protocols
      }));
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