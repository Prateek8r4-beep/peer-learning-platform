const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      console.warn('Email not configured, skipping email send');
      return { success: true, mock: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email Send Error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email, userId) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?userId=${userId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Peer Learning Platform!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6B7280; word-break: break-all;">${verificationLink}</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail(email, 'Verify Your Email - Peer Learning Platform', html);
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail(email, 'Password Reset - Peer Learning Platform', html);
  }

  async sendWelcomeEmail(email, fullName) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Peer Learning Platform, ${fullName}!</h2>
        <p>We're excited to have you join our community of learners.</p>
        <h3>Get Started:</h3>
        <ul>
          <li>Complete your profile</li>
          <li>Add your subjects of interest</li>
          <li>Join study rooms</li>
          <li>Connect with peers</li>
          <li>Share and access study materials</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Go to Dashboard
        </a>
      </div>
    `;

    return this.sendEmail(email, 'Welcome to Peer Learning Platform!', html);
  }
}

module.exports = new EmailService();
