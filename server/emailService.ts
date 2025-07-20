// Simulated Email Service for Development
// In production, replace with actual email provider (SendGrid, Mailgun, etc.)

interface EmailTemplate {
  to: string;
  subject: string;
  text: string;
  html: string;
}

class EmailService {
  private logEmail(template: EmailTemplate) {
    console.log("\n" + "=".repeat(60));
    console.log("📧 SIMULATED EMAIL SENT");
    console.log("=".repeat(60));
    console.log(`To: ${template.to}`);
    console.log(`Subject: ${template.subject}`);
    console.log("─".repeat(60));
    console.log(template.text);
    console.log("─".repeat(60));
    console.log("HTML Content:");
    console.log(template.html);
    console.log("=".repeat(60) + "\n");
  }

  async sendVerificationEmail(email: string, token: string, name: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: "🍄 Verify Your Mycopath Account - Welcome to the Innovation Lab!",
      text: `
Hello ${name},

Welcome to Mycopath - Nepal's Premier Mushroom Innovation Lab! 🇳🇵

To complete your registration and join our sustainable agriculture community, please verify your email address.

Your verification token is: ${token}

Simply enter this token in the verification form on our website, or click the link below:
https://your-domain.com/auth?tab=verify&token=${token}

About Mycopath:
🍄 Premium mushroom cultivation in Nepal's mountains
🌱 Sustainable agriculture and mycelium innovation
🏔️ From Himalayas to global markets
🔬 Research and development lab for bio-materials

This verification link will expire in 24 hours for security reasons.

If you didn't create this account, please ignore this email.

Best regards,
The Mycopath Team
📧 info@mycopath.com.np
🌐 www.mycopath.com.np

From Nepal's Mountains to Sustainable Innovation 🇳🇵
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #059669, #065f46); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .token-box { background: #f0fdf4; border: 2px solid #059669; padding: 20px; margin: 20px 0; text-align: center; }
        .token { font-size: 24px; font-weight: bold; color: #059669; letter-spacing: 3px; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="header">
        <h1><span class="emoji">🍄</span> Welcome to Mycopath!</h1>
        <p>Nepal's Premier Mushroom Innovation Lab</p>
    </div>
    
    <div class="content">
        <h2>Hello ${name},</h2>
        
        <p>Welcome to <strong>Mycopath</strong> - where innovation meets tradition in Nepal's mountains! <span class="emoji">🇳🇵</span></p>
        
        <p>To complete your registration and join our sustainable agriculture community, please verify your email address:</p>
        
        <div class="token-box">
            <p><strong>Your Verification Token:</strong></p>
            <div class="token">${token}</div>
        </div>
        
        <p style="text-align: center;">
            <a href="https://your-domain.com/auth?tab=verify&token=${token}" class="button">
                <span class="emoji">✅</span> Verify My Account
            </a>
        </p>
        
        <h3><span class="emoji">🌱</span> About Mycopath:</h3>
        <ul>
            <li><span class="emoji">🍄</span> Premium mushroom cultivation in Nepal's mountains</li>
            <li><span class="emoji">🌱</span> Sustainable agriculture and mycelium innovation</li>
            <li><span class="emoji">🏔️</span> From Himalayas to global markets</li>
            <li><span class="emoji">🔬</span> Research and development lab for bio-materials</li>
        </ul>
        
        <p><small><strong>Security Note:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.</small></p>
    </div>
    
    <div class="footer">
        <p><strong>The Mycopath Team</strong><br>
        <span class="emoji">📧</span> info@mycopath.com.np<br>
        <span class="emoji">🌐</span> www.mycopath.com.np</p>
        <p><em>From Nepal's Mountains to Sustainable Innovation</em> <span class="emoji">🇳🇵</span></p>
    </div>
</body>
</html>
      `
    };

    this.logEmail(template);
    return true;
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: "🎉 Welcome to Mycopath - Your Account is Now Active!",
      text: `
Hello ${name},

Congratulations! Your Mycopath account has been successfully verified and is now active! 🎉

You can now log in to your dashboard and start exploring:
• Production tracking and batch management
• Inventory and supply chain monitoring
• Financial analytics and milestone tracking
• Team collaboration and task management
• Sales and customer education tools

Next Steps:
1. Log in to your dashboard: https://your-domain.com/dashboard
2. Complete your profile settings
3. Explore the various modules based on your role
4. Join our community of sustainable agriculture innovators

Need help? Our team is here to support you:
📧 support@mycopath.com.np
📱 WhatsApp: +977-XXXX-XXXX

Welcome to the future of sustainable agriculture in Nepal!

Best regards,
The Mycopath Innovation Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #059669, #065f46); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .welcome-box { background: #f0fdf4; border-left: 5px solid #059669; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .feature { background: #f8fafc; padding: 15px; border-radius: 8px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="header">
        <h1><span class="emoji">🎉</span> Account Verified Successfully!</h1>
        <p>Welcome to Mycopath Innovation Lab</p>
    </div>
    
    <div class="content">
        <div class="welcome-box">
            <h2>Hello ${name}!</h2>
            <p><strong>Congratulations!</strong> Your Mycopath account is now active and ready to use.</p>
        </div>
        
        <p style="text-align: center;">
            <a href="https://your-domain.com/dashboard" class="button">
                <span class="emoji">🚀</span> Access Your Dashboard
            </a>
        </p>
        
        <h3><span class="emoji">🛠️</span> What You Can Do Now:</h3>
        <div class="features">
            <div class="feature">
                <h4><span class="emoji">🍄</span> Production</h4>
                <p>Track batches, monitor growth cycles, and manage harvests</p>
            </div>
            <div class="feature">
                <h4><span class="emoji">📦</span> Inventory</h4>
                <p>Monitor stock levels, manage supplies, and track equipment</p>
            </div>
            <div class="feature">
                <h4><span class="emoji">💰</span> Finance</h4>
                <p>Track expenses, revenue, and milestone bonuses</p>
            </div>
            <div class="feature">
                <h4><span class="emoji">🎯</span> Milestones</h4>
                <p>Set goals, track progress, and earn performance bonuses</p>
            </div>
        </div>
        
        <h3><span class="emoji">🚀</span> Next Steps:</h3>
        <ol>
            <li>Complete your profile settings</li>
            <li>Explore modules based on your role</li>
            <li>Connect with team members</li>
            <li>Start your first project!</li>
        </ol>
        
        <p><strong>Need Help?</strong><br>
        <span class="emoji">📧</span> support@mycopath.com.np<br>
        <span class="emoji">📱</span> WhatsApp: +977-XXXX-XXXX</p>
    </div>
    
    <div class="footer">
        <p><strong>The Mycopath Innovation Team</strong></p>
        <p><em>Building the future of sustainable agriculture in Nepal</em> <span class="emoji">🇳🇵</span></p>
    </div>
</body>
</html>
      `
    };

    this.logEmail(template);
    return true;
  }

  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: "🔒 Reset Your Mycopath Password",
      text: `
Hello ${name},

We received a request to reset your Mycopath account password.

Your password reset token is: ${token}

To reset your password:
1. Go to: https://your-domain.com/auth?tab=reset
2. Enter this token: ${token}
3. Create your new password

This reset link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

For security questions, contact: security@mycopath.com.np

Best regards,
The Mycopath Security Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .token-box { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; text-align: center; }
        .token { font-size: 24px; font-weight: bold; color: #dc2626; letter-spacing: 3px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        .security-note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="header">
        <h1><span class="emoji">🔒</span> Password Reset Request</h1>
        <p>Secure Access to Your Mycopath Account</p>
    </div>
    
    <div class="content">
        <h2>Hello ${name},</h2>
        
        <p>We received a request to reset your Mycopath account password.</p>
        
        <div class="token-box">
            <p><strong>Your Password Reset Token:</strong></p>
            <div class="token">${token}</div>
        </div>
        
        <p style="text-align: center;">
            <a href="https://your-domain.com/auth?tab=reset&token=${token}" class="button">
                <span class="emoji">🔑</span> Reset My Password
            </a>
        </p>
        
        <h3><span class="emoji">⏰</span> Important:</h3>
        <ul>
            <li>This reset link will expire in <strong>1 hour</strong></li>
            <li>You can only use this token once</li>
            <li>Choose a strong password for better security</li>
        </ul>
        
        <div class="security-note">
            <p><strong><span class="emoji">🛡️</span> Security Notice:</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged. If you're concerned about account security, contact our security team immediately.</p>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>Mycopath Security Team</strong><br>
        <span class="emoji">📧</span> security@mycopath.com.np</p>
        <p><em>Protecting your account and data</em> <span class="emoji">🛡️</span></p>
    </div>
</body>
</html>
      `
    };

    this.logEmail(template);
    return true;
  }

  async sendPasswordResetConfirmationEmail(email: string, name: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: "✅ Your Mycopath Password Has Been Reset",
      text: `
Hello ${name},

Your Mycopath account password has been successfully reset.

You can now log in using your new password at: https://your-domain.com/login

If you did not make this change, please contact our security team immediately:
📧 security@mycopath.com.np
📱 Emergency: +977-XXXX-XXXX

Security Tips:
• Keep your password secure and don't share it
• Consider using a password manager
• Enable two-factor authentication when available

Best regards,
The Mycopath Security Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #059669, #065f46); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .success-box { background: #f0fdf4; border: 2px solid #059669; padding: 20px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; }
        .security-tips { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="header">
        <h1><span class="emoji">✅</span> Password Reset Successful</h1>
        <p>Your Account is Secure</p>
    </div>
    
    <div class="content">
        <h2>Hello ${name},</h2>
        
        <div class="success-box">
            <p><strong><span class="emoji">🎉</span> Success!</strong></p>
            <p>Your Mycopath account password has been successfully reset.</p>
        </div>
        
        <p style="text-align: center;">
            <a href="https://your-domain.com/login" class="button">
                <span class="emoji">🔐</span> Log In Now
            </a>
        </p>
        
        <div class="security-tips">
            <h3><span class="emoji">🛡️</span> Security Tips:</h3>
            <ul>
                <li>Keep your password secure and don't share it with anyone</li>
                <li>Consider using a password manager for better security</li>
                <li>Log out completely when using shared computers</li>
                <li>Contact us if you notice any suspicious activity</li>
            </ul>
        </div>
        
        <p><strong>Didn't make this change?</strong> Contact our security team immediately:<br>
        <span class="emoji">📧</span> security@mycopath.com.np<br>
        <span class="emoji">📱</span> Emergency: +977-XXXX-XXXX</p>
    </div>
    
    <div class="footer">
        <p><strong>Mycopath Security Team</strong></p>
        <p><em>Your security is our priority</em> <span class="emoji">🛡️</span></p>
    </div>
</body>
</html>
      `
    };

    this.logEmail(template);
    return true;
  }
}

export const emailService = new EmailService();