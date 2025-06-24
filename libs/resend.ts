import { Resend } from 'resend';
import config from "@/config";

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "development") {
  console.group("⚠️ RESEND_API_KEY missing from .env");
  console.error("It's not mandatory but it's required to send emails.");
  console.error("If you don't need it, remove the code from /libs/resend.ts");
  console.groupEnd();
}

/**
 * Sends an email using Resend with the provided parameters.
 *
 * @async
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text content of the email.
 * @param {string} html - The HTML content of the email.
 * @param {string} replyTo - The email address to set as the "Reply-To" address.
 * @returns {Promise} A Promise that resolves when the email is sent.
 */
export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}): Promise<any> => {
  try {
    const emailData: any = {
      from: config.resend.fromAdmin,
      to: [to],
      subject,
    };

    // Add content (text or html)
    if (html) {
      emailData.html = html;
    }
    if (text) {
      emailData.text = text;
    }
    
    // Add reply-to if provided
    if (replyTo) {
      emailData.replyTo = replyTo;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Sends a welcome email to a new user
 */
export const sendWelcomeEmail = async (to: string, userName: string) => {
  return sendEmail({
    to,
    subject: `Welcome to ${config.appName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Welcome to ${config.appName}!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Hi ${userName},
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Thank you for joining ${config.appName}! We're excited to have you on board.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.domainName}/dashboard" 
             style="background-color: #4ade80; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block; 
                    font-weight: 600;">
            Get Started
          </a>
        </div>
        
        <p style="color: #888; font-size: 14px; margin-top: 30px; line-height: 1.5;">
          If you have any questions, feel free to reach out to our support team.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #888; font-size: 12px; text-align: center;">
          Best regards,<br>
          The ${config.appName} Team
        </p>
      </div>
    `,
    text: `
Welcome to ${config.appName}!

Hi ${userName},

Thank you for joining ${config.appName}! We're excited to have you on board.

Get started by visiting: ${config.domainName}/dashboard

If you have any questions, feel free to reach out to our support team.

Best regards,
The ${config.appName} Team
    `
  });
};

/**
 * Sends a notification email to admin
 */
export const sendNotificationEmail = async (subject: string, message: string) => {
  if (!config.resend.forwardRepliesTo) {
    console.warn('No admin email configured for notifications');
    return;
  }

  return sendEmail({
    to: config.resend.forwardRepliesTo,
    subject: `${config.appName} Notification: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">${config.appName} Notification</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          <strong>Subject:</strong> ${subject}
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
          ${message}
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #888; font-size: 12px; text-align: center;">
          This is an automated notification from ${config.appName}
        </p>
      </div>
    `,
    text: `
${config.appName} Notification

Subject: ${subject}

${message}

---
This is an automated notification from ${config.appName}
    `
  });
}; 