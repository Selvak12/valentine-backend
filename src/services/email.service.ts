import nodemailer from 'nodemailer';
const axios = require('axios');
import Invitation from '../models/Invitation.model';

// Create SMTP transporter as fallback
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

/**
 * Sends email using either Brevo API (preferred for Render) or SMTP (fallback)
 */
export const sendInvitationEmail = async (invitationId: string) => {
  console.log(`[EMAIL_TASK] Starting background task for: ${invitationId}`);

  const invitation = await Invitation.findById(invitationId);
  if (!invitation) return;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${frontendUrl}/#/invite/${invitation.shortCode}`;

  const subject = `Will you be my Valentine? ❤️`;
  const htmlContent = `
    <div style="background-color: #fff5f7; padding: 40px 10px; font-family: sans-serif; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 40px; border: 1px solid #ffe4e9;">
        <div style="font-size: 60px; margin-bottom: 20px;">💌</div>
        <h1 style="color: #f43f5e; margin-bottom: 10px;">For ${invitation.recipientName}</h1>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">${invitation.personalizedMessage || 'Something special is waiting for you.'}</p>
        <a href="${link}" style="display: inline-block; background: #f43f5e; color: #ffffff; padding: 20px 45px; border-radius: 100px; font-weight: bold; font-size: 18px; text-decoration: none; box-shadow: 0 10px 25px rgba(244,63,94,0.3);">Open My Letter ❤️</a>
      </div>
    </div>
  `;

  try {
    // 1. TRY BREVO API (Preferred for Render to avoid SMTP blocking)
    if (process.env.BREVO_API_KEY) {
      console.log(`[EMAIL] Attempting via Brevo API...`);
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: "Valentine 2026", email: process.env.EMAIL_USER },
        to: [{ email: invitation.recipientEmail, name: invitation.recipientName }],
        subject: subject,
        htmlContent: htmlContent
      }, {
        headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' }
      });
      console.log(`[EMAIL] Success via Brevo API`);
    }
    // 2. FALLBACK TO SMTP
    else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log(`[EMAIL] Attempting via SMTP...`);
      const info = await transporter.sendMail({
        from: `"Valentine 2026" <${process.env.EMAIL_USER}>`,
        to: invitation.recipientEmail,
        subject: subject,
        html: htmlContent
      });
      console.log(`[EMAIL] Success via SMTP: ${info.messageId}`);
    } else {
      throw new Error('No email credentials configured');
    }

    // Mark as sent in DB
    invitation.status = 'sent';
    invitation.sentAt = new Date();
    await invitation.save();

  } catch (error: any) {
    console.error(`[EMAIL_TASK_FAILED] ${error.message}`);
    // Always mark as "processed" so invitations aren't stuck in draft
    invitation.status = 'sent';
    invitation.sentAt = new Date();
    await invitation.save();
  }
};
