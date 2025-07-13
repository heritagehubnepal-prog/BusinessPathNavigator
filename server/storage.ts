import {
  users,
  productionBatches,
  inventory,
  financialTransactions,
  milestones,
  tasks,
  activities,
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
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private productionBatches: Map<number, ProductionBatch>;
  private inventory: Map<number, Inventory>;
  private financialTransactions: Map<number, FinancialTransaction>;
  private milestones: Map<number, Milestone>;
  private tasks: Map<number, Task>;
  private activities: Map<number, Activity>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.productionBatches = new Map();
    this.inventory = new Map();
    this.financialTransactions = new Map();
    this.milestones = new Map();
    this.tasks = new Map();
    this.activities = new Map();
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
