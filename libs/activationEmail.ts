import { sendEmail } from "./mailgun";
import crypto from "crypto";
import { connectToDatabase } from "@/libs/mongo";
import User from "@/models/User";

export async function sendActivationEmail(userEmail: string): Promise<void> {
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24);
  
  // Store token in database
  await connectToDatabase();
  await User.findOneAndUpdate(
    { email: userEmail },
    { 
      'activationToken.token': token,
      'activationToken.expires': expiryDate 
    }
  );
  
  const activationUrl = `${process.env.NEXTAUTH_URL}/api/activate-pro?token=${token}&email=${encodeURIComponent(userEmail)}`;
  
  // Use existing sendEmail function
  await sendEmail({
    to: userEmail,
    subject: "🎉 Activate Your Pro Plan!",
    text: `Thanks for subscribing! Click here to activate your Pro plan: ${activationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thanks for subscribing!</h2>
        <p>Click the button below to activate your Pro plan:</p>
        <a href="${activationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; border-radius: 4px; margin: 10px 0;">
          Activate Pro Plan
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${activationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `
  });
}