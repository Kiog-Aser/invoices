import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import Stripe from "stripe";

// GET /api/invoice/[slug]/account-info - Get your own account company info from Stripe
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

    try {
      // Retrieve YOUR OWN account information
      // REQUIRED: Enable "Connect: READ" permission in your Stripe restricted API key
      const account = await stripe.accounts.retrieve();

      console.log('Account data retrieved for project:', project.name, {
        hasBusinessProfile: !!account.business_profile,
        hasSettings: !!account.settings,
        hasAddress: !!account.business_profile?.support_address,
        addressDetails: account.business_profile?.support_address || null,
        country: account.country,
        email: account.email
      });

      // More robust data extraction with multiple fallback strategies
      let companyName = 'Your Company';
      let companyEmail = '';
      let companyPhone = '';
      let companyAddress = {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: account.country || ''
      };

      // Strategy 1: Business Profile (most complete)
      if (account.business_profile) {
        companyName = account.business_profile.name || companyName;
        companyEmail = account.business_profile.support_email || companyEmail;
        companyPhone = account.business_profile.support_phone || companyPhone;
        
        if (account.business_profile.support_address) {
          const addr = account.business_profile.support_address;
          companyAddress = {
            line1: addr.line1 || '',
            line2: addr.line2 || '',
            city: addr.city || '',
            state: addr.state || '',
            postal_code: addr.postal_code || '',
            country: addr.country || account.country || ''
          };
        }
      }

      // Strategy 2: Settings Dashboard (alternative source)
      if (!companyName || companyName === 'Your Company') {
        companyName = account.settings?.dashboard?.display_name || companyName;
      }

      // Strategy 3: Account-level email (fallback)
      if (!companyEmail) {
        companyEmail = account.email || '';
      }

      // Strategy 4: Use project name if still no company name
      if (!companyName || companyName === 'Your Company') {
        companyName = project.name || 'Your Company';
      }

      // Extract additional business information with fallbacks
      const companyData = {
        name: companyName,
        email: companyEmail,
        country: account.country || '',
        website: account.business_profile?.url || '',
        phone: companyPhone,
        address: companyAddress,
        
        // Business details
        business_type: account.business_type || '',
        mcc: account.business_profile?.mcc || '',
        tax_id: (account.company as any)?.tax_id || (account.individual as any)?.ssn_last_4 ? `***-**-${(account.individual as any)?.ssn_last_4}` : '',
        
        // Additional company info
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        default_currency: account.default_currency?.toUpperCase() || 'USD',
        created: account.created,
        
        // Branding information
        branding: {
          icon: account.settings?.branding?.icon || null,
          logo: account.settings?.branding?.logo || null,
          primary_color: account.settings?.branding?.primary_color || null,
          secondary_color: account.settings?.branding?.secondary_color || null
        }
      };

      console.log('Extracted company data:', {
        name: companyData.name,
        hasEmail: !!companyData.email,
        hasAddress: !!(companyData.address.line1 || companyData.address.city),
        addressExtracted: companyData.address,
        hasPhone: !!companyData.phone
      });

      return NextResponse.json({
        success: true,
        companyData
      });

    } catch (stripeError: any) {
      console.error('Stripe error fetching account data for project:', project.name, {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message
      });

      // For permission errors, provide specific guidance
      if (stripeError.type === 'StripePermissionError' || stripeError.code === 'permission_denied') {
        return NextResponse.json({ 
          error: "Insufficient API permissions. Please enable Connect: READ permission in your Stripe restricted API key.",
          details: "Go to Stripe Dashboard → Developers → API Keys → Edit your restricted key → Enable Connect section as READ"
        }, { status: 403 });
      }
      
      if (stripeError.type === 'StripeAuthenticationError') {
        return NextResponse.json({ 
          error: "Authentication failed. Please check your API key.",
          details: stripeError.message 
        }, { status: 401 });
      }

      // For other errors, try alternative approaches to get business information
      console.log('Attempting fallback methods to get business information...');
      
      try {
        // Fallback 1: Try to get business info from customer data
        const customers = await stripe.customers.list({ limit: 10 });
        const charges = await stripe.charges.list({ limit: 10 });
        
        let fallbackName = project.name;
        let fallbackEmail = '';
        let fallbackAddress = {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        };

        // Extract business info from recent charges
        if (charges.data.length > 0) {
          const recentCharge = charges.data[0];
          if (recentCharge.billing_details) {
            fallbackName = recentCharge.billing_details.name || fallbackName;
            fallbackEmail = recentCharge.billing_details.email || fallbackEmail;
            if (recentCharge.billing_details.address) {
              const addr = recentCharge.billing_details.address;
              fallbackAddress = {
                line1: addr.line1 || '',
                line2: addr.line2 || '',
                city: addr.city || '',
                state: addr.state || '',
                postal_code: addr.postal_code || '',
                country: addr.country || ''
              };
            }
          }
        }

        // Return fallback data
        const fallbackCompanyData = {
          name: fallbackName,
          email: fallbackEmail,
          country: fallbackAddress.country,
          website: '',
          phone: '',
          address: fallbackAddress,
          business_type: '',
          mcc: '',
          tax_id: '',
          charges_enabled: true,
          payouts_enabled: true,
          default_currency: 'USD',
          created: Math.floor(Date.now() / 1000),
          branding: {
            icon: null,
            logo: null,
            primary_color: null,
            secondary_color: null
          }
        };

        console.log('Using fallback company data:', {
          name: fallbackCompanyData.name,
          hasEmail: !!fallbackCompanyData.email,
          hasAddress: !!(fallbackCompanyData.address.line1 || fallbackCompanyData.address.city)
        });

        return NextResponse.json({
          success: true,
          companyData: fallbackCompanyData,
          fallbackUsed: true
        });

      } catch (fallbackError) {
        console.warn('Fallback method also failed:', fallbackError);
        
        // Last resort: return minimal project-based data
        const minimalCompanyData = {
          name: project.name || 'Your Company',
          email: '',
          country: '',
          website: '',
          phone: '',
          address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: ''
          },
          business_type: '',
          mcc: '',
          tax_id: '',
          charges_enabled: true,
          payouts_enabled: true,
          default_currency: 'USD',
          created: Math.floor(Date.now() / 1000),
          branding: {
            icon: null,
            logo: null,
            primary_color: null,
            secondary_color: null
          }
        };

        return NextResponse.json({
          success: true,
          companyData: minimalCompanyData,
          fallbackUsed: true,
          warning: "Limited business information available"
        });
      }
    }

  } catch (error: any) {
    console.error("Account info API error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
} 