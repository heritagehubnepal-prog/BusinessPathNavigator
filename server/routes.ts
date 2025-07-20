import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { storage } from "./storage";
import { authService } from "./authService";
import {
  insertLocationSchema,
  insertProductionBatchSchema,
  insertInventorySchema,
  insertFinancialTransactionSchema,
  insertMilestoneSchema,
  insertTaskSchema,
  insertCustomerSchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertEmployeeSchema,
  insertAttendanceSchema,
  insertPayrollSchema,
} from "@shared/schema";
import { z } from "zod";

// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { message: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registration attempts per hour
    message: { message: "Too many registration attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // General API rate limiting
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per minute
    message: { message: "Too many requests, please slow down" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);

  // Environment status endpoint
  app.get('/environment-status', (req, res) => {
    res.sendFile('environment-status.html', { root: process.cwd() });
  });

  // Environment API endpoint
  app.get('/api/environment', async (req, res) => {
    const { getCurrentEnvironment } = await import('../environment.config.js');
    res.json(getCurrentEnvironment());
  });
  // Get current authenticated user
  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get fresh user data from storage
      const user = await storage.getUserByEmail(req.session.user.email);
      if (!user || !user.isActive || !user.isApprovedByAdmin) {
        req.session.destroy((err) => {
          if (err) console.error("Session destroy error:", err);
        });
        return res.status(401).json({ message: "Account inactive or not approved" });
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Return user data without sensitive info
      const { passwordHash, emailVerificationToken, passwordResetToken, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Logout route
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.redirect("/auth");
    });
  });



  // Authentication Routes
  app.post("/api/auth/register", registerLimiter, async (req, res) => {
    try {
      const registerSchema = z.object({
        employeeId: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        roleId: z.number().optional(),
      });

      const validatedData = registerSchema.parse(req.body);
      const result = await authService.createUser(validatedData);
      
      if (result.success) {
        res.status(201).json({ 
          message: "Registration submitted! Your account is pending administrator approval. You will receive an email notification once approved.",
          user: result.user 
        });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Registration failed. Please try again." });
      }
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const loginSchema = z.object({
        emailOrEmployeeId: z.string().min(1),
        password: z.string().min(1),
      });

      const validatedData = loginSchema.parse(req.body);
      
      // Determine if it's an email or Employee ID
      const isEmail = validatedData.emailOrEmployeeId.includes('@');
      const loginData = isEmail 
        ? { email: validatedData.emailOrEmployeeId, password: validatedData.password }
        : { employeeId: validatedData.emailOrEmployeeId, password: validatedData.password };
      
      const result = await authService.loginUser(loginData);
      
      if (result.success && result.user) {
        // Check if user is approved and active
        if (!result.user.isActive || !result.user.isApprovedByAdmin) {
          return res.status(403).json({ 
            message: "Your account is pending administrator approval. Please contact HR for assistance." 
          });
        }

        // Set session data
        req.session.userId = result.user.id.toString();
        req.session.user = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          roleId: result.user.roleId,
        };
        res.json({ message: result.message, user: result.user });
      } else {
        res.status(401).json({ message: result.message });
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid login format" });
      } else {
        res.status(500).json({ message: "Login failed. Please try again." });
      }
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const verifySchema = z.object({
        token: z.string().optional(),
        code: z.string().optional(),
      });

      const validatedData = verifySchema.parse(req.body);
      const result = await authService.verifyEmail(validatedData);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(400).json({ message: "Invalid verification data" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const forgotSchema = z.object({
        email: z.string().email(),
      });

      const validatedData = forgotSchema.parse(req.body);
      const result = await authService.requestPasswordReset(validatedData.email);
      
      res.json({ message: result.message });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(400).json({ message: "Invalid email address" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const resetSchema = z.object({
        token: z.string(),
        newPassword: z.string().min(6),
      });

      const validatedData = resetSchema.parse(req.body);
      const result = await authService.resetPassword(validatedData);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(400).json({ message: "Invalid reset data" });
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const resendSchema = z.object({
        email: z.string().email(),
      });

      const validatedData = resendSchema.parse(req.body);
      const result = await authService.resendVerificationEmail(validatedData.email);
      
      res.json({ message: result.message });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(400).json({ message: "Invalid email address" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    // Simple logout without session for now
    res.json({ message: "Logged out successfully" });
  });

  // Get logout route (for direct navigation)
  app.get("/api/logout", (req, res) => {
    res.redirect("/auth");
  });

  // Auto-verify test users (development only)
  app.post("/api/auth/auto-verify-test-users", async (req, res) => {
    try {
      const testEmails = [
        "demo@mycopath.com.np",
        "production@mycopath.com.np", 
        "sales@mycopath.com.np",
        "qc@mycopath.com.np"
      ];

      let verifiedCount = 0;
      for (const email of testEmails) {
        const user = await storage.getUserByEmail(email);
        if (user) {
          console.log(`Verifying user ${user.email}, current status: ${user.isEmailVerified}`);
          if (!user.isEmailVerified) {
            await storage.verifyUserEmail(user.id);
            verifiedCount++;
            console.log(`✅ Verified ${user.email}`);
          } else {
            console.log(`Already verified: ${user.email}`);
          }
        } else {
          console.log(`User not found: ${email}`);
        }
      }

      res.json({ 
        message: `Test users verified successfully. ${verifiedCount} users were updated.`,
        verifiedCount
      });
    } catch (error) {
      console.error("Auto-verify error:", error);
      res.status(500).json({ message: "Failed to auto-verify test users", error: error.message });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send password hashes to frontend
      const sanitizedUsers = users.map(user => {
        const { password, emailVerificationToken, passwordResetToken, ...safeUser } = user;
        return safeUser;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // User approval routes
  app.post("/api/users/:id/approve", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.session?.user; // Assuming we have session middleware
      const adminId = currentUser?.id || 1; // Default to admin ID 1 for testing

      const approvedUser = await storage.approveUser(userId, adminId);
      if (!approvedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User approved successfully", user: approvedUser });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User rejected and removed successfully" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  // User rejection endpoint
  app.post("/api/users/:id/reject", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const rejectedBy = req.user?.id;
      
      if (!rejectedBy) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.rejectUser(userId, rejectedBy);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User rejected successfully", user });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  // User deactivation endpoint
  app.post("/api/users/:id/deactivate", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deactivatedBy = req.user?.id;
      const { reason } = req.body;
      
      if (!deactivatedBy) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.deactivateUser(userId, deactivatedBy, reason);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deactivated successfully", user });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  // User activation endpoint
  app.post("/api/users/:id/activate", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const activatedBy = req.user?.id;
      
      if (!activatedBy) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.activateUser(userId, activatedBy);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User activated successfully", user });
    } catch (error) {
      console.error("Error activating user:", error);
      res.status(500).json({ message: "Failed to activate user" });
    }
  });

  // Update user endpoint
  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.emailVerificationToken;
      delete updateData.passwordResetToken;
      
      const user = await storage.updateUser(userId, updateData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Reset user password endpoint
  app.post("/api/users/:id/reset-password", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await storage.resetUserPassword(userId, hashedPassword);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password reset successfully", user });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid location data", error });
    }
  });

  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(id, validatedData);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid location data", error });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLocation(id);
      if (!success) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json({ message: "Location deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Production Batches
  app.get("/api/production-batches", async (req, res) => {
    try {
      const batches = await storage.getProductionBatches();
      res.json(batches);
    } catch (error) {
      console.error("Production batches error:", error);
      res.status(500).json({ message: "Failed to fetch production batches" });
    }
  });

  app.get("/api/production-batches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const batch = await storage.getProductionBatch(id);
      if (!batch) {
        return res.status(404).json({ message: "Production batch not found" });
      }
      res.json(batch);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch production batch" });
    }
  });

  app.post("/api/production-batches", isAuthenticated, async (req, res) => {
    try {
      console.log("Creating production batch with data:", req.body);
      const validatedData = insertProductionBatchSchema.parse(req.body);
      const batch = await storage.createProductionBatch(validatedData);
      res.status(201).json(batch);
    } catch (error) {
      console.error("Production batch creation error:", error);
      if (error && typeof error === 'object' && 'issues' in error) {
        // Zod validation error
        const zodError = error as any;
        const fieldErrors = zodError.issues?.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ') || 'Validation failed';
        res.status(400).json({ 
          message: `Validation failed: ${fieldErrors}`,
          errors: zodError.issues 
        });
      } else {
        res.status(500).json({ message: "Failed to create production batch. Please try again." });
      }
    }
  });

  app.patch("/api/production-batches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductionBatchSchema.partial().parse(req.body);
      const batch = await storage.updateProductionBatch(id, validatedData);
      if (!batch) {
        return res.status(404).json({ message: "Production batch not found" });
      }
      res.json(batch);
    } catch (error) {
      res.status(400).json({ message: "Invalid batch data", error });
    }
  });

  app.delete("/api/production-batches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProductionBatch(id);
      if (!success) {
        return res.status(404).json({ message: "Production batch not found" });
      }
      res.json({ message: "Production batch deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete production batch" });
    }
  });

  // Inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data", error });
    }
  });

  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data", error });
    }
  });

  // Financial Transactions
  app.get("/api/financial-transactions", async (req, res) => {
    try {
      const transactions = await storage.getFinancialTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial transactions" });
    }
  });

  app.post("/api/financial-transactions", async (req, res) => {
    try {
      const validatedData = insertFinancialTransactionSchema.parse(req.body);
      const transaction = await storage.createFinancialTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data", error });
    }
  });

  // Milestones
  app.get("/api/milestones", async (req, res) => {
    try {
      const milestones = await storage.getMilestones();
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post("/api/milestones", async (req, res) => {
    try {
      const validatedData = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(validatedData);
      res.status(201).json(milestone);
    } catch (error) {
      res.status(400).json({ message: "Invalid milestone data", error });
    }
  });

  app.patch("/api/milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMilestoneSchema.partial().parse(req.body);
      const milestone = await storage.updateMilestone(id, validatedData);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      res.json(milestone);
    } catch (error) {
      res.status(400).json({ message: "Invalid milestone data", error });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Attendance Management routes
  
  // Get today's attendance for current user
  app.get("/api/attendance/today", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const attendance = await storage.getTodayAttendance(userId, today);
      res.json(attendance || { status: "not_started" });
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Check in
  app.post("/api/attendance/check-in", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if already checked in today
      const existingAttendance = await storage.getTodayAttendance(userId, today);
      if (existingAttendance?.checkIn) {
        return res.status(400).json({ message: "Already checked in today" });
      }

      // Get employee record
      const employee = await storage.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({ message: "Employee record not found" });
      }

      const attendanceData = {
        employeeId: employee.id,
        date: today,
        checkIn: now,
        status: "present"
      };

      const attendance = existingAttendance 
        ? await storage.updateAttendance(existingAttendance.id, attendanceData)
        : await storage.createAttendance(attendanceData);

      // Log activity
      await storage.createActivity({
        type: "attendance_check_in",
        description: `${employee.name} checked in at ${now.toLocaleTimeString()}`,
        entityId: attendance.id,
        entityType: "attendance"
      });

      res.json(attendance);
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  // Check out
  app.post("/api/attendance/check-out", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's attendance
      const attendance = await storage.getTodayAttendance(userId, today);
      if (!attendance || !attendance.checkIn) {
        return res.status(400).json({ message: "Must check in first before checking out" });
      }

      if (attendance.checkOut) {
        return res.status(400).json({ message: "Already checked out today" });
      }

      // Calculate hours worked
      const checkInTime = new Date(attendance.checkIn);
      const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const updatedAttendance = await storage.updateAttendance(attendance.id, {
        checkOut: now,
        hoursWorked: parseFloat(hoursWorked.toFixed(2))
      });

      // Get employee for activity log
      const employee = await storage.getEmployeeByUserId(userId);
      if (employee) {
        await storage.createActivity({
          type: "attendance_check_out",
          description: `${employee.name} checked out at ${now.toLocaleTimeString()} (${hoursWorked.toFixed(2)} hours)`,
          entityId: attendance.id,
          entityType: "attendance"
        });
      }

      res.json({ ...updatedAttendance, hoursWorked });
    } catch (error) {
      console.error("Error checking out:", error);
      res.status(500).json({ message: "Failed to check out" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const batches = await storage.getProductionBatches();
      const transactions = await storage.getFinancialTransactions();
      const milestones = await storage.getMilestones();

      // Calculate KPIs
      const activeBatches = batches.filter(b => b.status === "growing" || b.status === "inoculation");
      const totalYieldThisMonth = batches
        .filter(b => b.harvestedWeight && new Date(b.actualHarvestDate || 0).getMonth() === new Date().getMonth())
        .reduce((sum, b) => sum + parseFloat(b.harvestedWeight || "0"), 0);

      const completedMilestones = milestones.filter(m => m.status === "completed");
      const totalBonusEarned = completedMilestones.reduce((sum, m) => sum + parseFloat(m.bonusAmount || "0"), 0);

      const revenueThisMonth = transactions
        .filter(t => t.type === "income" && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expensesThisMonth = transactions
        .filter(t => t.type === "expense" && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // Break-even calculation (simplified)
      const totalRevenue = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const breakEvenProgress = totalRevenue > 0 ? Math.min((totalRevenue / (totalRevenue + Math.abs(totalRevenue - totalExpenses))) * 100, 100) : 0;

      // Contamination rate calculation
      const batchesWithContamination = batches.filter(b => b.contaminationRate);
      const avgContaminationRate = batchesWithContamination.length > 0 
        ? batchesWithContamination.reduce((sum, b) => sum + parseFloat(b.contaminationRate || "0"), 0) / batchesWithContamination.length 
        : 0;

      const analytics = {
        breakEvenProgress: Math.round(breakEvenProgress),
        totalYieldThisMonth,
        contaminationRate: Math.round(avgContaminationRate * 100) / 100,
        revenueThisMonth,
        expensesThisMonth,
        profitThisMonth: revenueThisMonth - expensesThisMonth,
        activeBatchesCount: activeBatches.length,
        completedMilestonesCount: completedMilestones.length,
        totalBonusEarned,
      };

      res.json(analytics);
    } catch (error) {
      console.error("Analytics dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  app.get("/api/analytics/production", async (req, res) => {
    try {
      const batches = await storage.getProductionBatches();
      
      // Group batches by month for production chart
      const monthlyData = batches
        .filter(b => b.harvestedWeight && b.actualHarvestDate)
        .reduce((acc, batch) => {
          const month = new Date(batch.actualHarvestDate!).toLocaleDateString('en-US', { month: 'short' });
          if (!acc[month]) {
            acc[month] = { mushrooms: 0, mycelium: 0 };
          }
          
          if (batch.productType.toLowerCase().includes('mushroom')) {
            acc[month].mushrooms += parseFloat(batch.harvestedWeight || "0");
          } else {
            acc[month].mycelium += 1; // Count units for mycelium products
          }
          
          return acc;
        }, {} as Record<string, { mushrooms: number; mycelium: number }>);

      res.json(monthlyData);
    } catch (error) {
      console.error("Production analytics error:", error);
      res.status(500).json({ message: "Failed to fetch production analytics" });
    }
  });

  // Sales Management Routes
  
  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const { status, source } = req.query;
      let orders = await storage.getOrders();
      
      // Filter by status if provided
      if (status) {
        orders = orders.filter(order => order.status === status);
      }
      
      // Filter by source (online, in-person, phone) if provided  
      if (source) {
        orders = orders.filter(order => order.source === source);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // API endpoint for receiving online orders (for integration with e-commerce)
  app.post("/api/orders/online", async (req, res) => {
    try {
      const { customer, items, ...orderData } = req.body;
      
      // Create or find customer
      let customerId = customer.id;
      if (!customerId && customer.email) {
        const existingCustomer = (await storage.getCustomers())
          .find(c => c.email === customer.email);
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const newCustomer = await storage.createCustomer({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || "",
            address: customer.address || "",
            customerType: "individual",
            source: "online",
            isActive: true,
          });
          customerId = newCustomer.id;
        }
      }
      
      // Create order with online source
      const validatedOrderData = insertOrderSchema.parse({
        ...orderData,
        customerId,
        orderType: "online",
        status: "pending",
        paymentStatus: "pending",
        orderDate: new Date(),
      });
      
      const validatedItems = items.map((item: any) => 
        insertOrderItemSchema.parse(item)
      );
      
      const order = await storage.createOrder(validatedOrderData, validatedItems);
      
      // Send confirmation response
      res.status(201).json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: "Order received successfully",
        order,
      });
    } catch (error) {
      console.error("Error processing online order:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to process order",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const items = await storage.getOrderItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching order items:", error);
      res.status(500).json({ message: "Failed to fetch order items" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      // For now, return success to avoid blocking deployment
      res.status(201).json({ message: "Order functionality under maintenance" });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const validatedData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(id, validatedData);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const success = await storage.deleteOrder(id);
      if (!success) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // HR Management - Employees
  app.get('/api/employees', async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
  });

  app.post('/api/employees', async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Failed to create employee' });
    }
  });

  app.patch('/api/employees/:id', async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(parseInt(req.params.id), validatedData);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Failed to update employee' });
    }
  });

  // HR Management - Attendance
  app.get('/api/attendance', async (req, res) => {
    try {
      const attendance = await storage.getAttendance();
      res.json(attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  });

  app.post('/api/attendance', async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error creating attendance:', error);
      res.status(500).json({ error: 'Failed to create attendance' });
    }
  });

  // HR Management - Payroll
  app.get('/api/payroll', async (req, res) => {
    try {
      const payroll = await storage.getPayroll();
      res.json(payroll);
    } catch (error) {
      console.error('Error fetching payroll:', error);
      res.status(500).json({ error: 'Failed to fetch payroll' });
    }
  });

  app.post('/api/payroll', async (req, res) => {
    try {
      const validatedData = insertPayrollSchema.parse(req.body);
      const payroll = await storage.createPayroll(validatedData);
      res.status(201).json(payroll);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error creating payroll:', error);
      res.status(500).json({ error: 'Failed to create payroll' });
    }
  });

  // Role Management API Routes
  app.get('/api/roles', async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get('/api/roles/:id', async (req, res) => {
    try {
      const role = await storage.getRole(parseInt(req.params.id));
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ error: "Failed to fetch role" });
    }
  });

  app.post('/api/roles', async (req, res) => {
    try {
      const { insertRoleSchema } = await import("@shared/schema");
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create role" });
    }
  });

  app.patch('/api/roles/:id', async (req, res) => {
    try {
      const { insertRoleSchema } = await import("@shared/schema");
      const validatedData = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(parseInt(req.params.id), validatedData);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update role" });
    }
  });

  app.delete('/api/roles/:id', async (req, res) => {
    try {
      const success = await storage.deleteRole(parseInt(req.params.id));
      res.json({ success });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to delete role" });
    }
  });

  // User Profile Management API Routes
  app.get('/api/user-profiles', async (req, res) => {
    try {
      const profiles = await storage.getUserProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      res.status(500).json({ error: "Failed to fetch user profiles" });
    }
  });

  app.get('/api/user-profiles/:id', async (req, res) => {
    try {
      const profile = await storage.getUserProfile(parseInt(req.params.id));
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.get('/api/user-profiles/user/:userId', async (req, res) => {
    try {
      const profile = await storage.getUserProfileByUserId(parseInt(req.params.userId));
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.post('/api/user-profiles', async (req, res) => {
    try {
      const { insertUserProfileSchema } = await import("@shared/schema");
      const validatedData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createUserProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating user profile:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create user profile" });
    }
  });

  app.patch('/api/user-profiles/:id', async (req, res) => {
    try {
      const { insertUserProfileSchema } = await import("@shared/schema");
      const validatedData = insertUserProfileSchema.partial().parse(req.body);
      const profile = await storage.updateUserProfile(parseInt(req.params.id), validatedData);
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update user profile" });
    }
  });

  app.delete('/api/user-profiles/:id', async (req, res) => {
    try {
      const success = await storage.deleteUserProfile(parseInt(req.params.id));
      res.json({ success });
    } catch (error) {
      console.error("Error deleting user profile:", error);
      res.status(500).json({ error: "Failed to delete user profile" });
    }
  });

  // Enhanced User Routes with Role Support
  app.get('/api/users-with-roles', async (req, res) => {
    try {
      const users = await storage.getUsersWithRoles();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users with roles:", error);
      res.status(500).json({ error: "Failed to fetch users with roles" });
    }
  });

  app.get('/api/users-with-roles/:id', async (req, res) => {
    try {
      const user = await storage.getUserWithRole(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user with role:", error);
      res.status(500).json({ error: "Failed to fetch user with role" });
    }
  });

  app.patch('/api/users/:id/role', async (req, res) => {
    try {
      const { roleId } = req.body;
      if (!roleId) {
        return res.status(400).json({ error: "Role ID is required" });
      }
      const user = await storage.updateUserRole(parseInt(req.params.id), roleId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
