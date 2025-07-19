import crypto from 'crypto';

// Email simulation service - logs to console for development
// Can be easily replaced with real email providers like SendGrid, Mailgun, etc.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private isProduction = process.env.NODE_ENV === 'production';

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (this.isProduction && process.env.SENDGRID_API_KEY) {
        // Use SendGrid in production if API key is available
        return await this.sendWithSendGrid(options);
      } else {
        // Simulate email sending for development
        return this.simulateEmail(options);
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  private simulateEmail(options: EmailOptions): boolean {
    console.log('\n📧 EMAIL SIMULATION (Development Mode)');
    console.log('=====================================');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('Content:');
    console.log(options.text || options.html);
    console.log('=====================================\n');
    return true;
  }

  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    // SendGrid implementation - can be added later
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: options.to,
      from: process.env.FROM_EMAIL || 'noreply@mycopath.com',
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(email: string, token: string, code: string): Promise<boolean> {
    const verificationLink = `${process.env.APP_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🍄 Welcome to Mycopath</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Mushroom Innovation Lab - Nepal's Mountains
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for joining Mycopath! Please verify your email address to complete your account setup.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: white; border: 2px dashed #22c55e; padding: 20px; border-radius: 10px; display: inline-block;">
              <p style="margin: 0; color: #666; font-size: 14px;">Verification Code:</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 4px;">
                ${code}
              </p>
            </div>
          </div>
          
          <p style="color: #666; text-align: center; margin-bottom: 25px;">
            <strong>Or click the button below:</strong>
          </p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" 
               style="background: linear-gradient(135deg, #22c55e, #16a34a); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
              Verify Email Address
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              🇳🇵 Mycopath - Sustainable Mushroom Farming<br>
              From Nepal's Mountains to Your Table
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
Welcome to Mycopath! 🍄

Please verify your email address to complete your account setup.

Verification Code: ${code}

Or visit this link: ${verificationLink}

This verification link will expire in 24 hours.
If you didn't create this account, please ignore this email.

Mycopath - Sustainable Mushroom Farming
From Nepal's Mountains to Your Table
    `;

    return await this.sendEmail({
      to: email,
      subject: '🍄 Welcome to Mycopath - Verify Your Email',
      html,
      text
    });
  }

  async sendPasswordResetEmail(email: string, token: string, code: string): Promise<boolean> {
    const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🍄 Mycopath</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Password Reset Request
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password. Use the code below or click the button to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: white; border: 2px dashed #f59e0b; padding: 20px; border-radius: 10px; display: inline-block;">
              <p style="margin: 0; color: #666; font-size: 14px;">Reset Code:</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #f59e0b; letter-spacing: 4px;">
                ${code}
              </p>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #f59e0b, #d97706); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
              Reset Password
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>This reset link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    `;

    const text = `
Password Reset Request - Mycopath

We received a request to reset your password.

Reset Code: ${code}

Or visit this link: ${resetLink}

This reset link will expire in 1 hour.
If you didn't request a password reset, please ignore this email.
    `;

    return await this.sendEmail({
      to: email,
      subject: '🔐 Mycopath - Password Reset Request',
      html,
      text
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🍄 Welcome to Mycopath!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Your account is now verified and ready to use
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your email has been verified successfully. You now have access to the Mycopath mushroom farm management system.
          </p>
          
          <div style="background: white; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #22c55e; margin: 0 0 15px 0;">What you can do:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Track production batches and mushroom yields</li>
              <li>Manage inventory and supplies</li>
              <li>Monitor financial transactions</li>
              <li>View analytics and reports</li>
              <li>Collaborate with your team</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL || 'http://localhost:5000'}" 
               style="background: linear-gradient(135deg, #22c55e, #16a34a); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
              Access Your Dashboard
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>🇳🇵 From Nepal's Mountains to Sustainable Innovation</p>
          <p>Need help? Contact our support team anytime.</p>
        </div>
      </div>
    `;

    const text = `
Welcome to Mycopath! 🍄

Hello ${firstName}!

Your email has been verified successfully. You now have access to the Mycopath mushroom farm management system.

What you can do:
- Track production batches and mushroom yields
- Manage inventory and supplies  
- Monitor financial transactions
- View analytics and reports
- Collaborate with your team

Visit: ${process.env.APP_URL || 'http://localhost:5000'}

From Nepal's Mountains to Sustainable Innovation
Need help? Contact our support team anytime.
    `;

    return await this.sendEmail({
      to: email,
      subject: '🎉 Welcome to Mycopath - Account Verified!',
      html,
      text
    });
  }
}

export const emailService = new EmailService();