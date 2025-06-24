import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import User from "@/models/User";
import Stripe from "stripe";

// GET /api/projects - List user's projects
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectMongo();

    const projects = await Project.find({ 
      userId: session.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Format projects for consistent frontend consumption
    const formattedProjects = projects.map(project => ({
      id: project._id.toString(),
      name: project.name,
      customName: project.customName,
      stripeAccountName: project.stripeAccountName,
      slug: project.slug,
      description: project.description,
      publicUrl: `/invoice/${project.slug}`,
      createdAt: project.createdAt,
      totalSearches: project.totalSearches,
      lastUsed: project.lastUsed
    }));

    return NextResponse.json({ projects: formattedProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { stripeApiKey, customName } = body;

    if (!stripeApiKey) {
      return NextResponse.json({ 
        error: "Stripe API key is required" 
      }, { status: 400 });
    }

    // Validate that it's a restricted key
    if (!stripeApiKey.startsWith('rk_')) {
      return NextResponse.json({ 
        error: "Please use a restricted API key (starts with 'rk_')" 
      }, { status: 400 });
    }

    // Validate Stripe API key and get account info
    let stripeAccountName = 'Unknown Account';
    
    try {
      const stripe = new Stripe(stripeApiKey, {
        apiVersion: "2025-02-24.acacia",
      });
      
      // Test invoice access with a simple list request
      await stripe.invoices.list({ limit: 1 });
      
      // Try to get account information
      try {
        const account = await stripe.accounts.retrieve();
        stripeAccountName = account.business_profile?.name || 
                           account.settings?.dashboard?.display_name || 
                           account.email || 
                           'Stripe Account';
      } catch (accountError) {
        // If we can't get account info, try to get business name from a customer or invoice
        try {
          const charges = await stripe.charges.list({ limit: 1 });
          if (charges.data.length > 0) {
            stripeAccountName = charges.data[0].billing_details?.name || 'Stripe Account';
          }
        } catch {
          // Keep default name if all attempts fail
        }
      }
    } catch (stripeError: any) {
      console.error("Stripe validation error:", stripeError);
      return NextResponse.json({ 
        error: `Invalid Stripe API key or insufficient permissions. Please ensure your restricted key has 'Invoices: Read' and 'Customers: Read' permissions.` 
      }, { status: 400 });
    }

    await connectMongo();

    // Generate project name and slug
    const timestamp = Date.now();
    const displayName = customName || stripeAccountName || `Project ${timestamp}`;
    
    let baseSlug;
    if (customName && customName.trim()) {
      // Clean up custom name for slug: lowercase, replace non-alphanumeric with hyphens, remove leading/trailing hyphens
      baseSlug = customName.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      
      // If after cleaning, the slug is empty or too short, fallback to timestamp
      if (!baseSlug || baseSlug.length < 2) {
        baseSlug = `project-${timestamp}`;
      }
    } else {
      baseSlug = `project-${timestamp}`;
    }
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await Project.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the project
    const project = new Project({
      name: displayName,
      customName: customName || null,
      stripeAccountName,
      stripeApiKey,
      description: `Created ${new Date().toLocaleDateString()}`,
      slug,
      userId: session.user.id,
    });

    await project.save();

    // Update user's project count
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { totalProjects: 1 }
    });

    return NextResponse.json({ 
      project: {
        id: project._id.toString(),
        name: project.name,
        customName: project.customName,
        stripeAccountName: project.stripeAccountName,
        slug: project.slug,
        description: project.description,
        publicUrl: `/invoice/${project.slug}`,
        createdAt: project.createdAt,
        totalSearches: project.totalSearches,
        lastUsed: project.lastUsed
      }
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

// PUT /api/projects - Update project name
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, customName } = body;

    if (!projectId || !customName) {
      return NextResponse.json({ 
        error: "Project ID and custom name are required" 
      }, { status: 400 });
    }

    await connectMongo();

    // Find and update the project
    const project = await Project.findOneAndUpdate(
      { 
        _id: projectId,
        userId: session.user.id,
        isActive: true 
      },
      { 
        customName: customName.trim(),
        name: customName.trim() // Update display name too
      },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      project: {
        id: project._id.toString(),
        name: project.name,
        customName: project.customName,
        stripeAccountName: project.stripeAccountName,
        slug: project.slug,
        description: project.description,
        publicUrl: `/invoice/${project.slug}`,
        createdAt: project.createdAt,
        totalSearches: project.totalSearches,
        lastUsed: project.lastUsed
      }
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
} 