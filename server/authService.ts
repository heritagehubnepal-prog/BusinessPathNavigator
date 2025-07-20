import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import { emailService } from "./emailService";

interface AuthResult {
  success: boolean;
  message: string;
  user?: any;
}

interface RegisterData {
  employeeId: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId?: number;
}

interface LoginData {
  email: string;
  password: string;
}

interface VerifyData {
  token?: string;
  code?: string;
}

interface ResetData {
  token: string;
  newPassword: string;
}

class AuthService {
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createUser(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists"
        };
      }

      const existingEmployeeId = await storage.getUserByEmployeeId(data.employeeId);
      if (existingEmployeeId) {
        return {
          success: false,
          message: "Employee ID is already registered. Please contact HR if this is an error."
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Generate verification token
      const verificationToken = this.generateToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user (inactive until admin approval)
      const newUser = await storage.createUser({
        employeeId: data.employeeId,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: data.roleId || 6, // Default to Employee role
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      });

      // Send verification email
      await emailService.sendVerificationEmail(data.email, verificationToken, data.firstName || data.username);

      return {
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isEmailVerified: newUser.isEmailVerified
        }
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Registration failed. Please try again."
      };
    }
  }

  async loginUser(data: LoginData): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return {
          success: false,
          message: "Please verify your email before logging in. Check your inbox for verification instructions."
        };
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      return {
        success: true,
        message: "Login successful!",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.roleId,
          isEmailVerified: user.isEmailVerified
        }
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Login failed. Please try again."
      };
    }
  }

  async verifyEmail(data: VerifyData): Promise<AuthResult> {
    try {
      if (!data.token) {
        return {
          success: false,
          message: "Verification token is required"
        };
      }

      // Find user by verification token
      const user = await storage.getUserByVerificationToken(data.token);
      if (!user) {
        return {
          success: false,
          message: "Invalid or expired verification token"
        };
      }

      // Check if token is expired
      if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
        return {
          success: false,
          message: "Verification token has expired. Please request a new one."
        };
      }

      // Verify the user
      await storage.verifyUserEmail(user.id);

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email, user.firstName || user.username);

      return {
        success: true,
        message: "Email verified successfully! You can now log in to your account."
      };
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        message: "Email verification failed. Please try again."
      };
    }
  }

  async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: "If an account with that email exists, you will receive password reset instructions."
        };
      }

      // Generate reset token
      const resetToken = this.generateToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      await storage.setPasswordResetToken(user.id, resetToken, resetExpires);

      // Send reset email
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName || user.username);

      return {
        success: true,
        message: "If an account with that email exists, you will receive password reset instructions."
      };
    } catch (error) {
      console.error("Password reset request error:", error);
      return {
        success: false,
        message: "Failed to process password reset request. Please try again."
      };
    }
  }

  async resetPassword(data: ResetData): Promise<AuthResult> {
    try {
      // Find user by reset token
      const user = await storage.getUserByPasswordResetToken(data.token);
      if (!user) {
        return {
          success: false,
          message: "Invalid or expired reset token"
        };
      }

      // Check if token is expired
      if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
        return {
          success: false,
          message: "Reset token has expired. Please request a new password reset."
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 12);

      // Update password and clear reset token
      await storage.updateUserPassword(user.id, hashedPassword);

      // Send confirmation email
      await emailService.sendPasswordResetConfirmationEmail(user.email, user.firstName || user.username);

      return {
        success: true,
        message: "Password reset successfully! You can now log in with your new password."
      };
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        message: "Password reset failed. Please try again."
      };
    }
  }

  async resendVerificationEmail(email: string): Promise<AuthResult> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: "If an account with that email exists, a new verification email has been sent."
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          message: "This email is already verified. You can log in to your account."
        };
      }

      // Generate new verification token
      const verificationToken = this.generateToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update verification token
      await storage.updateVerificationToken(user.id, verificationToken, verificationExpires);

      // Send new verification email
      await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName || user.username);

      return {
        success: true,
        message: "If an account with that email exists, a new verification email has been sent."
      };
    } catch (error) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        message: "Failed to resend verification email. Please try again."
      };
    }
  }
}

export const authService = new AuthService();