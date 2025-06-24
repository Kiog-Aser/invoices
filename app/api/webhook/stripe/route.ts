import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Define the exact price IDs from the landing page
const PRICE_ID_SINGLE_PROTOCOL = "price_1RBLRmG19CrUMKRawDhN6cXJ";  // $39 (Assuming this is the correct LIVE ID)
const PRICE_ID_UNLIMITED_ACCESS = "price_1RBLRiG19CrUMKRaaun6VaCZ";  // $159 (Updated to match config.ts)

// Configuration for Next.js API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Note: Next.js 14+ doesn't support the bodyParser export
// We'll handle the raw body manually

// Simple file-based logging to help debug webhook issues
const logToFile = (message: string) => {
  console.log(message);
  // This ensures the message is flushed immediately to the console
  if (process.stdout && typeof process.stdout.write === 'function') {
    process.stdout.write(message + '\n');
  }
};

export async function POST(req: NextRequest) {
  logToFile("⚡️ Stripe webhook received - Starting processing");
  logToFile("💳 STRIPE_WEBHOOK_SECRET configured: " + (process.env.STRIPE_WEBHOOK_SECRET ? "✅ YES" : "❌ NO"));
  logToFile("💳 STRIPE_SECRET_KEY configured: " + (process.env.STRIPE_SECRET_KEY ? "✅ YES" : "❌ NO"));
  
  try {
    // Get the raw request body
    const payload = await req.text();
    logToFile(`📦 Received payload of length: ${payload.length}`);
    
    // Log headers in a more reliable way
    const signature = req.headers.get("stripe-signature");
    logToFile(`📨 Stripe-Signature header: ${signature ? "Present (length: " + signature.length + ")" : "Missing"}`);
    logToFile(`📨 Content-Type: ${req.headers.get("content-type") || "not set"}`);
    
    // Connect to MongoDB before proceeding
    try {
      await connectMongo();
      logToFile("🔌 MongoDB connection successful");
    } catch (dbError) {
      logToFile(`❌ MongoDB connection failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }
    
    // Validate webhook signature
    if (!signature) {
      logToFile("❌ No Stripe signature found");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logToFile("❌ STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // Construct the Stripe event
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      logToFile(`✅ Successfully validated Stripe signature. Event type: ${event.type}`);
    } catch (err: any) {
      logToFile(`❌ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logToFile(`🛒 Checkout session completed: ${session.id}`);
      
      // Get necessary identifiers from the session
      const customerId = session.customer as string;
      const clientReferenceId = session.client_reference_id;
      const customerEmail = session.customer_details?.email;
      
      logToFile(`👤 Customer identifiers: 
      - Customer ID: ${customerId || 'N/A'}
      - Client Reference ID: ${clientReferenceId || 'N/A'}
      - Customer Email: ${customerEmail || 'N/A'}`);
      
      // Get the price ID using a simplified approach
      let priceId = null;
      
      try {
        // First, try to get from line_items if already expanded
        if (session.line_items?.data?.[0]?.price?.id) {
          priceId = session.line_items.data[0].price.id;
          logToFile(`✅ Found price ID from line_items: ${priceId}`);
        } 
        // Then try metadata
        else if (session.metadata?.priceId) {
          priceId = session.metadata.priceId;
          logToFile(`✅ Found price ID from metadata: ${priceId}`);
        }
        // Last resort: retrieve expanded session
        else {
          logToFile("⚠️ Price ID not found in session, retrieving expanded session...");
          const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items.data.price']
          });
          
          if (expandedSession.line_items?.data?.[0]?.price?.id) {
            priceId = expandedSession.line_items.data[0].price.id;
            logToFile(`✅ Found price ID from expanded session: ${priceId}`);
          } else {
            logToFile("❌ Could not find price ID in expanded session");
          }
        }
      } catch (error) {
        logToFile(`❌ Error getting price ID: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      if (!priceId) {
        logToFile("❌ No price ID found, cannot process further");
        return NextResponse.json({ error: "Price ID not found" }, { status: 400 });
      }
      
      logToFile(`🏷️ Processing checkout for price ID: ${priceId}`);
      
      // Find the user with a simplified approach
      let user = null;
      
      // Step 1: Try finding by customer ID if available
      if (customerId) {
        user = await User.findOne({ customerId });
        if (user) {
          logToFile(`✅ User found by customerId: ${user._id}`);
        }
      }
      
      // Step 2: If no user found and we have a client reference ID, try that
      if (!user && clientReferenceId) {
        user = await User.findById(clientReferenceId);
        if (user) {
          logToFile(`✅ User found by clientReferenceId: ${user._id}`);
          // Update customer ID if not set
          if (customerId && !user.customerId) {
            user.customerId = customerId;
            logToFile(`✅ Updated user's customerId to: ${customerId}`);
          }
        }
      }
      
      // Step 3: If still no user and we have an email, try that
      if (!user && customerEmail) {
        user = await User.findOne({ email: customerEmail });
        if (user) {
          logToFile(`✅ User found by email: ${user._id}`);
          // Update customer ID if not set
          if (customerId && !user.customerId) {
            user.customerId = customerId;
            logToFile(`✅ Updated user's customerId to: ${customerId}`);
          }
        }
      }
      
      // If no user found by any method, log and exit
      if (!user) {
        logToFile(`❌ No user found for this checkout session. Unable to assign purchase.`);
        return NextResponse.json({ received: true, warning: "No user found" });
      }

      // Handle different pricing plans for ZenVoice clone
      
      // For now, just set user to 'pro' plan for any purchase (since this is for invoice management)
      if (priceId === PRICE_ID_SINGLE_PROTOCOL || priceId === PRICE_ID_UNLIMITED_ACCESS) {
        logToFile(`💳 Setting user ${user._id} to pro plan for invoice management`);
        user.plan = 'pro';
      } else {
        logToFile(`⚠️ Unknown price ID: ${priceId} - setting to pro plan anyway`);
        user.plan = 'pro';
      }
      
      // Save the user with error handling
      try {
        // Update user plan and customer ID
        const updateResult = await User.updateOne(
          { _id: user._id },
          { 
            $set: {
              customerId: user.customerId, // Ensure customerId is saved
              plan: user.plan
            }
          }
        );
        
        logToFile(`✅ Database update result: ${JSON.stringify(updateResult)}`);
        
        // Get the fresh user data to confirm changes
        const updatedUser = await User.findById(user._id);
        logToFile(`✅ Successfully saved user ${user._id} with plan: ${updatedUser.plan}`);
      } catch (saveError) {
        logToFile(`❌ Error saving user: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
      }
    } 
    // End of checkout.session.completed handling

    // --- SUBSCRIPTION EVENTS ---
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted" ||
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.payment_failed"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const subscriptionId = subscription.id;
      const status = subscription.status;
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      // Find user by customerId
      const user = await User.findOne({ customerId });
      if (!user) {
        logToFile(`❌ No user found for subscription event. CustomerId: ${customerId}`);
        return NextResponse.json({ received: true, warning: "No user found for subscription event" });
      }

      // Update subscription fields
      user.subscriptionStatus = status;
      user.subscriptionId = subscriptionId;
      user.currentPeriodEnd = currentPeriodEnd;

      // If canceled or payment failed, downgrade plan at end of period
      if (status === 'canceled' || status === 'unpaid' || status === 'incomplete_expired') {
        user.plan = '';
      } else if (status === 'active' || status === 'trialing' || status === 'past_due') {
        user.plan = 'pro';
      }

      await user.save();
      logToFile(`✅ Updated user subscription: ${user.email} | Status: ${status} | Period End: ${currentPeriodEnd}`);
      return NextResponse.json({ received: true, success: true });
    }
    // --- END SUBSCRIPTION EVENTS ---
    
    // Send success response
    logToFile("✅ Webhook processed successfully");
    return NextResponse.json({ received: true, success: true });
    
  } catch (error: any) {
    logToFile(`❌ Webhook error: ${error.message}`);
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}