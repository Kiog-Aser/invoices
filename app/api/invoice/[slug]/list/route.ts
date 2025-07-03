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
      return NextResponse.json({ error: "Email and token are required", transactions: [] }, { status: 400 });
    }

    await connectMongo();

    // Find the project by slug
    const project = await Project.findOne({ 
      slug: params.slug,
      isActive: true 
    });

    // --- Ensure tokens array exists for migration ---
    if (!project.tokens) {
      project.tokens = [];
      await project.save();
      console.log('Migrated project.tokens to [] for project', project.slug); // DEBUG
    }

    if (!project || !project.stripeApiKey) {
      return NextResponse.json({ error: "Project not found or Stripe key missing", transactions: [] }, { status: 404 });
    }

    // --- Token validation: allow 'test' as a valid token for development ---
    console.log('Tokens in project:', project.tokens); // DEBUG
    if (token !== 'test') {
      const validToken = Array.isArray(project.tokens)
        ? project.tokens.find((t: any) => t.email === email && t.token === token && (!t.expires || new Date(t.expires) > new Date()))
        : null;
      if (!validToken) {
        console.log('Token validation failed for:', { email, token }); // DEBUG
        return NextResponse.json({ error: "Invalid or expired token", transactions: [] }, { status: 403 });
      }
    }
    // --- End token validation ---

    // Initialize Stripe with the project's API key
    const stripe = new Stripe(project.stripeApiKey, {
      apiVersion: "2025-02-24.acacia",
    });

    try {
      const allTransactions: any[] = [];

      // 1. Search Invoices
      const invoices = await stripe.invoices.list({
        limit: 100,
        expand: ['data.customer']
      });
      const customerInvoices = (invoices.data || []).filter((invoice: Stripe.Invoice | null) => {
        if (!invoice) return false;
        const customer = invoice.customer as Stripe.Customer | null;
        return customer && typeof customer === 'object' && customer.email === email;
      });
      customerInvoices.forEach((inv: Stripe.Invoice) => {
        if (!inv) return;
        const customer = inv.customer as Stripe.Customer | null;
        const totalAmount = inv.total ? inv.total / 100 : 0;
        const paidAmount = inv.amount_paid ? inv.amount_paid / 100 : 0;
        allTransactions.push({
          id: inv.id || 'N/A',
          type: 'invoice',
          number: inv.number || 'N/A',
          customerId: customer && typeof customer === 'object' ? customer.id : null,
          amount: totalAmount,
          amountPaid: paidAmount,
          currency: inv.currency ? inv.currency.toUpperCase() : 'USD',
          status: inv.status || 'unknown',
          created: inv.created ? new Date(inv.created * 1000).toISOString() : '',
          dueDate: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
          description: inv.description || 'Invoice',
          customerName: customer?.name || 'N/A',
          customerEmail: customer?.email || email,
          hostedInvoiceUrl: inv.hosted_invoice_url || null,
          invoicePdf: inv.invoice_pdf || null,
          paid: !!inv.paid,
          isFree: totalAmount === 0,
          lines: Array.isArray(inv.lines?.data) ? inv.lines.data.filter(Boolean).map((line: Stripe.InvoiceLineItem) => ({
            description: line?.description || 'N/A',
            amount: line?.amount ? line.amount / 100 : 0,
            quantity: line?.quantity || 1
          })) : []
        });
      });

      // 2. Search Charges
      const charges = await stripe.charges.list({
        limit: 100,
        expand: ['data.customer']
      });
      const customerCharges = (charges.data || []).filter((charge: Stripe.Charge | null) => {
        if (!charge) return false;
        if (charge.billing_details?.email === email) return true;
        if (charge.receipt_email === email) return true;
        const customer = charge.customer as Stripe.Customer | null;
        return customer && typeof customer === 'object' && customer.email === email;
      });
      customerCharges.forEach((charge: Stripe.Charge) => {
        if (!charge) return;
        const isDuplicate = allTransactions.some((t: any) => t.type === 'invoice' && t.id === charge.invoice);
        if (!isDuplicate) {
          const customer = charge.customer as Stripe.Customer | null;
          const amount = charge.amount ? charge.amount / 100 : 0;
          allTransactions.push({
            id: charge.id || 'N/A',
            type: 'charge',
            number: charge.receipt_number || 'N/A',
            customerId: customer && typeof customer === 'object' ? customer.id : null,
            amount: amount,
            amountPaid: charge.paid ? amount : 0,
            currency: charge.currency ? charge.currency.toUpperCase() : 'USD',
            status: charge.status || 'unknown',
            created: charge.created ? new Date(charge.created * 1000).toISOString() : '',
            dueDate: null,
            description: charge.description || 'Charge',
            customerName: customer?.name || charge.billing_details?.name || 'N/A',
            customerEmail: customer?.email || charge.billing_details?.email || email,
            hostedInvoiceUrl: charge.receipt_url || null,
            invoicePdf: null,
            paid: !!charge.paid,
            isFree: amount === 0,
            lines: [{
              description: charge.description || 'Charge',
              amount: amount,
              quantity: 1
            }]
          });
        }
      });

      // 3. Search Payment Intents
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        expand: ['data.customer']
      });
      const customerPaymentIntents = (paymentIntents.data || []).filter((pi: Stripe.PaymentIntent | null) => {
        if (!pi) return false;
        if (pi.receipt_email === email) return true;
        const customer = pi.customer as Stripe.Customer | null;
        return customer && typeof customer === 'object' && customer.email === email;
      });
      customerPaymentIntents.forEach((pi: Stripe.PaymentIntent) => {
        if (!pi) return;
        const isDuplicate = allTransactions.some((t: any) => 
          (t.type === 'invoice' && t.id === pi.invoice) ||
          (t.type === 'charge' && t.id.startsWith('ch_') && pi.id === t.id)
        );
        if (!isDuplicate) {
          const customer = pi.customer as Stripe.Customer | null;
          const amount = pi.amount ? pi.amount / 100 : 0;
          allTransactions.push({
            id: pi.id || 'N/A',
            type: 'payment_intent',
            number: pi.receipt_email || 'N/A',
            customerId: customer && typeof customer === 'object' ? customer.id : null,
            amount: amount,
            amountPaid: pi.status === 'succeeded' ? amount : 0,
            currency: pi.currency ? pi.currency.toUpperCase() : 'USD',
            status: pi.status || 'unknown',
            created: pi.created ? new Date(pi.created * 1000).toISOString() : '',
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
      for (const customer of (customers.data || []).filter(Boolean) as Stripe.Customer[]) {
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            limit: 50
          });
          (subscriptions.data || []).filter(Boolean).forEach((subscription: Stripe.Subscription) => {
            const hasFreeItems = subscription.items.data.some((item: Stripe.SubscriptionItem) => 
              item.price.unit_amount === 0 || item.price.unit_amount === null
            );
            const isTrialing = subscription.status === 'trialing';
            const isFreeSubscription = hasFreeItems || isTrialing;
            if (isFreeSubscription) {
              const isDuplicate = allTransactions.some((t: any) => 
                t.type === 'invoice' && t.id === subscription.latest_invoice
              );
              if (!isDuplicate) {
                allTransactions.push({
                  id: subscription.id || 'N/A',
                  type: 'subscription',
                  number: subscription.id ? subscription.id.slice(-8).toUpperCase() : 'N/A',
                  customerId: customer.id,
                  amount: 0,
                  amountPaid: 0,
                  currency: subscription.currency?.toUpperCase() || 'USD',
                  status: subscription.status || 'unknown',
                  created: subscription.created ? new Date(subscription.created * 1000).toISOString() : '',
                  dueDate: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                  description: isTrialing ? 'Free Trial' : 'Free Subscription',
                  customerName: customer.name || 'N/A',
                  customerEmail: customer.email || email,
                  hostedInvoiceUrl: null,
                  invoicePdf: null,
                  paid: true,
                  isFree: true,
                  lines: (subscription.items && Array.isArray(subscription.items.data))
                    ? subscription.items.data.filter(Boolean).map((item: Stripe.SubscriptionItem) => ({
                        description: item.price.nickname || item.price.lookup_key || 'Free subscription item',
                        amount: 0,
                        quantity: item.quantity || 1
                      }))
                    : []
                });
              }
            }
          });
        } catch (err) {
          console.error(`Error fetching subscriptions for customer ${customer.id}:`, err);
        }
      }

      // Sort transactions by ISO date, most recent first
      allTransactions.sort((a, b) => {
        if (!a.created || !b.created) return 0;
        return b.created.localeCompare(a.created);
      });

      return NextResponse.json({ transactions: allTransactions }, { status: 200 });
    } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json({ error: "Error processing request", transactions: [] }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in GET /api/invoice/[slug]/list:", error);
    return NextResponse.json({ error: "Internal server error", transactions: [] }, { status: 500 });
  }
}