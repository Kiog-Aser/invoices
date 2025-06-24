import { NextRequest, NextResponse } from "next/server";
import { sendEmail, sendWelcomeEmail, sendNotificationEmail } from "@/libs/resend";

// POST /api/test-email - Test email sending functionality
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, type = 'basic' } = body;

    if (!to) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(to, 'Test User');
        break;
      
      case 'notification':
        result = await sendNotificationEmail('Test Notification', 'This is a test notification email sent via Resend.');
        break;
      
      case 'basic':
      default:
        result = await sendEmail({
          to,
          subject: 'Test Email from Resend',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">✅ Resend is Working!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                This is a test email to verify that your Resend integration is working correctly.
              </p>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>🎉 Success!</strong> Your email system is properly configured.
                </p>
              </div>
              
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                Sent via Resend API
              </p>
            </div>
          `,
          text: `
✅ Resend is Working!

This is a test email to verify that your Resend integration is working correctly.

🎉 Success! Your email system is properly configured.

Sent via Resend API
          `
        });
        break;
    }

    return NextResponse.json({ 
      success: true,
      message: `${type} email sent successfully`,
      emailId: result?.id
    });

  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to send test email" 
    }, { status: 500 });
  }
}

// GET /api/test-email - Show available test types
export async function GET() {
  return NextResponse.json({
    message: "Email testing endpoint",
    usage: "POST to this endpoint with { \"to\": \"email@example.com\", \"type\": \"basic|welcome|notification\" }",
    types: {
      basic: "Basic test email",
      welcome: "Welcome email template",
      notification: "Admin notification email (uses forwardRepliesTo config)"
    }
  });
} 