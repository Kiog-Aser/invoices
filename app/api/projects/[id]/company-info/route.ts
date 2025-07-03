import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import Stripe from "stripe";

// Function to extract domain from URL
const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`);
    return domain.hostname.replace('www.', '');
  } catch {
    return url.replace('www.', '').replace(/^https?:\/\//, '');
  }
};

// Function to get favicon URL
const getFaviconUrl = (domain: string): string => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};

// Function to get company logo from Clearbit (free tier)
const getCompanyLogo = async (domain: string): Promise<string | null> => {
  try {
    const logoUrl = `https://logo.clearbit.com/${domain}`;
    // Check if logo exists by making a HEAD request
    const response = await fetch(logoUrl, { method: 'HEAD' });
    if (response.ok) {
      return logoUrl;
    }
  } catch (error) {
    console.log('Clearbit logo not found for:', domain);
  }
  return null;
};

// Function to extract website from business profile or fallback methods
const extractWebsiteUrl = async (stripe: Stripe, companyName: string): Promise<string | null> => {
  try {
    // Try to get website from account business profile
    const account = await stripe.accounts.retrieve();
    if (account.business_profile?.url) {
      return account.business_profile.url;
    }
  } catch (error) {
    console.log('Could not retrieve account info:', error);
  }

  // If no website found, try to guess from company name
  if (companyName && companyName !== 'Your Company') {
    const cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .replace(/(inc|llc|ltd|corp|company|co)$/, '');
    
    // Try common TLDs
    const possibleDomains = [
      `${cleanName}.com`,
      `${cleanName}.io`,
      `${cleanName}.net`,
      `${cleanName}.org`
    ];

    for (const domain of possibleDomains) {
      try {
        const response = await fetch(`https://${domain}`, { 
          method: 'HEAD', 
          signal: AbortSignal.timeout(3000) 
        });
        if (response.ok) {
          return `https://${domain}`;
        }
      } catch {
        // Continue to next domain
      }
    }
  }

  return null;
};

// PUT /api/projects/[id]/company-info - Fetch and update company information
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectMongo();

    const project = await Project.findOne({ 
      _id: params.id,
      userId: session.user.id,
      isActive: true 
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Initialize Stripe with the project's API key
    const stripe = new Stripe(project.stripeApiKey, {
      apiVersion: "2025-02-24.acacia",
    });

    let companyInfo = {
      name: project.name,
      website: '',
      logoUrl: '',
      favicon: '',
      primaryColor: '',
      email: '',
      country: '',
      lastUpdated: new Date()
    };

    try {
      // Try to get account information from Stripe
      const account = await stripe.accounts.retrieve();
      
      // Extract company information from Stripe
      companyInfo.name = account.business_profile?.name || 
                        account.settings?.dashboard?.display_name || 
                        project.name;
      companyInfo.email = account.business_profile?.support_email || account.email || '';
      companyInfo.country = account.country || '';
      companyInfo.primaryColor = account.settings?.branding?.primary_color || '';
      
      // Get website URL
      const website = await extractWebsiteUrl(stripe, companyInfo.name);
      if (website) {
        companyInfo.website = website;
        const domain = extractDomain(website);
        
        // Get favicon
        companyInfo.favicon = getFaviconUrl(domain);
        
        // Try to get company logo
        const logo = await getCompanyLogo(domain);
        if (logo) {
          companyInfo.logoUrl = logo;
        }
      }

    } catch (stripeError: any) {
      console.log('Stripe account access limited, using fallback methods');
      
      // Fallback: try to extract info from recent charges/customers
      try {
        const charges = await stripe.charges.list({ limit: 5 });
        if (charges.data.length > 0) {
          const recentCharge = charges.data[0];
          if (recentCharge.billing_details?.name) {
            companyInfo.name = recentCharge.billing_details.name;
          }
          if (recentCharge.billing_details?.email) {
            companyInfo.email = recentCharge.billing_details.email;
          }
        }
      } catch (fallbackError) {
        console.log('Fallback method also failed, using project name');
      }
    }

    // Update project with company information
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      { companyInfo },
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      companyInfo,
      project: {
        id: updatedProject._id.toString(),
        name: updatedProject.name,
        customName: updatedProject.customName,
        stripeAccountName: updatedProject.stripeAccountName,
        companyInfo: updatedProject.companyInfo,
        slug: updatedProject.slug,
        description: updatedProject.description,
        publicUrl: `/invoice/${updatedProject.slug}`,
        createdAt: updatedProject.createdAt,
        totalSearches: updatedProject.totalSearches,
        lastUsed: updatedProject.lastUsed
      }
    });

  } catch (error: any) {
    console.error("Error updating company info:", error);
    return NextResponse.json({ 
      error: "Failed to update company information",
      details: error.message 
    }, { status: 500 });
  }
} 