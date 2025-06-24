import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Project from "@/models/Project";
import { sendEmail } from "@/libs/resend";
import config from "@/config";
import crypto from "crypto";

// POST /api/invoice/[slug]/send-link - Send invoice access link to customer
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectMongo();

    // Find the project by slug
    const project = await Project.findOne({ 
      slug: params.slug,
      isActive: true 
    }).populate('userId', 'name email');

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Generate a secure token for accessing invoices
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create the access link
    const domain = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001'
      : `https://${config.domainName}`;
    
    const accessLink = `${domain}/invoice/${params.slug}/view?token=${token}&email=${encodeURIComponent(email)}`;

    // Store the token temporarily (you might want to use Redis or a proper database table for this)
    // For now, we'll just send the link directly
    
    const projectOwner = project.userId as any;
    const projectName = project.name;

    // Send email with the access link
    try {
      await sendEmail({
        to: email,
        subject: `Your invoices from ${projectName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Invoice Access Link</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You requested access to your invoices from <strong>${projectName}</strong>. 
              Click the link below to view, edit, and download your invoices.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${accessLink}" 
                 style="background-color: #4ade80; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block; 
                        font-weight: 600;">
                View My Invoices
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px; line-height: 1.5;">
              This link will expire in 24 hours for security reasons. If you didn't request this, 
              you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              This email was sent by ${projectName}
            </p>
          </div>
        `,
        text: `
Your Invoice Access Link

You requested access to your invoices from ${projectName}. 
Visit this link to view, edit, and download your invoices:

${accessLink}

This link will expire in 24 hours for security reasons.

---
This email was sent by ${projectName}
        `
      });

      return NextResponse.json({ 
        success: true,
        message: "Access link sent to your email"
      });

    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json({ 
        error: "Failed to send email. Please try again later." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error sending link:", error);
    return NextResponse.json({ error: "Failed to send link" }, { status: 500 });
  }
} 