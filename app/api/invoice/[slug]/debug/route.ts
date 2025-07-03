import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import Stripe from "stripe";

// GET /api/invoice/[slug]/debug - Debug what Stripe objects exist for an email
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectMongo();

    // Find the project by slug
    const project = await Project.findOne({ 
      slug: params.slug,
      isActive: true 
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Initialize Stripe with the project's API key
    const stripe = new Stripe(project.stripeApiKey, {
      apiVersion: "2025-02-24.acacia",
    });

    const debugInfo: any = {
      searchEmail: email,
      project: project.name,
      results: {}
    };

    try {
      // 1. Search Invoices
      const invoices = await stripe.invoices.list({
        limit: 100,
        expand: ['data.customer']
      });

      const customerInvoices = invoices.data.filter(invoice => {
        const customer = invoice.customer as Stripe.Customer;
        return customer && typeof customer === 'object' && customer.email === email;
      });

      debugInfo.results.invoices = {
        total: invoices.data.length,
        forCustomer: customerInvoices.length,
        samples: customerInvoices.slice(0, 3).map(inv => ({
          id: inv.id,
          amount: inv.total / 100,
          status: inv.status,
          customer: inv.customer
        }))
      };

      // 2. Search Charges
      const charges = await stripe.charges.list({
        limit: 100,
        expand: ['data.customer']
      });

      const customerCharges = charges.data.filter(charge => {
        if (charge.billing_details?.email === email) return true;
        if (charge.receipt_email === email) return true;
        const customer = charge.customer as Stripe.Customer;
        return customer && typeof customer === 'object' && customer.email === email;
      });

      debugInfo.results.charges = {
        total: charges.data.length,
        forCustomer: customerCharges.length,
        samples: customerCharges.slice(0, 3).map(charge => ({
          id: charge.id,
          amount: charge.amount / 100,
          status: charge.status,
          billing_email: charge.billing_details?.email,
          receipt_email: charge.receipt_email,
          customer: charge.customer
        }))
      };

      // 3. Search Payment Intents
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        expand: ['data.customer']
      });

      const customerPIs = paymentIntents.data.filter(pi => {
        if (pi.receipt_email === email) return true;
        const customer = pi.customer as Stripe.Customer;
        return customer && typeof customer === 'object' && customer.email === email;
      });

      debugInfo.results.paymentIntents = {
        total: paymentIntents.data.length,
        forCustomer: customerPIs.length,
        samples: customerPIs.slice(0, 3).map(pi => ({
          id: pi.id,
          amount: pi.amount / 100,
          status: pi.status,
          receipt_email: pi.receipt_email,
          customer: pi.customer
        }))
      };

      // 4. Search Customers
      const customers = await stripe.customers.list({
        email: email,
        limit: 10
      });

      debugInfo.results.customers = {
        found: customers.data.length,
        details: customers.data.map(customer => ({
          id: customer.id,
          email: customer.email,
          name: customer.name,
          created: new Date(customer.created * 1000).toISOString(),
          balance: customer.balance,
          metadata: customer.metadata
        }))
      };

      // 5. Search Subscriptions for each customer (optional - only if we have permission)
      const allSubscriptions: any[] = [];
      try {
        for (const customer of customers.data) {
          try {
            const subscriptions = await stripe.subscriptions.list({
              customer: customer.id,
              limit: 50
            });
            
            allSubscriptions.push(...subscriptions.data.map(sub => ({
              id: sub.id,
              customer: customer.id,
              status: sub.status,
              created: new Date(sub.created * 1000).toISOString(),
              trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
              items: sub.items.data.map(item => ({
                price_id: item.price.id,
                amount: item.price.unit_amount,
                currency: item.price.currency,
                nickname: item.price.nickname,
                quantity: item.quantity
              }))
            })));
          } catch (subError) {
            console.warn('Error fetching subscriptions for customer:', customer.id);
          }
        }

        debugInfo.results.subscriptions = {
          total: allSubscriptions.length,
          details: allSubscriptions
        };
      } catch (subscriptionError: any) {
        // If we don't have subscription permissions, that's okay - just skip this part
        if (subscriptionError.type === 'StripePermissionError' && subscriptionError.message?.includes('rak_subscription_read')) {
          debugInfo.results.subscriptions = { 
            error: 'No subscription permissions (this is okay)' 
          };
        } else {
          debugInfo.results.subscriptions = { 
            error: 'Unexpected subscription error',
            details: subscriptionError.message
          };
        }
      }

      // 6. Try a broader search for any objects mentioning this email
      try {
        // Search in events (audit trail)
        const events = await stripe.events.list({
          limit: 50
        });

        const relatedEvents = events.data.filter(event => 
          JSON.stringify(event.data.object).includes(email)
        );

        debugInfo.results.events = {
          total: events.data.length,
          mentioningEmail: relatedEvents.length,
          samples: relatedEvents.slice(0, 3).map(event => ({
            id: event.id,
            type: event.type,
            created: new Date(event.created * 1000).toISOString(),
            object_type: event.data.object
          }))
        };
      } catch (eventError) {
        debugInfo.results.events = { error: 'Could not search events' };
      }

      return NextResponse.json(debugInfo);

    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      return NextResponse.json({ 
        error: "Error searching Stripe data",
        details: stripeError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json({ error: "Failed to debug" }, { status: 500 });
  }
} 