import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import Stripe from "stripe";

// GET /api/invoice/[slug]/debug-account - Debug account information
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
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
      project: {
        name: project.name,
        slug: project.slug,
        stripeAccountName: project.stripeAccountName
      },
      account: null,
      charges: null,
      customers: null,
      permissions: {
        accountRead: false,
        chargesRead: false,
        customersRead: false
      },
      extractedBusinessData: null,
      recommendations: []
    };

    // Test 1: Account Access
    try {
      const account = await stripe.accounts.retrieve();
      debugInfo.permissions.accountRead = true;
      debugInfo.account = {
        id: account.id,
        country: account.country,
        email: account.email,
        business_type: account.business_type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        default_currency: account.default_currency,
        created: new Date(account.created * 1000).toISOString(),
        
        business_profile: {
          exists: !!account.business_profile,
          name: account.business_profile?.name || null,
          support_email: account.business_profile?.support_email || null,
          support_phone: account.business_profile?.support_phone || null,
          url: account.business_profile?.url || null,
          mcc: account.business_profile?.mcc || null,
          support_address: account.business_profile?.support_address ? {
            line1: account.business_profile.support_address.line1,
            line2: account.business_profile.support_address.line2,
            city: account.business_profile.support_address.city,
            state: account.business_profile.support_address.state,
            postal_code: account.business_profile.support_address.postal_code,
            country: account.business_profile.support_address.country
          } : null
        },
        
        settings: {
          exists: !!account.settings,
          dashboard_display_name: account.settings?.dashboard?.display_name || null,
          branding: account.settings?.branding ? {
            icon: !!account.settings.branding.icon,
            logo: !!account.settings.branding.logo,
            primary_color: account.settings.branding.primary_color,
            secondary_color: account.settings.branding.secondary_color
          } : null
        },

        company: account.company ? {
          name: (account.company as any).name || null,
          tax_id: (account.company as any).tax_id || null,
          phone: (account.company as any).phone || null,
          address: (account.company as any).address || null
        } : null,

        individual: account.individual ? {
          first_name: (account.individual as any).first_name || null,
          last_name: (account.individual as any).last_name || null,
          email: (account.individual as any).email || null,
          phone: (account.individual as any).phone || null,
          ssn_last_4: (account.individual as any).ssn_last_4 || null
        } : null
      };

      // Analyze what business data we can extract
      let extractedName = 'Not Available';
      let extractedEmail = 'Not Available';
      let extractedAddress = 'Not Available';
      let extractedPhone = 'Not Available';

      if (account.business_profile?.name) {
        extractedName = account.business_profile.name;
      } else if (account.settings?.dashboard?.display_name) {
        extractedName = account.settings.dashboard.display_name;
      } else if (account.email) {
        extractedName = `Account: ${account.email}`;
      } else if ((account.company as any)?.name) {
        extractedName = (account.company as any).name;
      } else if (account.individual) {
        const ind = account.individual as any;
        if (ind.first_name && ind.last_name) {
          extractedName = `${ind.first_name} ${ind.last_name}`;
        }
      }

      if (account.business_profile?.support_email) {
        extractedEmail = account.business_profile.support_email;
      } else if (account.email) {
        extractedEmail = account.email;
      } else if ((account.individual as any)?.email) {
        extractedEmail = (account.individual as any).email;
      }

      if (account.business_profile?.support_address) {
        const addr = account.business_profile.support_address;
        extractedAddress = `${addr.line1 || ''} ${addr.city || ''} ${addr.postal_code || ''} ${addr.country || ''}`.trim();
      } else if ((account.company as any)?.address) {
        const addr = (account.company as any).address;
        extractedAddress = `${addr.line1 || ''} ${addr.city || ''} ${addr.postal_code || ''} ${addr.country || ''}`.trim();
      }

      if (account.business_profile?.support_phone) {
        extractedPhone = account.business_profile.support_phone;
      } else if ((account.company as any)?.phone) {
        extractedPhone = (account.company as any).phone;
      } else if ((account.individual as any)?.phone) {
        extractedPhone = (account.individual as any).phone;
      }

      debugInfo.extractedBusinessData = {
        name: extractedName,
        email: extractedEmail,
        address: extractedAddress,
        phone: extractedPhone
      };

      // Recommendations based on what's missing
      if (!account.business_profile) {
        debugInfo.recommendations.push("Complete your Stripe business profile for better business information extraction");
      }
      if (!account.business_profile?.name) {
        debugInfo.recommendations.push("Add a business name to your Stripe business profile");
      }
      if (!account.business_profile?.support_address) {
        debugInfo.recommendations.push("Add a support address to your Stripe business profile");
      }
      if (!account.business_profile?.support_email) {
        debugInfo.recommendations.push("Add a support email to your Stripe business profile");
      }

    } catch (accountError: any) {
      debugInfo.account = {
        error: accountError.message,
        type: accountError.type,
        code: accountError.code
      };
      
      if (accountError.type === 'StripePermissionError') {
        debugInfo.recommendations.push("Enable 'Connect: READ' permission in your Stripe restricted API key");
      }
    }

    // Test 2: Charges Access (fallback method)
    try {
      const charges = await stripe.charges.list({ limit: 5 });
      debugInfo.permissions.chargesRead = true;
      debugInfo.charges = {
        total: charges.data.length,
        samples: charges.data.slice(0, 3).map(charge => ({
          id: charge.id,
          amount: charge.amount / 100,
          currency: charge.currency,
          created: new Date(charge.created * 1000).toISOString(),
          billing_details: charge.billing_details ? {
            name: charge.billing_details.name,
            email: charge.billing_details.email,
            phone: charge.billing_details.phone,
            address: charge.billing_details.address
          } : null
        }))
      };

      // If account access failed but we have charges, suggest using billing details
      if (!debugInfo.permissions.accountRead && charges.data.length > 0) {
        debugInfo.recommendations.push("Business information can be extracted from charge billing details as fallback");
      }

    } catch (chargeError: any) {
      debugInfo.charges = {
        error: chargeError.message,
        type: chargeError.type
      };
    }

    // Test 3: Customers Access
    try {
      const customers = await stripe.customers.list({ limit: 5 });
      debugInfo.permissions.customersRead = true;
      debugInfo.customers = {
        total: customers.data.length,
        samples: customers.data.slice(0, 3).map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          created: new Date(customer.created * 1000).toISOString(),
          address: customer.address
        }))
      };
    } catch (customerError: any) {
      debugInfo.customers = {
        error: customerError.message,
        type: customerError.type
      };
    }

    // Overall assessment
    debugInfo.summary = {
      hasBusinessInfo: debugInfo.permissions.accountRead && (
        debugInfo.account?.business_profile?.name || 
        debugInfo.account?.settings?.dashboard_display_name ||
        debugInfo.account?.email
      ),
      canUseFallback: debugInfo.permissions.chargesRead && debugInfo.charges?.total > 0,
      needsPermissions: !debugInfo.permissions.accountRead && 
                       (!debugInfo.permissions.chargesRead || debugInfo.charges?.total === 0)
    };

    return NextResponse.json(debugInfo);

  } catch (error: any) {
    console.error("Debug account API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
} 