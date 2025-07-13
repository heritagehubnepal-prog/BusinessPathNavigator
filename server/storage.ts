import {
  users,
  productionBatches,
  inventory,
  financialTransactions,
  milestones,
  tasks,
  activities,
  customers,
  products,
  orders,
  orderItems,
  type User,
  type InsertUser,
  type ProductionBatch,
  type InsertProductionBatch,
  type Inventory,
  type InsertInventory,
  type FinancialTransaction,
  type InsertFinancialTransaction,
  type Milestone,
  type InsertMilestone,
  type Task,
  type InsertTask,
  type Activity,
  type InsertActivity,
  type Customer,
  type InsertCustomer,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Production Batches
  getProductionBatches(): Promise<ProductionBatch[]>;
  getProductionBatch(id: number): Promise<ProductionBatch | undefined>;
  createProductionBatch(batch: InsertProductionBatch): Promise<ProductionBatch>;
  updateProductionBatch(id: number, batch: Partial<InsertProductionBatch>): Promise<ProductionBatch | undefined>;
  deleteProductionBatch(id: number): Promise<boolean>;
  
  // Inventory
  getInventoryItems(): Promise<Inventory[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Financial Transactions
  getFinancialTransactions(): Promise<FinancialTransaction[]>;
  getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined>;
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;
  updateFinancialTransaction(id: number, transaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction | undefined>;
  deleteFinancialTransaction(id: number): Promise<boolean>;
  
  // Milestones
  getMilestones(): Promise<Milestone[]>;
  getMilestone(id: number): Promise<Milestone | undefined>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: number): Promise<boolean>;
  
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Sales Management
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: number, item: Partial<InsertOrderItem>): Promise<OrderItem | undefined>;
  deleteOrderItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private productionBatches: Map<number, ProductionBatch>;
  private inventory: Map<number, Inventory>;
  private financialTransactions: Map<number, FinancialTransaction>;
  private milestones: Map<number, Milestone>;
  private tasks: Map<number, Task>;
  private activities: Map<number, Activity>;
  private customers: Map<number, Customer>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.productionBatches = new Map();
    this.inventory = new Map();
    this.financialTransactions = new Map();
    this.milestones = new Map();
    this.tasks = new Map();
    this.activities = new Map();
    this.customers = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentId = 1;
    
    // Initialize with some default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize some milestones based on business plan
    const defaultMilestones: InsertMilestone[] = [
      {
        name: "Break-even Point",
        description: "Achieve monthly break-even",
        targetValue: "Month 6",
        currentValue: "Month 4",
        bonusAmount: "15000",
        responsible: "All Founders",
        status: "in_progress",
      },
      {
        name: "500+ Social Media Followers",
        description: "Build social media presence",
        targetValue: "500 followers",
        currentValue: "520 followers",
        bonusAmount: "5000",
        responsible: "Akash Rai",
        status: "completed",
        completedDate: new Date("2025-01-10"),
      },
      {
        name: "20% Yield Increase",
        description: "Improve production efficiency",
        targetValue: "20% increase",
        currentValue: "24% increase",
        bonusAmount: "7500",
        responsible: "Local Worker",
        status: "completed",
        completedDate: new Date("2025-01-08"),
      },
      {
        name: "First Export Sale",
        description: "Achieve first international sale",
        targetValue: "1 export order",
        currentValue: "0 orders",
        bonusAmount: "20000",
        responsible: "Nishant Silwal",
        status: "pending",
      },
      {
        name: "Website Launch",
        description: "Launch company website",
        targetValue: "Website live",
        currentValue: "In development",
        bonusAmount: "10000",
        responsible: "Haris Gurung",
        status: "in_progress",
      },
    ];

    defaultMilestones.forEach(milestone => {
      this.createMilestone(milestone);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      role: insertUser.role || "worker",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateUser };
    this.users.set(id, updated);
    return updated;
  }

  // Production Batches
  async getProductionBatches(): Promise<ProductionBatch[]> {
    return Array.from(this.productionBatches.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getProductionBatch(id: number): Promise<ProductionBatch | undefined> {
    return this.productionBatches.get(id);
  }

  async createProductionBatch(insertBatch: InsertProductionBatch): Promise<ProductionBatch> {
    const id = this.currentId++;
    const batch: ProductionBatch = { 
      ...insertBatch, 
      id, 
      createdAt: new Date(),
      expectedHarvestDate: insertBatch.expectedHarvestDate || null,
      actualHarvestDate: insertBatch.actualHarvestDate || null,
      initialWeight: insertBatch.initialWeight || null,
      harvestedWeight: insertBatch.harvestedWeight || null,
      contaminationRate: insertBatch.contaminationRate || null,
      notes: insertBatch.notes || null,
    };
    this.productionBatches.set(id, batch);
    
    // Create activity
    await this.createActivity({
      type: "batch_created",
      description: `Production batch ${batch.batchNumber} created`,
      entityId: id,
      entityType: "production_batch",
    });
    
    return batch;
  }

  async updateProductionBatch(id: number, updateBatch: Partial<InsertProductionBatch>): Promise<ProductionBatch | undefined> {
    const existing = this.productionBatches.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateBatch };
    this.productionBatches.set(id, updated);
    
    // Create activity for status changes
    if (updateBatch.status && updateBatch.status !== existing.status) {
      await this.createActivity({
        type: "batch_updated",
        description: `Batch ${existing.batchNumber} status changed to ${updateBatch.status}`,
        entityId: id,
        entityType: "production_batch",
      });
    }
    
    return updated;
  }

  async deleteProductionBatch(id: number): Promise<boolean> {
    return this.productionBatches.delete(id);
  }

  // Inventory
  async getInventoryItems(): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).sort((a, b) => 
      a.itemName.localeCompare(b.itemName)
    );
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const id = this.currentId++;
    const item: Inventory = { 
      ...insertItem, 
      id, 
      lastUpdated: new Date(),
      minimumStock: insertItem.minimumStock || null,
      costPerUnit: insertItem.costPerUnit || null,
      supplier: insertItem.supplier || null,
    };
    this.inventory.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, updateItem: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const existing = this.inventory.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateItem, lastUpdated: new Date() };
    this.inventory.set(id, updated);
    return updated;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventory.delete(id);
  }

  // Financial Transactions
  async getFinancialTransactions(): Promise<FinancialTransaction[]> {
    return Array.from(this.financialTransactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined> {
    return this.financialTransactions.get(id);
  }

  async createFinancialTransaction(insertTransaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    const id = this.currentId++;
    const transaction: FinancialTransaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date(),
      batchId: insertTransaction.batchId || null,
    };
    this.financialTransactions.set(id, transaction);
    
    // Create activity
    await this.createActivity({
      type: transaction.type === "income" ? "income_added" : "expense_added",
      description: `${transaction.type === "income" ? "Income" : "Expense"}: ${transaction.description} - NPR ${transaction.amount}`,
      entityId: id,
      entityType: "financial_transaction",
    });
    
    return transaction;
  }

  async updateFinancialTransaction(id: number, updateTransaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction | undefined> {
    const existing = this.financialTransactions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateTransaction };
    this.financialTransactions.set(id, updated);
    return updated;
  }

  async deleteFinancialTransaction(id: number): Promise<boolean> {
    return this.financialTransactions.delete(id);
  }

  // Milestones
  async getMilestones(): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = this.currentId++;
    const milestone: Milestone = { 
      ...insertMilestone, 
      id, 
      createdAt: new Date(),
      description: insertMilestone.description || null,
      targetValue: insertMilestone.targetValue || null,
      currentValue: insertMilestone.currentValue || null,
      bonusAmount: insertMilestone.bonusAmount || null,
      responsible: insertMilestone.responsible || null,
      targetDate: insertMilestone.targetDate || null,
      completedDate: insertMilestone.completedDate || null,
    };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestone(id: number, updateMilestone: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const existing = this.milestones.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateMilestone };
    this.milestones.set(id, updated);
    
    // Create activity for milestone completion
    if (updateMilestone.status === "completed" && existing.status !== "completed") {
      await this.createActivity({
        type: "milestone_completed",
        description: `Milestone completed: ${existing.name} - Bonus: NPR ${existing.bonusAmount || 0}`,
        entityId: id,
        entityType: "milestone",
      });
    }
    
    return updated;
  }

  async deleteMilestone(id: number): Promise<boolean> {
    return this.milestones.delete(id);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date(),
      description: insertTask.description || null,
      batchId: insertTask.batchId || null,
      completedDate: insertTask.completedDate || null,
      assignedTo: insertTask.assignedTo || null,
      dueDate: insertTask.dueDate || null,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateTask: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateTask };
    if (updateTask.status === "completed") {
      updated.completedDate = new Date();
    }
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Activities
  async getActivities(limit = 50): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId++;
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date(),
      entityId: insertActivity.entityId || null,
      entityType: insertActivity.entityType || null,
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Sales Management - Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      createdAt: new Date(),
      email: insertCustomer.email || null,
      phone: insertCustomer.phone || null,
      address: insertCustomer.address || null,
      isActive: insertCustomer.isActive ?? true,
      notes: insertCustomer.notes || null,
      preferredPayment: insertCustomer.preferredPayment || null,
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateCustomer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existing = this.customers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateCustomer };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Sales Management - Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: new Date(),
      description: insertProduct.description || null,
      unit: insertProduct.unit || "kg",
      isActive: insertProduct.isActive ?? true,
      currentStock: insertProduct.currentStock || null,
      minimumStock: insertProduct.minimumStock || null,
      costPrice: insertProduct.costPrice || null,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateProduct: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateProduct };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Sales Management - Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.currentId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date(),
      notes: insertOrder.notes || null,
      customerId: insertOrder.customerId || null,
      paidAmount: insertOrder.paidAmount || null,
      paymentMethod: insertOrder.paymentMethod || null,
      shippingAddress: insertOrder.shippingAddress || null,
      createdBy: insertOrder.createdBy || null,
    };
    this.orders.set(id, order);

    // Add order items
    for (const item of items) {
      await this.addOrderItem({ ...item, orderId: id });
    }
    
    return order;
  }

  async updateOrder(id: number, updateOrder: Partial<InsertOrder>): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateOrder };
    this.orders.set(id, updated);
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    // Delete associated order items first
    const orderItems = Array.from(this.orderItems.values()).filter(item => item.orderId === id);
    orderItems.forEach(item => this.orderItems.delete(item.id));
    
    return this.orders.delete(id);
  }

  // Sales Management - Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async addOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentId++;
    const item: OrderItem = { 
      ...insertItem, 
      id,
      batchId: insertItem.batchId || null,
      orderId: insertItem.orderId || null,
      productId: insertItem.productId || null,
    };
    this.orderItems.set(id, item);
    return item;
  }

  async updateOrderItem(id: number, updateItem: Partial<InsertOrderItem>): Promise<OrderItem | undefined> {
    const existing = this.orderItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateItem };
    this.orderItems.set(id, updated);
    return updated;
  }

  async deleteOrderItem(id: number): Promise<boolean> {
    return this.orderItems.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();
    return user;
  }

  // Production Batches
  async getProductionBatches(): Promise<ProductionBatch[]> {
    return await db.select().from(productionBatches).orderBy(desc(productionBatches.createdAt));
  }

  async getProductionBatch(id: number): Promise<ProductionBatch | undefined> {
    const [batch] = await db.select().from(productionBatches).where(eq(productionBatches.id, id));
    return batch;
  }

  async createProductionBatch(insertBatch: InsertProductionBatch): Promise<ProductionBatch> {
    const [batch] = await db.insert(productionBatches).values(insertBatch).returning();
    
    await this.createActivity({
      type: "batch_created",
      description: `Production batch ${batch.batchNumber} created`,
      entityId: batch.id,
      entityType: "production_batch",
    });
    
    return batch;
  }

  async updateProductionBatch(id: number, updateBatch: Partial<InsertProductionBatch>): Promise<ProductionBatch | undefined> {
    const [batch] = await db.update(productionBatches).set(updateBatch).where(eq(productionBatches.id, id)).returning();
    
    if (batch && updateBatch.status) {
      await this.createActivity({
        type: "batch_updated",
        description: `Batch ${batch.batchNumber} status changed to ${updateBatch.status}`,
        entityId: id,
        entityType: "production_batch",
      });
    }
    
    return batch;
  }

  async deleteProductionBatch(id: number): Promise<boolean> {
    const result = await db.delete(productionBatches).where(eq(productionBatches.id, id));
    return true;
  }

  // Inventory  
  async getInventoryItems(): Promise<Inventory[]> {
    return await db.select().from(inventory).orderBy(inventory.itemName);
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const [item] = await db.insert(inventory).values(insertItem).returning();
    return item;
  }

  async updateInventoryItem(id: number, updateItem: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [item] = await db.update(inventory).set({...updateItem, lastUpdated: new Date()}).where(eq(inventory.id, id)).returning();
    return item;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    await db.delete(inventory).where(eq(inventory.id, id));
    return true;
  }

  // Financial Transactions
  async getFinancialTransactions(): Promise<FinancialTransaction[]> {
    return await db.select().from(financialTransactions).orderBy(desc(financialTransactions.date));
  }

  async getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined> {
    const [transaction] = await db.select().from(financialTransactions).where(eq(financialTransactions.id, id));
    return transaction;
  }

  async createFinancialTransaction(insertTransaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    const [transaction] = await db.insert(financialTransactions).values(insertTransaction).returning();
    
    await this.createActivity({
      type: transaction.type === "income" ? "income_added" : "expense_added",
      description: `${transaction.type === "income" ? "Income" : "Expense"}: ${transaction.description} - NPR ${transaction.amount}`,
      entityId: transaction.id,
      entityType: "financial_transaction",
    });
    
    return transaction;
  }

  async updateFinancialTransaction(id: number, updateTransaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction | undefined> {
    const [transaction] = await db.update(financialTransactions).set(updateTransaction).where(eq(financialTransactions.id, id)).returning();
    return transaction;
  }

  async deleteFinancialTransaction(id: number): Promise<boolean> {
    await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
    return true;
  }

  // Milestones
  async getMilestones(): Promise<Milestone[]> {
    return await db.select().from(milestones).orderBy(desc(milestones.createdAt));
  }

  async getMilestone(id: number): Promise<Milestone | undefined> {
    const [milestone] = await db.select().from(milestones).where(eq(milestones.id, id));
    return milestone;
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db.insert(milestones).values(insertMilestone).returning();
    return milestone;
  }

  async updateMilestone(id: number, updateMilestone: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const [milestone] = await db.update(milestones).set(updateMilestone).where(eq(milestones.id, id)).returning();
    
    if (milestone && updateMilestone.status === "completed") {
      await this.createActivity({
        type: "milestone_completed",
        description: `Milestone completed: ${milestone.name} - Bonus: NPR ${milestone.bonusAmount || 0}`,
        entityId: milestone.id,
        entityType: "milestone",
      });
    }
    
    return milestone;
  }

  async deleteMilestone(id: number): Promise<boolean> {
    await db.delete(milestones).where(eq(milestones.id, id));
    return true;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, updateTask: Partial<InsertTask>): Promise<Task | undefined> {
    const updateData = {...updateTask};
    if (updateTask.status === "completed") {
      updateData.completedDate = new Date();
    }
    
    const [task] = await db.update(tasks).set(updateData).where(eq(tasks.id, id)).returning();
    return task;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  // Activities
  async getActivities(limit = 50): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // Sales Management
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.name);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    
    await this.createActivity({
      type: "customer_added",
      description: `New customer added: ${customer.name}`,
      entityId: customer.id,
      entityType: "customer",
    });
    
    return customer;
  }

  async updateCustomer(id: number, updateCustomer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers).set(updateCustomer).where(eq(customers.id, id)).returning();
    return customer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    await db.delete(customers).where(eq(customers.id, id));
    return true;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updateProduct: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(updateProduct).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.orderDate));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Generate order number
    const orderCount = await db.select({ count: sql`count(*)` }).from(orders);
    const orderNumber = `ORD-${Date.now()}-${orderCount.length + 1}`;
    
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      orderNumber,
    }).returning();
    
    // Add order items
    for (const item of items) {
      await db.insert(orderItems).values({
        ...item,
        orderId: order.id,
      });
    }
    
    await this.createActivity({
      type: "order_created",
      description: `New order created: ${orderNumber} - NPR ${order.totalAmount}`,
      entityId: order.id,
      entityType: "order",
    });
    
    return order;
  }

  async updateOrder(id: number, updateOrder: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db.update(orders).set(updateOrder).where(eq(orders.id, id)).returning();
    return order;
  }

  async deleteOrder(id: number): Promise<boolean> {
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    await db.delete(orders).where(eq(orders.id, id));
    return true;
  }

  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async addOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values(insertItem).returning();
    return item;
  }

  async updateOrderItem(id: number, updateItem: Partial<InsertOrderItem>): Promise<OrderItem | undefined> {
    const [item] = await db.update(orderItems).set(updateItem).where(eq(orderItems.id, id)).returning();
    return item;
  }

  async deleteOrderItem(id: number): Promise<boolean> {
    await db.delete(orderItems).where(eq(orderItems.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
