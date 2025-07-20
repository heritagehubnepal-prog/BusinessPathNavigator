import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Locations table for multi-location support
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // farm, warehouse, processing, office, retail
  address: text("address"),
  city: varchar("city", { length: 50 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }).default("Nepal"),
  postalCode: varchar("postal_code", { length: 20 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  capacity: varchar("capacity", { length: 100 }), // Storage/production capacity
  isActive: boolean("is_active").default(true),
  establishedDate: timestamp("established_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Role-Based Access Control System
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  permissions: text("permissions").array(), // Array of permission strings
  moduleAccess: text("module_access").array(), // Array of accessible modules
  isActive: boolean("is_active").default(true),
  isSystemRole: boolean("is_system_role").default(false), // Cannot be deleted
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id", { length: 20 }).notNull().unique(), // HR-assigned Employee ID
  password: text("password").notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  roleId: integer("role_id").references(() => roles.id), // Foreign key to roles table
  locationId: integer("location_id").references(() => locations.id), // User's primary location
  isEmailVerified: boolean("is_email_verified").default(false),
  isActive: boolean("is_active").default(false), // Requires admin approval
  isApprovedByAdmin: boolean("is_approved_by_admin").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  registrationStatus: varchar("registration_status", { length: 20 }).default("pending"), // pending, approved, rejected
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  employeeId: integer("employee_id").references(() => employees.id), // Link to employee record if applicable
  department: varchar("department", { length: 50 }),
  position: varchar("position", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  hireDate: timestamp("hire_date"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  bio: text("bio"),
  skills: text("skills").array(),
  certifications: text("certifications").array(),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Kathmandu"),
  notificationPreferences: text("notification_preferences"), // JSON string
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productionBatches = pgTable("production_batches", {
  id: serial("id").primaryKey(),
  batchNumber: varchar("batch_number", { length: 50 }).notNull().unique(),
  productType: varchar("product_type", { length: 100 }).notNull(),
  substrate: varchar("substrate", { length: 100 }).notNull(),
  locationId: integer("location_id").references(() => locations.id), // Production location
  startDate: timestamp("start_date").notNull(),
  expectedHarvestDate: timestamp("expected_harvest_date"),
  actualHarvestDate: timestamp("actual_harvest_date"),
  status: varchar("status", { length: 50 }).notNull(), // inoculation, growing, ready, harvested, contaminated
  initialWeight: decimal("initial_weight", { precision: 10, scale: 2 }),
  harvestedWeight: decimal("harvested_weight", { precision: 10, scale: 2 }),
  contaminationRate: decimal("contamination_rate", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  itemName: varchar("item_name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // substrate, spawn, tools, packaging
  locationId: integer("location_id").references(() => locations.id), // Storage location
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(), // kg, pieces, liters
  minimumStock: decimal("minimum_stock", { precision: 10, scale: 2 }),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  supplier: varchar("supplier", { length: 100 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 20 }).notNull(), // income, expense
  category: varchar("category", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  batchId: integer("batch_id").references(() => productionBatches.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  targetValue: varchar("target_value", { length: 50 }),
  currentValue: varchar("current_value", { length: 50 }),
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }),
  responsible: varchar("responsible", { length: 100 }),
  targetDate: timestamp("target_date"),
  completedDate: timestamp("completed_date"),
  status: varchar("status", { length: 20 }).notNull(), // pending, in_progress, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  priority: varchar("priority", { length: 20 }).notNull(), // low, medium, high, urgent
  status: varchar("status", { length: 20 }).notNull(), // pending, in_progress, completed, cancelled
  assignedTo: varchar("assigned_to", { length: 100 }),
  assignedToId: integer("assigned_to_id").references(() => employees.id),
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 1 }),
  actualHours: decimal("actual_hours", { precision: 4, scale: 1 }),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  batchId: integer("batch_id").references(() => productionBatches.id),
  milestoneId: integer("milestone_id").references(() => milestones.id),
  locationId: integer("location_id").references(() => locations.id),
  category: varchar("category", { length: 50 }), // production, maintenance, quality_control, research
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  entityId: integer("entity_id"),
  entityType: varchar("entity_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Human Resource Management Tables
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id", { length: 20 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 50 }).notNull(),
  department: varchar("department", { length: 50 }).notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  hireDate: timestamp("hire_date").notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, inactive, terminated
  locationId: integer("location_id").references(() => locations.id),
  supervisor: varchar("supervisor", { length: 100 }),
  skills: text("skills"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  date: timestamp("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  hoursWorked: decimal("hours_worked", { precision: 4, scale: 2 }),
  status: varchar("status", { length: 20 }).notNull(), // present, absent, late, half_day
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  payPeriod: varchar("pay_period", { length: 20 }).notNull(), // 2024-01, 2024-02
  basicSalary: decimal("basic_salary", { precision: 10, scale: 2 }).notNull(),
  overtime: decimal("overtime", { precision: 8, scale: 2 }).default("0"),
  bonus: decimal("bonus", { precision: 8, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 8, scale: 2 }).default("0"),
  totalPay: decimal("total_pay", { precision: 10, scale: 2 }).notNull(),
  payDate: timestamp("pay_date"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, paid
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales Management Tables
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  customerType: varchar("customer_type", { length: 20 }).notNull(), // individual, restaurant, retailer, distributor
  preferredPayment: varchar("preferred_payment", { length: 50 }),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // fresh_mushrooms, powder, packaging_kit
  description: text("description"),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 20 }).notNull(), // kg, grams, pieces
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).default("0"),
  minimumStock: decimal("minimum_stock", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  orderType: varchar("order_type", { length: 20 }).notNull(), // online, inhouse, wholesale
  status: varchar("status", { length: 20 }).notNull(), // pending, confirmed, processing, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull(), // pending, partial, paid, refunded
  paymentMethod: varchar("payment_method", { length: 50 }),
  shippingAddress: text("shipping_address"),
  orderDate: timestamp("order_date").notNull(),
  expectedDelivery: timestamp("expected_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  batchId: integer("batch_id").references(() => productionBatches.id), // Track which batch the product came from
});

// Insert schemas
export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  orderNumber: true, // Auto-generated
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertProductionBatchSchema = createInsertSchema(productionBatches).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
});

// Types
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type ProductionBatch = typeof productionBatches.$inferSelect;
export type InsertProductionBatch = z.infer<typeof insertProductionBatchSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Sales Management Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Human Resource Management Types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Payroll = typeof payroll.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
