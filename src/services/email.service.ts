import nodemailer from 'nodemailer';
import Invitation from '../models/Invitation.model';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendInvitationEmail = async (invitationId: string) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) throw new Error('Invitation not found');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${frontendUrl}/#/invite/${invitation.shortCode}`;

  const mailOptions = {
    from: `"Valentine 2026" <${process.env.EMAIL_USER}>`,
    to: invitation.recipientEmail,
    subject: `Will you be my Valentine? ❤️`,
    html: `
      <div style="background-color: #fff5f7; padding: 40px 10px; font-family: sans-serif; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 40px; border: 1px solid #ffe4e9;">
          <div style="font-size: 60px; margin-bottom: 20px;">💌</div>
          <h1 style="color: #f43f5e; margin-bottom: 10px;">For ${invitation.recipientName}</h1>
          <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">${invitation.personalizedMessage || 'Something special is waiting for you.'}</p>
          <a href="${link}" style="display: inline-block; background: #f43f5e; color: #ffffff; padding: 20px 45px; border-radius: 100px; font-weight: bold; font-size: 18px; text-decoration: none; box-shadow: 0 10px 25px rgba(244,63,94,0.3);">Open My Letter ❤️</a>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    invitation.status = 'sent';
    invitation.sentAt = new Date();
    invitation.emailId = info.messageId;
    await invitation.save();
    return info;
  } catch (error: any) {
    throw error;
  }
};
