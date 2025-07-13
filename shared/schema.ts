import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: varchar("role", { length: 20 }).notNull().default("worker"), // admin, manager, production, finance, sales, worker
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productionBatches = pgTable("production_batches", {
  id: serial("id").primaryKey(),
  batchNumber: varchar("batch_number", { length: 50 }).notNull().unique(),
  productType: varchar("product_type", { length: 100 }).notNull(),
  substrate: varchar("substrate", { length: 100 }).notNull(),
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
  priority: varchar("priority", { length: 20 }).notNull(), // low, medium, high
  status: varchar("status", { length: 20 }).notNull(), // pending, in_progress, completed
  assignedTo: varchar("assigned_to", { length: 100 }),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  batchId: integer("batch_id").references(() => productionBatches.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  entityId: integer("entity_id"),
  entityType: varchar("entity_type", { length: 50 }),
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
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
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
