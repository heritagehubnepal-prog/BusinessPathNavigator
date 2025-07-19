import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { emailService } from './emailService';
import { storage } from './storage';
import type { InsertUser, User } from '@shared/schema';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  token?: string;
  code?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

class AuthService {
  async createUser(userData: CreateUserRequest): Promise<{ user: User; success: boolean; message: string }> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return { user: null as any, success: false, message: 'User with this email already exists' };
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return { user: null as any, success: false, message: 'Username is already taken' };
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Generate verification token and code
      const verificationToken = emailService.generateVerificationToken();
      const verificationCode = emailService.generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const newUser: InsertUser = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roleId: userData.roleId,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isActive: true,
      };

      const user = await storage.createUser(newUser);

      // Send verification email
      const emailSent = await emailService.sendVerificationEmail(
        userData.email,
        verificationToken,
        verificationCode
      );

      if (!emailSent) {
        console.warn('Failed to send verification email, but user was created');
      }

      return {
        user,
        success: true,
        message: emailSent 
          ? 'User created successfully. Please check your email to verify your account.'
          : 'User created successfully. Email verification is pending.'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { user: null as any, success: false, message: 'Failed to create user' };
    }
  }

  async loginUser(loginData: LoginRequest): Promise<{ user: User | null; success: boolean; message: string }> {
    try {
      // Find user by email
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return { user: null, success: false, message: 'Invalid email or password' };
      }

      // Check if user is active
      if (!user.isActive) {
        return { user: null, success: false, message: 'Account is deactivated. Please contact support.' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return { user: null, success: false, message: 'Invalid email or password' };
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return { 
          user: null, 
          success: false, 
          message: 'Please verify your email address before logging in. Check your inbox for the verification email.' 
        };
      }

      // Update last login time
      await storage.updateUserLastLogin(user.id);

      // Remove sensitive information before returning
      const { password, emailVerificationToken, passwordResetToken, ...safeUser } = user;

      return {
        user: safeUser as User,
        success: true,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Error during login:', error);
      return { user: null, success: false, message: 'Login failed' };
    }
  }

  async verifyEmail(verificationData: VerifyEmailRequest): Promise<{ success: boolean; message: string }> {
    try {
      if (!verificationData.token && !verificationData.code) {
        return { success: false, message: 'Verification token or code is required' };
      }

      let user: User | null = null;

      if (verificationData.token) {
        user = await storage.getUserByVerificationToken(verificationData.token);
      } else if (verificationData.code) {
        // For code verification, we'd need to store codes in database
        // For now, we'll use token-based verification
        return { success: false, message: 'Code verification not implemented yet' };
      }

      if (!user) {
        return { success: false, message: 'Invalid or expired verification token' };
      }

      if (user.isEmailVerified) {
        return { success: true, message: 'Email is already verified' };
      }

      // Check if verification token has expired
      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        return { success: false, message: 'Verification token has expired. Please request a new one.' };
      }

      // Verify email
      await storage.verifyUserEmail(user.id);

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email!, user.firstName || user.username);

      return { success: true, message: 'Email verified successfully! You can now log in.' };
    } catch (error) {
      console.error('Error verifying email:', error);
      return { success: false, message: 'Email verification failed' };
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return { success: true, message: 'If the email exists, a password reset link has been sent.' };
      }

      // Generate reset token and code
      const resetToken = emailService.generateVerificationToken();
      const resetCode = emailService.generateVerificationCode();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      await storage.setPasswordResetToken(user.id, resetToken, resetExpires);

      // Send reset email
      const emailSent = await emailService.sendPasswordResetEmail(email, resetToken, resetCode);

      return {
        success: true,
        message: emailSent 
          ? 'Password reset email sent. Please check your inbox.'
          : 'Password reset initiated. Email delivery is pending.'
      };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return { success: false, message: 'Failed to process password reset request' };
    }
  }

  async resetPassword(resetData: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const user = await storage.getUserByPasswordResetToken(resetData.token);
      if (!user) {
        return { success: false, message: 'Invalid or expired reset token' };
      }

      // Check if reset token has expired
      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        return { success: false, message: 'Reset token has expired. Please request a new one.' };
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(resetData.newPassword, saltRounds);

      // Update password and clear reset token
      await storage.updateUserPassword(user.id, hashedPassword);

      return { success: true, message: 'Password reset successfully. You can now log in with your new password.' };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Generate new verification token
      const verificationToken = emailService.generateVerificationToken();
      const verificationCode = emailService.generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with new verification token
      await storage.updateVerificationToken(user.id, verificationToken, verificationExpires);

      // Send verification email
      const emailSent = await emailService.sendVerificationEmail(email, verificationToken, verificationCode);

      return {
        success: true,
        message: emailSent 
          ? 'Verification email sent. Please check your inbox.'
          : 'Verification email initiated. Email delivery is pending.'
      };
    } catch (error) {
      console.error('Error resending verification email:', error);
      return { success: false, message: 'Failed to resend verification email' };
    }
  }
}

export const authService = new AuthService();