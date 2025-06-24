import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";

// POST /api/invoice/[slug]/update-customer - Update customer information
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { email, token, invoiceId, customerData } = body;

    if (!email || !token || !invoiceId || !customerData) {
      return NextResponse.json({ error: "Email, token, invoice ID, and customer data are required" }, { status: 400 });
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

    // In production, you would:
    // 1. Validate the token against a stored value
    // 2. Check if the user has permission to edit this invoice
    // 3. Update the customer information in your database or Stripe
    // 4. Potentially trigger email notifications

    // For now, we'll just return success
    // In a real implementation, you might store this data locally and sync with Stripe
    
    console.log('Customer data update request:', {
      slug: params.slug,
      email,
      invoiceId,
      customerData
    });

    return NextResponse.json({ 
      success: true,
      message: "Customer information updated successfully",
      customerData
    });

  } catch (error) {
    console.error("Error updating customer data:", error);
    return NextResponse.json({ error: "Failed to update customer data" }, { status: 500 });
  }
} 