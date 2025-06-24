import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import Stripe from "stripe";

// GET /api/invoice/[slug]/list - List customer invoices with valid token
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return NextResponse.json({ error: "Email and token are required" }, { status: 400 });
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

    // In a production app, you'd validate the token against a stored value
    // For now, we'll proceed with the request
    
    // Initialize Stripe with the project's API key
    const stripe = new Stripe(project.stripeApiKey, {
      apiVersion: "2025-02-24.acacia",
    });

    try {
      // Search across multiple Stripe objects to find all transactions for this customer
      const allTransactions: any[] = [];

      // 1. Search Invoices (original logic)
      const invoices = await stripe.invoices.list({
        limit: 100,
        expand: ['data.customer']
      });

      const customerInvoices = invoices.data.filter(invoice => {
        const customer = invoice.customer as Stripe.Customer;
        return customer && typeof customer === 'object' && customer.email === email;
      });

      // Add invoices to results
      customerInvoices.forEach(invoice => {
        const customer = invoice.customer as Stripe.Customer;
        const totalAmount = invoice.total / 100;
        const paidAmount = invoice.amount_paid / 100;
        
        allTransactions.push({
          id: invoice.id,
          type: 'invoice',
          number: invoice.number || 'N/A',
          customerId: typeof customer === 'object' ? customer.id : null,
          amount: totalAmount,
          amountPaid: paidAmount,
          currency: invoice.currency.toUpperCase(),
          status: invoice.status,
          created: new Date(invoice.created * 1000).toLocaleDateString(),
          dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toLocaleDateString() : null,
          description: invoice.description || 'Invoice',
          customerName: customer?.name || 'N/A',
          customerEmail: customer?.email || email,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
          paid: invoice.paid,
          isFree: totalAmount === 0,
          lines: invoice.lines.data.map(line => ({
            description: line.description,
            amount: line.amount / 100,
            quantity: line.quantity
          }))
        });
      });

      // 2. Search Charges (including free charges)
      const charges = await stripe.charges.list({
        limit: 100,
        expand: ['data.customer']
      });

      const customerCharges = charges.data.filter(charge => {
        // Check if charge matches customer email
        if (charge.billing_details?.email === email) return true;
        if (charge.receipt_email === email) return true;
        const customer = charge.customer as Stripe.Customer;
        return customer && typeof customer === 'object' && customer.email === email;
      });

      // Add charges to results (avoid duplicates with invoices)
      customerCharges.forEach(charge => {
        // Skip if this charge is already covered by an invoice
        const isDuplicate = allTransactions.some(t => 
          t.type === 'invoice' && t.id === charge.invoice
        );
        
        if (!isDuplicate) {
          const customer = charge.customer as Stripe.Customer;
          const amount = charge.amount / 100;
          
          allTransactions.push({
            id: charge.id,
            type: 'charge',
            number: charge.receipt_number || 'N/A',
            customerId: typeof customer === 'object' ? customer.id : null,
            amount: amount,
            amountPaid: charge.paid ? amount : 0,
            currency: charge.currency.toUpperCase(),
            status: charge.status,
            created: new Date(charge.created * 1000).toLocaleDateString(),
            dueDate: null,
            description: charge.description || 'Charge',
            customerName: customer?.name || charge.billing_details?.name || 'N/A',
            customerEmail: customer?.email || charge.billing_details?.email || email,
            hostedInvoiceUrl: charge.receipt_url,
            invoicePdf: null,
            paid: charge.paid,
            isFree: amount === 0,
            lines: [{
              description: charge.description || 'Charge',
              amount: amount,
              quantity: 1
            }]
          });
        }
      });

      // 3. Search Payment Intents (for additional free orders)
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        expand: ['data.customer']
      });

      const customerPaymentIntents = paymentIntents.data.filter(pi => {
        // Check if payment intent matches customer email
        if (pi.receipt_email === email) return true;
        const customer = pi.customer as Stripe.Customer;
        return customer && typeof customer === 'object' && customer.email === email;
      });

      // Add payment intents to results (avoid duplicates)
      customerPaymentIntents.forEach(pi => {
        // Skip if this payment intent is already covered by an invoice or charge
        const isDuplicate = allTransactions.some(t => 
          (t.type === 'invoice' && t.id === pi.invoice) ||
          (t.type === 'charge' && t.id.startsWith('ch_') && pi.id === t.id)
        );
        
        if (!isDuplicate) {
          const customer = pi.customer as Stripe.Customer;
          const amount = pi.amount / 100;
          
          allTransactions.push({
            id: pi.id,
            type: 'payment_intent',
            number: pi.receipt_email || 'N/A',
            customerId: typeof customer === 'object' ? customer.id : null,
            amount: amount,
            amountPaid: pi.status === 'succeeded' ? amount : 0,
            currency: pi.currency.toUpperCase(),
            status: pi.status,
            created: new Date(pi.created * 1000).toLocaleDateString(),
            dueDate: null,
            description: pi.description || 'Payment',
            customerName: customer?.name || 'N/A',
            customerEmail: customer?.email || pi.receipt_email || email,
            hostedInvoiceUrl: null,
            invoicePdf: null,
            paid: pi.status === 'succeeded',
            isFree: amount === 0,
            lines: [{
              description: pi.description || 'Payment',
              amount: amount,
              quantity: 1
            }]
          });
        }
      });

      // 4. Find customers and check for subscriptions/metadata about free orders
      const customers = await stripe.customers.list({
        email: email,
        limit: 10
      });

      // Check subscriptions for each customer (free trials, free plans, etc.)
      // Only attempt if we likely have subscription permissions
      for (const customer of customers.data) {
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            limit: 50
          });

          subscriptions.data.forEach(subscription => {
            // Check if subscription has free items or trials
            const hasFreeItems = subscription.items.data.some(item => 
              item.price.unit_amount === 0 || item.price.unit_amount === null
            );
            
            const isTrialing = subscription.status === 'trialing';
            const isFreeSubscription = hasFreeItems || isTrialing;

            if (isFreeSubscription) {
              // Avoid duplicates - check if we already have this subscription as an invoice
              const isDuplicate = allTransactions.some(t => 
                t.type === 'invoice' && t.id === subscription.latest_invoice
              );

              if (!isDuplicate) {
                allTransactions.push({
                  id: subscription.id,
                  type: 'subscription',
                  number: subscription.id.slice(-8).toUpperCase(),
                  customerId: customer.id,
                  amount: 0,
                  amountPaid: 0,
                  currency: subscription.currency?.toUpperCase() || 'USD',
                  status: subscription.status,
                  created: new Date(subscription.created * 1000).toLocaleDateString(),
                  dueDate: subscription.trial_end ? new Date(subscription.trial_end * 1000).toLocaleDateString() : null,
                  description: isTrialing ? 'Free Trial' : 'Free Subscription',
                  customerName: customer.name || 'N/A',
                  customerEmail: customer.email || email,
                  hostedInvoiceUrl: null,
                  invoicePdf: null,
                  paid: true,
                  isFree: true,
                  lines: subscription.items.data.map(item => ({
                    description: item.price.nickname || item.price.lookup_key || 'Free subscription item',
                    amount: 0,
                    quantity: item.quantity || 1
                  }))
                });
              }
            }
          });
        } catch (subError: any) {
          // If it's a permission error for subscriptions, skip gracefully
          if (subError.type === 'StripePermissionError' && subError.message?.includes('rak_subscription_read')) {
            console.log('Subscription permissions not available, skipping subscription check for customer:', customer.id);
            // Continue without breaking - this is not critical for business details
          } else {
            console.warn('Error fetching subscriptions for customer:', customer.id, subError);
          }
        }
      }

      // If we still found customers but no transactions, create a customer record placeholder
      if (customers.data.length > 0 && allTransactions.length === 0) {
        customers.data.forEach(customer => {
          // Check if customer has metadata indicating free orders or subscriptions
          const metadata = customer.metadata || {};
          const hasFreeOrders = Object.keys(metadata).some(key => 
            key.toLowerCase().includes('free') || 
            key.toLowerCase().includes('trial') ||
            key.toLowerCase().includes('complimentary')
          );

          if (hasFreeOrders || customer.balance === 0) {
            allTransactions.push({
              id: customer.id,
              type: 'customer_record',
              number: 'CUSTOMER',
              customerId: customer.id,
              amount: 0,
              amountPaid: 0,
              currency: 'USD',
              status: 'active',
              created: new Date(customer.created * 1000).toLocaleDateString(),
              dueDate: null,
              description: 'Customer Record (Free Account)',
              customerName: customer.name || 'N/A',
              customerEmail: customer.email || email,
              hostedInvoiceUrl: null,
              invoicePdf: null,
              paid: true,
              isFree: true,
              lines: [{
                description: 'Free customer account',
                amount: 0,
                quantity: 1
              }]
            });
          }
        });
      }

      // Sort transactions by date (newest first)
      allTransactions.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

      return NextResponse.json({ 
        invoices: allTransactions,
        total: allTransactions.length,
        project: {
          name: project.name,
          slug: project.slug
        },
        searchDetails: {
          invoicesFound: customerInvoices.length,
          chargesFound: customerCharges.length,
          paymentIntentsFound: customerPaymentIntents.length,
          customersFound: customers.data.length,
          totalTransactions: allTransactions.length,
          searchTypes: ['invoices', 'charges', 'payment_intents', 'subscriptions', 'customers']
        }
      });

    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      return NextResponse.json({ 
        error: "Error fetching invoices. Please try again later." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error listing invoices:", error);
    return NextResponse.json({ error: "Failed to list invoices" }, { status: 500 });
  }
} 