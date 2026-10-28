import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Create reusable Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for 587 (uses STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Common Email Shell with modern branding and styling
const getEmailTemplate = ({ title, preheader, content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .wrapper { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: #0f172a; padding: 36px 30px; text-align: center; color: #ffffff; }
    .brand-title { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 10px 0 0 0; }
    .body-content { padding: 36px 32px; font-size: 15px; line-height: 1.6; }
    .otp-box { background: #fef2f2; border: 1.5px dashed #ef4444; border-radius: 14px; text-align: center; padding: 22px; margin: 26px 0; }
    .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: monospace; }
    .cta-button { display: inline-block; background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 13px 30px; font-size: 14px; font-weight: 600; border-radius: 9999px; margin-top: 15px; }
    .feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin: 10px 0; display: flex; align-items: center; gap: 12px; font-size: 14px; }
    .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 22px 30px; text-align: center; font-size: 12px; color: #94a3b8; }
    .security-notice { background: #fffbeb; border: 1px solid #fef3c7; color: #b45309; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin: 20px 0; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || title}
  </div>
  <div class="wrapper">
    <div class="header">
      <div style="font-size: 32px;">🌸</div>
      <h1 class="brand-title">ImageCloud</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">Smart AI Photo Storage</p>
    </div>
    <div class="body-content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">© ${new Date().getFullYear()} ImageCloud Inc. All rights reserved.</p>
      <p style="margin: 0;">This email was sent to your registered address because an action was requested for your account.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send Professional Welcome Email when a user registers
 */
export const sendWelcomeEmail = async (user) => {
  try {
    const html = getEmailTemplate({
      title: 'Welcome to ImageCloud!',
      preheader: `Welcome to ImageCloud, ${user.name}! Your safe haven for high-resolution visual memories.`,
      content: `
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Welcome aboard, ${user.name}! 🎉</h2>
        <p>Thank you for creating an account on <strong>ImageCloud</strong>. We're thrilled to give your photos and videos the intelligent cloud home they deserve.</p>
        
        <p style="font-weight: 600; color: #334155; margin-bottom: 8px;">Here is what you can do right now:</p>
        
        <div class="feature-card">
          <span>🧠</span>
          <div><strong>AI-Powered Object Search:</strong> Photos are automatically tagged so you can search by object (e.g. "car", "dog", "beach").</div>
        </div>

        <div class="feature-card">
          <span>🍏</span>
          <div><strong>Universal Apple HEIC Uploads:</strong> Upload raw iPhone photos and view them instantly in crystal-clear quality.</div>
        </div>

        <div class="feature-card">
          <span>📁</span>
          <div><strong>Custom Albums & Highlights:</strong> Group your best memories into albums and share stories effortlessly.</div>
        </div>

        <div class="feature-card">
          <span>📱</span>
          <div><strong>Mobile-First Experience:</strong> Enjoy a smooth progressive app experience on desktop, tablet, and mobile.</div>
        </div>

        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="cta-button">Open My Photo Library</a>
        </div>
      `,
    });

    const info = await transporter.sendMail({
      from: `"ImageCloud" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Welcome to ImageCloud, ${user.name}! 📸`,
      html,
    });

    console.log(`[Email] Welcome email sent to ${user.email} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send welcome email to ${user.email}:`, error.message);
    // Don't throw error to avoid failing registration flow if email transport has issues
    return null;
  }
};

/**
 * Send Password Reset OTP Email
 */
export const sendOtpEmail = async (email, name, otp) => {
  try {
    const html = getEmailTemplate({
      title: 'Password Reset OTP - ImageCloud',
      preheader: `Your ImageCloud password reset verification code is ${otp}. Valid for 10 minutes.`,
      content: `
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Password Reset Request</h2>
        <p>Hello ${name || 'User'},</p>
        <p>We received a request to reset the password for your <strong>ImageCloud</strong> account. Use the one-time verification code (OTP) below to proceed:</p>
        
        <div class="otp-box">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; margin-bottom: 8px;">One-Time Verification Code</div>
          <div class="otp-code">${otp}</div>
          <div style="font-size: 12px; color: #ef4444; font-weight: 600; margin-top: 8px;">⏱️ Expires in 10 minutes</div>
        </div>

        <div class="security-notice">
          <strong>🔒 Security Notice:</strong> Never share this code with anyone. ImageCloud support will never ask for your verification code.
        </div>

        <p style="font-size: 13px; color: #64748b;">If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      `,
    });

    const info = await transporter.sendMail({
      from: `"ImageCloud Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${otp} is your ImageCloud password reset code 🔐`,
      html,
    });

    console.log(`[Email] Password reset OTP sent to ${email} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send OTP email to ${email}:`, error.message);
    throw new Error('Failed to send verification code email. Please verify email settings.');
  }
};

/**
 * Send Password Reset Confirmation Email
 */
export const sendPasswordChangedEmail = async (user) => {
  try {
    const html = getEmailTemplate({
      title: 'Your ImageCloud password was successfully updated',
      preheader: 'Your ImageCloud password has been reset successfully.',
      content: `
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Password Updated Successfully ✅</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>This is a confirmation that the password for your <strong>ImageCloud</strong> account (<em>${user.email}</em>) was successfully changed.</p>
        
        <div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #475569;">
          <div><strong>Date & Time:</strong> ${new Date().toUTCString()}</div>
          <div style="margin-top: 4px;"><strong>Account:</strong> ${user.email}</div>
        </div>

        <div class="security-notice">
          <strong>⚠️ Did not make this change?</strong><br/>
          If you did not reset your password, please contact our support team immediately or reset your password using the "Forgot Password" feature on the login screen.
        </div>

        <div style="text-align: center; margin: 25px 0 10px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="cta-button">Sign In to ImageCloud</a>
        </div>
      `,
    });

    await transporter.sendMail({
      from: `"ImageCloud Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Security Alert: Your ImageCloud password was changed`,
      html,
    });
  } catch (error) {
    console.error(`[Email Error] Failed to send password changed confirmation to ${user.email}:`, error.message);
  }
};

export default transporter;
