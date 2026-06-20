import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.log(
      "📧 Email would be sent (SMTP not configured):",
      options.to,
      options.subject,
    );
    return;
  }

  await transporter.sendMail({
    from: env.FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ""),
  });
};

export const getBookingConfirmationTemplate = (
  customerName: string,
  bookingNumber: string,
  date: string,
  time: string,
  services: string[],
  totalDuration: number,
  totalPrice: string,
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Booking Confirmation - West Main Tire & Lube</h2>
      <p>Hi ${customerName},</p>
      <p>Your appointment has been confirmed. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Booking #</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${bookingNumber}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${date}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${time}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Services</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${services.join(", ")}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Duration</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${totalDuration} minutes</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total</strong></td><td style="padding: 8px; border: 1px solid #ddd;">$${totalPrice}</td></tr>
      </table>
      <p>If you need to reschedule or cancel, please contact us.</p>
      <p>West Main Tire & Lube</p>
    </div>
  `;
};

export const getBookingCancellationTemplate = (
  customerName: string,
  bookingNumber: string,
  cancelReason: string,
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Booking Cancelled - West Main Tire & Lube</h2>
      <p>Hi ${customerName},</p>
      <p>We regret to inform you that your appointment has been cancelled.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Booking #</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${bookingNumber}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Reason</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${cancelReason}</td></tr>
      </table>
      <p>We apologize for any inconvenience. Please contact us to reschedule.</p>
      <p>West Main Tire & Lube</p>
    </div>
  `;
};

export const getPasswordResetTemplate = (resetUrl: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Password Reset - West Main Tire & Lube</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
};
