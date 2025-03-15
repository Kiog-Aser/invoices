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
export const maxDuration = 60; // Extend timeout to 60 seconds

function logWebhookDebug(message: string, data?: any) {
  const logData = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message,
    ...(data && { data })
  };
  console.log("🔍 Stripe Webhook Debug:", JSON.stringify(logData, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    logWebhookDebug("Webhook received", {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Connect to database first to avoid timing issues
    await connectMongo();
    
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature") || "";
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logWebhookDebug("Missing webhook secret", {
        webhookSecretExists: false,
        envVars: Object.keys(process.env)
      });
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
      logWebhookDebug("Event constructed successfully", {
        type: event.type,
        id: event.id
      });
    } catch (err) {
      logWebhookDebug("Signature verification failed", {
        error: err instanceof Error ? err.message : "Unknown error",
        sigHeaderReceived: sig,
        webhookSecretLength: webhookSecret.length
      });
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logWebhookDebug("Processing checkout completion", {
          sessionId: session.id,
          customerId: session.customer,
          clientReferenceId: session.client_reference_id,
          customerEmail: session.customer_email
        });

        try {
          // First try to find user by customerId
          let user = await User.findOne({ customerId: session.customer });
          
          // If not found and we have a client_reference_id, try finding by that
          if (!user && session.client_reference_id) {
            user = await User.findById(session.client_reference_id);
          }
          
          // If still not found and we have a customer email, try finding by email
          if (!user && session.customer_email) {
            user = await User.findOne({ email: session.customer_email });
          }

          if (!user) {
            logWebhookDebug("User not found", {
              customerId: session.customer,
              clientReferenceId: session.client_reference_id,
              customerEmail: session.customer_email
            });
            return NextResponse.json(
              { error: "User not found" },
              { status: 404 }
            );
          }

          // Update user with pro plan and customerId if they don't have it
          logWebhookDebug("Updating user", {
            userId: user._id,
            previousPlan: user.plan,
            previousCustomerId: user.customerId
          });

          user.plan = "pro";
          if (!user.customerId && session.customer) {
            user.customerId = session.customer as string;
          }
          await user.save();

          logWebhookDebug("User updated successfully", {
            userId: user._id,
            newPlan: user.plan,
            newCustomerId: user.customerId
          });

          return NextResponse.json({ success: true });
        } catch (error) {
          logWebhookDebug("Error updating user", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
          });
          return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
          );
        }
      }
    }

    // Respond with 200 for other event types
    return NextResponse.json({ received: true });
  } catch (error) {
    logWebhookDebug("Unhandled error in webhook", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
