import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import User from "@/models/User";
import Stripe from "stripe";

// POST /api/invoice/[slug]/search - Search for invoices by email
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    console.log(`Invoice search request for slug: ${params.slug}`);
    
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    await connectMongo();

    // Find the project by slug
    const project = await Project.findOne({ 
      slug: params.slug,
      isActive: true 
    });

    if (!project) {
      console.log(`Project not found for slug: ${params.slug}`);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log(`Found project: ${project.name} (ID: ${project._id})`);

    // Validate API key exists
    if (!project.stripeApiKey) {
      console.error(`Project ${project._id} has no Stripe API key`);
      return NextResponse.json({ error: "Project configuration error" }, { status: 500 });
    }

    // Initialize Stripe with the project's API key
    const stripe = new Stripe(project.stripeApiKey, {
      apiVersion: "2025-02-24.acacia",
    });

    try {
      let totalTransactions = 0;

      // 1. Search Invoices (original logic)
      const invoices = await stripe.invoices.list({
        customer: undefined,
        limit: 100,
        expand: ['data.customer']
      });

      const customerInvoices = invoices.data.filter(invoice => {
        const customer = invoice.customer as Stripe.Customer;
        return customer && typeof customer === 'object' && customer.email === email;
      });

      totalTransactions += customerInvoices.length;

      // 2. Search Charges (including $0 charges)
      const charges = await stripe.charges.list({
        limit: 100,
        expand: ['data.customer']
      });

      const emailCharges = charges.data.filter(charge => {
        // Check multiple email fields
        if (charge.billing_details?.email === email) return true;
        if (charge.receipt_email === email) return true;
        
        // Check customer email
        const customer = charge.customer as Stripe.Customer;
        if (customer && typeof customer === 'object' && customer.email === email) return true;
        
        return false;
      });

      totalTransactions += emailCharges.length;

      // 3. Search Payment Intents
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        expand: ['data.customer']
      });

      const emailPaymentIntents = paymentIntents.data.filter(pi => {
        if (pi.receipt_email === email) return true;
        
        const customer = pi.customer as Stripe.Customer;
        if (customer && typeof customer === 'object' && customer.email === email) return true;
        
        return false;
      });

      totalTransactions += emailPaymentIntents.length;

            // 4. Search Subscriptions (optional - only if we have permission)
      let emailSubscriptions: any[] = [];
      try {
        const subscriptions = await stripe.subscriptions.list({
          limit: 100,
          expand: ['data.customer', 'data.items.data.price']
        });

        emailSubscriptions = subscriptions.data.filter(sub => {
          const customer = sub.customer as Stripe.Customer;
          if (customer && typeof customer === 'object' && customer.email === email) return true;
          return false;
        });

        totalTransactions += emailSubscriptions.length;
      } catch (subscriptionError: any) {
        // If we don't have subscription permissions, that's okay - just skip this part
        if (subscriptionError.type === 'StripePermissionError' && subscriptionError.message?.includes('rak_subscription_read')) {
          console.log('Skipping subscription search - no permission (this is okay)');
        } else {
          console.error('Unexpected subscription error:', subscriptionError);
        }
      }

      // 5. Search Customer Records directly
      const customers = await stripe.customers.list({
        email: email,
        limit: 100
      });

      totalTransactions += customers.data.length;

      // Update project statistics
      await Project.findByIdAndUpdate(project._id, {
        $inc: { totalSearches: 1 },
        $set: { lastUsed: new Date() }
      });

      // Update user statistics
      await User.findByIdAndUpdate(project.userId, {
        $inc: { totalInvoiceSearches: 1 }
      });

      return NextResponse.json({ 
        found: totalTransactions > 0,
        count: totalTransactions,
        email: email,
        breakdown: {
          invoices: customerInvoices.length,
          charges: emailCharges.length,
          paymentIntents: emailPaymentIntents.length,
          subscriptions: emailSubscriptions.length,
          customers: customers.data.length
        }
      });

    } catch (stripeError: any) {
      console.error("Stripe API error:", {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        projectId: project._id,
        slug: params.slug
      });
      
      // Provide more specific error messages based on Stripe error type
      let errorMessage = "Error searching invoices. Please try again later.";
      if (stripeError.type === 'StripeAuthenticationError') {
        errorMessage = "Invalid API credentials. Please check your Stripe API key.";
      } else if (stripeError.type === 'StripePermissionError') {
        errorMessage = "Insufficient permissions. Please ensure your API key has invoice and customer read access.";
      }
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error searching invoices:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      slug: params.slug
    });
    return NextResponse.json({ error: "Failed to search invoices" }, { status: 500 });
  }
} 