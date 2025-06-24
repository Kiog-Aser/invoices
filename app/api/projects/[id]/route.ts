import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import User from "@/models/User";
import Stripe from "stripe";

// GET /api/projects/[id] - Get a specific project
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { name, stripeApiKey, description } = body;

    await connectMongo();

    const project = await Project.findOne({ 
      _id: params.id,
      userId: session.user.id,
      isActive: true 
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If API key is being updated, validate it
    if (stripeApiKey && stripeApiKey !== project.stripeApiKey) {
      try {
        const stripe = new Stripe(stripeApiKey, {
          apiVersion: "2025-02-24.acacia",
        });
        
        await stripe.accounts.retrieve();
      } catch (stripeError) {
        return NextResponse.json({ 
          error: "Invalid Stripe API key. Please ensure you're using a restricted API key with invoice access." 
        }, { status: 400 });
      }
    }

    // Update the project
    if (name) project.name = name;
    if (stripeApiKey) project.stripeApiKey = stripeApiKey;
    if (description !== undefined) project.description = description;

    await project.save();

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
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Soft delete
    project.isActive = false;
    await project.save();

    // Update user's project count
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { totalProjects: -1 }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
} 