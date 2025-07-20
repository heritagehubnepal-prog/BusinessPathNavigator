import {
  locations,
  users,
  roles,
  userProfiles,
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
  employees,
  attendance,
  payroll,
  type Location,
  type InsertLocation,
  type User,
  type InsertUser,
  type Role,
  type InsertRole,
  type UserProfile,
  type InsertUserProfile,
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
  type Employee,
  type InsertEmployee,
  type Attendance,
  type InsertAttendance,
  type Payroll,
  type InsertPayroll,
  type ContaminationLog,
  type InsertContaminationLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Locations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Users
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmployeeId(employeeId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<void>;
  verifyUserEmail(id: number): Promise<void>;
  approveUser(id: number, approvedBy: number): Promise<User | undefined>;
  updateVerificationToken(id: number, token: string, expires: Date): Promise<void>;
  setPasswordResetToken(id: number, token: string, expires: Date): Promise<void>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  
  // Production Batches  
  getProductionBatches(): Promise<ProductionBatch[]>;
  getProductionBatch(id: number): Promise<ProductionBatch | undefined>;
  createProductionBatch(batch: InsertProductionBatch): Promise<ProductionBatch>;
  updateProductionBatch(id: number, batch: Partial<InsertProductionBatch>): Promise<ProductionBatch | undefined>;
  deleteProductionBatch(id: number): Promise<boolean>;

  // Contamination Logs
  getContaminationLogs(): Promise<ContaminationLog[]>;
  createContaminationLog(log: InsertContaminationLog): Promise<ContaminationLog>;
  
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

  // Human Resource Management
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  getAttendance(): Promise<Attendance[]>;
  getAttendanceByEmployee(employeeId: number): Promise<Attendance[]>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: number): Promise<boolean>;
  getTodayAttendance(userId: number, date: Date): Promise<Attendance | undefined>;
  getEmployeeByUserId(userId: number): Promise<Employee | undefined>;

  getPayroll(): Promise<Payroll[]>;
  getPayrollByEmployee(employeeId: number): Promise<Payroll[]>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, payroll: Partial<InsertPayroll>): Promise<Payroll | undefined>;
  deletePayroll(id: number): Promise<boolean>;

  // Role Management
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;

  // User Profile Management
  getUserProfiles(): Promise<UserProfile[]>;
  getUserProfile(id: number): Promise<UserProfile | undefined>;
  getUserProfileByUserId(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  deleteUserProfile(id: number): Promise<boolean>;

  // Enhanced User Methods with Role Support
  getUserWithRole(id: number): Promise<(User & { role?: Role; profile?: UserProfile }) | undefined>;
  getUsersWithRoles(): Promise<(User & { role?: Role; profile?: UserProfile })[]>;
  updateUserRole(userId: number, roleId: number): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private locations: Map<number, Location>;
  private users: Map<number, User>;
  private roles: Map<number, Role>;
  private userProfiles: Map<number, UserProfile>;
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
  private employees: Map<number, Employee>;
  private attendance: Map<number, Attendance>;
  private payroll: Map<number, Payroll>;
  private contaminationLogs: Map<number, ContaminationLog>;
  private currentId: number;
  private roleIdCounter: number;

  constructor() {
    this.locations = new Map();
    this.users = new Map();
    this.roles = new Map();
    this.userProfiles = new Map();
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
    this.employees = new Map();
    this.attendance = new Map();
    this.payroll = new Map();
    this.contaminationLogs = new Map();
    this.currentId = 1;
    this.roleIdCounter = 1;
    
    // Initialize with some default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default locations
    const defaultLocations: InsertLocation[] = [
      {
        name: "Main Farm - Kathmandu",
        type: "farm",
        address: "Kathmandu Valley Production Site",
        city: "Kathmandu",
        state: "Bagmati Province",
        country: "Nepal",
        contactPerson: "Akash Rai",
        phone: "+977-1-234567",
        capacity: "500 kg/month",
        isActive: true,
        establishedDate: new Date("2024-01-01"),
        notes: "Primary production facility with optimal growing conditions",
      },
      {
        name: "Processing Center",
        type: "processing",
        address: "Industrial Area, Kathmandu",
        city: "Kathmandu", 
        state: "Bagmati Province",
        country: "Nepal",
        contactPerson: "Haris Gurung",
        phone: "+977-1-345678",
        capacity: "1000 kg/day processing",
        isActive: true,
        establishedDate: new Date("2024-06-01"),
        notes: "Value-added product processing and packaging facility",
      },
      {
        name: "Warehouse - Pokhara",
        type: "warehouse",
        address: "Storage District, Pokhara",
        city: "Pokhara",
        state: "Gandaki Province", 
        country: "Nepal",
        contactPerson: "Nishant Silwal",
        phone: "+977-61-567890",
        capacity: "2000 kg storage",
        isActive: true,
        establishedDate: new Date("2024-09-01"),
        notes: "Regional distribution center for western Nepal",
      },
    ];

    defaultLocations.forEach(location => {
      this.createLocation(location);
    });

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

    // Add some sample production batches
    const defaultBatches: InsertProductionBatch[] = [
      {
        batchNumber: "MYC-2024-001",
        productType: "Oyster Mushrooms",
        substrate: "Straw pellets with wheat bran",
        startDate: new Date("2024-01-15"),
        expectedHarvestDate: new Date("2024-02-15"),
        status: "growing",
        locationId: 1,
        initialWeight: "5.0",
        notes: "First commercial batch with new substrate mix",
      },
      {
        batchNumber: "MYC-2024-002", 
        productType: "Shiitake Mushrooms",
        substrate: "Oak sawdust with nutrients",
        startDate: new Date("2024-01-20"),
        expectedHarvestDate: new Date("2024-03-01"),
        status: "inoculation",
        locationId: 1,
        initialWeight: "3.5",
        notes: "Premium variety for export market",
      },
      {
        batchNumber: "MYC-2024-003",
        productType: "Lion's Mane",
        substrate: "Beech wood chips",
        startDate: new Date("2024-01-10"),
        actualHarvestDate: new Date("2024-02-10"),
        status: "harvested",
        locationId: 1,
        initialWeight: "2.0",
        harvestedWeight: "8.5",
        contaminationRate: "2.1",
        notes: "Excellent yield and quality",
      },
    ];

    defaultBatches.forEach(batch => {
      this.createProductionBatch(batch);
    });

    // Add sample inventory items
    const defaultInventory: InsertInventory[] = [
      {
        itemName: "Straw Pellets",
        category: "substrate",
        currentStock: "500",
        unit: "kg",
        minimumStock: "100",
        costPerUnit: "45.00",
        supplier: "Nepal Agricultural Supplies",
        locationId: 1,
      },
      {
        itemName: "Oyster Mushroom Spawn",
        category: "spawn",
        currentStock: "50",
        unit: "bags",
        minimumStock: "10",
        costPerUnit: "150.00",
        supplier: "Kathmandu Mushroom Lab",
        locationId: 1,
      },
      {
        itemName: "Growing Containers",
        category: "equipment",
        currentStock: "200",
        unit: "pieces",
        minimumStock: "50",
        costPerUnit: "75.00",
        supplier: "Local Plastics Co.",
        locationId: 1,
      },
    ];

    defaultInventory.forEach(item => {
      this.createInventoryItem(item);
    });

    // Add sample financial transactions
    const defaultTransactions: InsertFinancialTransaction[] = [
      {
        type: "income",
        amount: "15000.00",
        description: "Oyster mushroom sales - January",
        category: "sales",
        date: new Date("2024-01-25"),
        locationId: 1,
      },
      {
        type: "expense", 
        amount: "3500.00",
        description: "Substrate materials purchase",
        category: "materials",
        date: new Date("2024-01-15"),
        locationId: 1,
      },
      {
        type: "income",
        amount: "22000.00",
        description: "Shiitake mushroom premium sales",
        category: "sales",
        date: new Date("2024-01-30"),
        locationId: 1,
      },
    ];

    defaultTransactions.forEach(transaction => {
      this.createFinancialTransaction(transaction);
    });

    // Add sample customers and products for sales management
    const defaultCustomers: InsertCustomer[] = [
      {
        name: "Organic Market Kathmandu",
        email: "orders@organicmarket.com.np",
        phone: "+977-1-4567890",
        address: "Thamel, Kathmandu",
        customerType: "business",
        source: "business",
        preferredPayment: "bank_transfer",
        isActive: true,
      },
      {
        name: "Ram Bahadur Thapa",
        email: "ram.thapa@gmail.com", 
        phone: "+977-9801234567",
        address: "Lalitpur",
        customerType: "individual",
        source: "online",
        preferredPayment: "esewa",
        isActive: true,
      },
    ];

    defaultCustomers.forEach(customer => {
      this.createCustomer(customer);
    });

    const defaultProducts: InsertProduct[] = [
      {
        name: "Fresh Oyster Mushrooms",
        category: "fresh_mushrooms",
        description: "Locally grown organic oyster mushrooms",
        sellingPrice: "450.00",
        costPrice: "200.00",
        unit: "kg",
        currentStock: "25",
        minimumStock: "5",
        isActive: true,
      },
      {
        name: "Premium Shiitake",
        category: "fresh_mushrooms", 
        description: "Premium quality shiitake mushrooms",
        sellingPrice: "800.00",
        costPrice: "350.00",
        unit: "kg",
        currentStock: "15",
        minimumStock: "3",
        isActive: true,
      },
      {
        name: "Mushroom Growing Kit",
        category: "growing_kits",
        description: "Complete oyster mushroom growing kit for home",
        sellingPrice: "1200.00",
        costPrice: "600.00",
        unit: "kit",
        currentStock: "10",
        minimumStock: "2",
        isActive: true,
      },
    ];

    defaultProducts.forEach(product => {
      this.createProduct(product);
    });

    // Add sample orders
    const defaultOrders: InsertOrder[] = [
      {
        orderNumber: "ORD-2024-001",
        customerId: 1,
        status: "completed",
        source: "business",
        totalAmount: "2250.00",
        paymentStatus: "paid",
        deliveryAddress: "Thamel, Kathmandu",
        orderDate: new Date("2024-01-20"),
        notes: "Regular business customer - weekly order",
      },
      {
        orderNumber: "ORD-2024-002",
        customerId: 2,
        status: "pending", 
        source: "online",
        totalAmount: "1650.00",
        paymentStatus: "pending",
        deliveryAddress: "Lalitpur",
        orderDate: new Date("2024-01-28"),
        notes: "First-time online customer",
      },
    ];

    // Create orders with items
    defaultOrders.forEach((order, index) => {
      const items: InsertOrderItem[] = [
        {
          productId: 1,
          quantity: "5",
          unitPrice: "450.00",
          totalPrice: "2250.00",
        },
        {
          productId: 2,
          quantity: "2",
          unitPrice: "800.00", 
          totalPrice: "1600.00",
        },
      ];
      this.createOrder(order, [items[index]]);
    });

    // Add sample employees for HR management
    const defaultEmployees: InsertEmployee[] = [
      {
        employeeId: "TEST-001",
        name: "Test User",
        email: "test@mycopath.com.np",
        phone: "+977-9800000000",
        position: "System Tester",
        department: "Administration",
        salary: "50000.00",
        hireDate: new Date("2024-01-01"),
        status: "active",
        locationId: 1,
        skills: "System testing, User acceptance testing",
        notes: "Test account for system validation",
      },
      {
        employeeId: "EMP001",
        name: "Akash Rai",
        email: "akash@mycopath.com.np",
        phone: "+977-9801234567",
        position: "Production Manager",
        department: "Production",
        salary: "45000.00",
        hireDate: new Date("2024-01-15"),
        status: "active",
        locationId: 1,
        skills: "Mushroom cultivation, Quality control, Team leadership",
        notes: "Responsible for production operations and quality assurance",
      },
      {
        employeeId: "EMP002", 
        name: "Haris Gurung",
        email: "haris@mycopath.com.np",
        phone: "+977-9812345678",
        position: "Marketing Manager",
        department: "Marketing",
        salary: "40000.00",
        hireDate: new Date("2024-01-20"),
        status: "active",
        locationId: 1,
        skills: "Digital marketing, Web development, Content creation",
        notes: "Handles marketing campaigns and website management",
      },
      {
        employeeId: "EMP003",
        name: "Nishant Silwal",
        email: "nishant@mycopath.com.np", 
        phone: "+977-9823456789",
        position: "Sales Manager",
        department: "Sales",
        salary: "42000.00",
        hireDate: new Date("2024-02-01"),
        status: "active",
        locationId: 1,
        skills: "International sales, Customer relations, Export documentation",
        notes: "Manages international sales and export operations",
      },
    ];

    defaultEmployees.forEach(employee => {
      this.createEmployee(employee);
    });

    // Add sample attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const defaultAttendance: InsertAttendance[] = [
      {
        employeeId: 1,
        date: today,
        checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
        checkOut: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
        hoursWorked: "9.00",
        status: "present",
        notes: "Regular day",
      },
      {
        employeeId: 2,
        date: today,
        checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30),
        checkOut: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30),
        hoursWorked: "9.00",
        status: "present",
        notes: "Late arrival due to traffic",
      },
      {
        employeeId: 3,
        date: yesterday,
        checkIn: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 0),
        checkOut: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 0),
        hoursWorked: "9.00",
        status: "present",
        notes: "Client meeting day",
      },
    ];

    defaultAttendance.forEach(attendance => {
      this.createAttendance(attendance);
    });

    // Add sample payroll records
    const defaultPayroll: InsertPayroll[] = [
      {
        employeeId: 1,
        period: "2024-12",
        basicSalary: "45000.00",
        allowances: "5000.00",
        deductions: "4500.00",
        netPay: "45500.00",
        status: "paid",
        payDate: new Date("2024-12-30"),
        notes: "December 2024 salary",
      },
      {
        employeeId: 2,
        period: "2024-12",
        basicSalary: "40000.00",
        allowances: "4000.00",
        deductions: "4000.00",
        netPay: "40000.00",
        status: "paid",
        payDate: new Date("2024-12-30"),
        notes: "December 2024 salary",
      },
      {
        employeeId: 3,
        period: "2024-12",
        basicSalary: "42000.00",
        allowances: "4200.00",
        deductions: "4200.00",
        netPay: "42000.00",
        status: "paid",
        payDate: new Date("2024-12-30"),
        notes: "December 2024 salary",
      },
    ];

    defaultPayroll.forEach(payroll => {
      this.createPayroll(payroll);
    });

    // Add test users for development
    const testUsers: InsertUser[] = [
      {
        employeeId: "TEST-001",
        email: "test@mycopath.com.np",
        passwordHash: "$2b$10$4yOgWCBBEEC5F9ru/YMfXuma9sOBYMa7bIB3uf1qnuaR.mWPYM0kK", // password: demo123
        firstName: "Test",
        lastName: "User",
        isEmailVerified: true,
        isActive: true,
        isApprovedByAdmin: true,
        registrationStatus: "approved",
        approvedBy: "System",
        approvedAt: new Date(),
        roleId: 1, // Admin role
        locationId: 1,
      },
      {
        employeeId: "EMP-001", 
        email: "akash@mycopath.com.np",
        passwordHash: "$2b$10$4yOgWCBBEEC5F9ru/YMfXuma9sOBYMa7bIB3uf1qnuaR.mWPYM0kK", // password: demo123
        firstName: "Akash",
        lastName: "Rai",
        isEmailVerified: true,
        isActive: true,
        isApprovedByAdmin: true,
        registrationStatus: "approved",
        approvedBy: "System",
        approvedAt: new Date(),
        roleId: 2, // User role
        locationId: 1,
      }
    ];

    testUsers.forEach(user => {
      // Check if user already exists to avoid duplicates
      const existing = Array.from(this.users.values()).find(u => u.employeeId === user.employeeId);
      if (!existing) {
        console.log(`Creating test user: ${user.employeeId}`);
        this.createUser(user);
      } else {
        console.log(`Test user ${user.employeeId} already exists`);
      }
    });
    
    // Update multiple users with proper passwords for testing dual authentication
    // Remove password setup from storage initialization - will be handled at login
    
    const testUserConfigs = [
      { employeeId: "demo_user", email: "demo@mycopath.com.np" },
      { employeeId: "production_manager", email: "production@mycopath.com.np" },
      { employeeId: "sales_rep", email: "sales@mycopath.com.np" }
    ];
    
    testUserConfigs.forEach(config => {
      const user = Array.from(this.users.values()).find(u => u.employeeId === config.employeeId);
      if (user) {
        const updatedUser = {
          ...user,
          isEmailVerified: true,
          isActive: true,
          isApprovedByAdmin: true
        };
        this.users.set(user.id, updatedUser);
        console.log(`Updated ${config.employeeId} with verification and approval status`);
      }
    });

    // Initialize roles if they don't exist
    const defaultRoles: InsertRole[] = [
      {
        name: "admin",
        displayName: "Administrator",
        description: "Full system access with all permissions",
        permissions: [
          "users.view", "users.create", "users.edit", "users.delete",
          "production.view", "production.create", "production.edit", "production.delete",
          "inventory.view", "inventory.create", "inventory.edit", "inventory.delete",
          "financial.view", "financial.create", "financial.edit", "financial.delete",
          "tasks.view", "tasks.create", "tasks.edit", "tasks.delete",
          "reports.view", "reports.create", "reports.edit", "reports.delete",
          "analytics.view", "sales.view", "sales.create", "sales.edit", "sales.delete",
          "hr.view", "hr.create", "hr.edit", "hr.delete",
          "admin.view", "admin.create", "admin.edit", "admin.delete"
        ],
        isActive: true,
      },
      {
        name: "user",
        displayName: "Regular User",
        description: "Standard user access for daily operations",
        permissions: [
          "production.view", "production.create", "production.edit",
          "inventory.view", "inventory.create", "inventory.edit",
          "financial.view", "tasks.view", "tasks.create", "tasks.edit",
          "reports.view", "analytics.view", "sales.view"
        ],
        isActive: true,
      },
      {
        name: "manager",
        displayName: "Manager",
        description: "Management level access with extended permissions",
        permissions: [
          "users.view", "production.view", "production.create", "production.edit", "production.delete",
          "inventory.view", "inventory.create", "inventory.edit", "inventory.delete",
          "financial.view", "financial.create", "financial.edit",
          "tasks.view", "tasks.create", "tasks.edit", "tasks.delete",
          "reports.view", "reports.create", "analytics.view",
          "sales.view", "sales.create", "sales.edit", "sales.delete",
          "hr.view", "hr.create", "hr.edit"
        ],
        isActive: true,
      },
    ];

    defaultRoles.forEach(role => {
      this.createRole(role);
    });
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentId++;
    const location: Location = { 
      ...insertLocation, 
      id,
      address: insertLocation.address || null,
      city: insertLocation.city || null,
      state: insertLocation.state || null,
      country: insertLocation.country || "Nepal",
      postalCode: insertLocation.postalCode || null,
      contactPerson: insertLocation.contactPerson || null,
      phone: insertLocation.phone || null,
      email: insertLocation.email || null,
      capacity: insertLocation.capacity || null,
      isActive: insertLocation.isActive ?? true,
      establishedDate: insertLocation.establishedDate || null,
      notes: insertLocation.notes || null,
      createdAt: new Date(),
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: number, updateLocation: Partial<InsertLocation>): Promise<Location | undefined> {
    const existing = this.locations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateLocation };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmployeeId(employeeId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.employeeId === employeeId,
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
      roleId: insertUser.roleId || null,
      locationId: insertUser.locationId || null,
      isEmailVerified: insertUser.isEmailVerified ?? false,
      isActive: insertUser.isActive ?? false, // Default inactive, needs admin approval
      isApprovedByAdmin: insertUser.isApprovedByAdmin ?? false,
      registrationStatus: insertUser.registrationStatus || "pending",
      approvedBy: insertUser.approvedBy || null,
      approvedAt: insertUser.approvedAt || null,
      emailVerificationToken: insertUser.emailVerificationToken || null,
      emailVerificationExpires: insertUser.emailVerificationExpires || null,
      passwordResetToken: insertUser.passwordResetToken || null,
      passwordResetExpires: insertUser.passwordResetExpires || null,
      lastLoginAt: insertUser.lastLoginAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateUser, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.emailVerificationToken === token,
    );
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.passwordResetToken === token,
    );
  }

  async updateUserLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(id, user);
    }
  }

  async verifyUserEmail(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async approveUser(id: number, approvedBy: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.isApprovedByAdmin = true;
      user.isActive = true;
      user.registrationStatus = "approved";
      user.approvedBy = approvedBy;
      user.approvedAt = new Date();
      user.updatedAt = new Date();
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  async updateVerificationToken(id: number, token: string, expires: Date): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.emailVerificationToken = token;
      user.emailVerificationExpires = expires;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async setPasswordResetToken(id: number, token: string, expires: Date): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.passwordResetToken = token;
      user.passwordResetExpires = expires;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
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
      locationId: insertBatch.locationId || null,
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

  // Contamination Logs
  async getContaminationLogs(): Promise<ContaminationLog[]> {
    return Array.from(this.contaminationLogs.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async createContaminationLog(insertLog: InsertContaminationLog): Promise<ContaminationLog> {
    const id = this.currentId++;
    const log: ContaminationLog = {
      id,
      ...insertLog,
      isVerified: false,
      createdAt: new Date(),
    };
    
    this.contaminationLogs.set(id, log);
    
    // Create activity log
    await this.createActivity({
      type: "contamination_reported",
      description: `Contamination reported for batch: ${insertLog.contaminationType} (${insertLog.contaminationSeverity} severity)`,
      entityId: insertLog.batchId,
      entityType: "production_batch",
    });
    
    return log;
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
      locationId: insertItem.locationId || null,
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
    const orderNumber = `ORD-${Date.now()}-${id}`;
    const order: Order = { 
      ...insertOrder, 
      id, 
      orderNumber,
      createdAt: new Date(),
      notes: insertOrder.notes || null,
      customerId: insertOrder.customerId || null,
      paidAmount: insertOrder.paidAmount || null,
      paymentMethod: insertOrder.paymentMethod || null,
      shippingAddress: insertOrder.shippingAddress || null,
      expectedDelivery: insertOrder.expectedDelivery || null,
      actualDelivery: insertOrder.actualDelivery || null,
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

  // Human Resource Management
  // Employees
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.currentId++;
    const employee: Employee = { ...insertEmployee, id, createdAt: new Date() };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: number, insertEmployee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee: Employee = { ...employee, ...insertEmployee };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getAttendanceByEmployee(employeeId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values())
      .filter(attendance => attendance.employeeId === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const dateStr = date.toISOString().split('T')[0];
    return Array.from(this.attendance.values())
      .filter(attendance => attendance.date.toISOString().split('T')[0] === dateStr);
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = this.currentId++;
    const attendance: Attendance = { ...insertAttendance, id, createdAt: new Date() };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: number, insertAttendance: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const attendance = this.attendance.get(id);
    if (!attendance) return undefined;
    
    const updatedAttendance: Attendance = { ...attendance, ...insertAttendance };
    this.attendance.set(id, updatedAttendance);
    return updatedAttendance;
  }

  async deleteAttendance(id: number): Promise<boolean> {
    return this.attendance.delete(id);
  }

  // Payroll
  async getPayroll(): Promise<Payroll[]> {
    return Array.from(this.payroll.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getPayrollByEmployee(employeeId: number): Promise<Payroll[]> {
    return Array.from(this.payroll.values())
      .filter(payroll => payroll.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    const id = this.currentId++;
    const payroll: Payroll = { ...insertPayroll, id, createdAt: new Date() };
    this.payroll.set(id, payroll);
    return payroll;
  }

  async updatePayroll(id: number, insertPayroll: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const payroll = this.payroll.get(id);
    if (!payroll) return undefined;
    
    const updatedPayroll: Payroll = { ...payroll, ...insertPayroll };
    this.payroll.set(id, updatedPayroll);
    return updatedPayroll;
  }

  async deletePayroll(id: number): Promise<boolean> {
    return this.payroll.delete(id);
  }

  async getTodayAttendance(userId: number, date: Date): Promise<Attendance | undefined> {
    // Get employee by userId first
    const employee = await this.getEmployeeByUserId(userId);
    if (!employee) return undefined;

    // Find today's attendance record for this employee
    const dateStr = date.toISOString().split('T')[0];
    for (const attendance of this.attendance.values()) {
      if (attendance.employeeId === employee.id && 
          attendance.date.toISOString().split('T')[0] === dateStr) {
        return attendance;
      }
    }
    return undefined;
  }

  async getEmployeeByUserId(userId: number): Promise<Employee | undefined> {
    // Get user first to get their email
    const user = this.users.get(userId);
    if (!user || !user.email) return undefined;

    // Find employee by email (assuming employee email matches user email)
    for (const employee of this.employees.values()) {
      if (employee.email === user.email) {
        return employee;
      }
    }
    return undefined;
  }

  // Role Management
  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getRole(id: number): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    for (const role of this.roles.values()) {
      if (role.name === name) {
        return role;
      }
    }
    return undefined;
  }

  async createRole(roleData: InsertRole): Promise<Role> {
    const id = this.roleIdCounter++;
    const role: Role = {
      id,
      ...roleData,
      createdAt: new Date(),
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: number, updateRole: Partial<InsertRole>): Promise<Role | undefined> {
    const existing = this.roles.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateRole };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: number): Promise<boolean> {
    return this.roles.delete(id);
  }

  // User Profile Management
  async getUserProfiles(): Promise<UserProfile[]> {
    return Array.from(this.userProfiles.values());
  }

  async getUserProfile(id: number): Promise<UserProfile | undefined> {
    return this.userProfiles.get(id);
  }

  async getUserProfileByUserId(userId: number): Promise<UserProfile | undefined> {
    for (const profile of this.userProfiles.values()) {
      if (profile.userId === userId) {
        return profile;
      }
    }
    return undefined;
  }

  async createUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const id = this.currentId++;
    const profile: UserProfile = {
      id,
      ...profileData,
      createdAt: new Date(),
    };
    this.userProfiles.set(id, profile);
    return profile;
  }

  async updateUserProfile(id: number, updateProfile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existing = this.userProfiles.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateProfile };
    this.userProfiles.set(id, updated);
    return updated;
  }

  async deleteUserProfile(id: number): Promise<boolean> {
    return this.userProfiles.delete(id);
  }

  // Enhanced User Methods with Role Support
  async getUserWithRole(id: number): Promise<(User & { role?: Role; profile?: UserProfile }) | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const role = user.roleId ? this.roles.get(user.roleId) : undefined;
    const profile = await this.getUserProfileByUserId(id);
    
    return { ...user, role, profile };
  }

  async getUsersWithRoles(): Promise<(User & { role?: Role; profile?: UserProfile })[]> {
    const usersWithRoles = [];
    for (const user of this.users.values()) {
      const role = user.roleId ? this.roles.get(user.roleId) : undefined;
      const profile = await this.getUserProfileByUserId(user.id);
      usersWithRoles.push({ ...user, role, profile });
    }
    return usersWithRoles.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async updateUserRole(userId: number, roleId: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    user.roleId = roleId;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }
}

// Use DatabaseStorage for persistent storage

export class DatabaseStorage implements IStorage {
  // Locations
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(desc(locations.createdAt));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values(insertLocation)
      .returning();
    return location;
  }

  async updateLocation(id: number, updateLocation: Partial<InsertLocation>): Promise<Location | undefined> {
    const [location] = await db
      .update(locations)
      .set(updateLocation)
      .where(eq(locations.id, id))
      .returning();
    return location;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return result.rowCount! > 0;
  }

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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByEmployeeId(employeeId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.employeeId, employeeId));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  async verifyUserEmail(id: number): Promise<void> {
    await db.update(users)
      .set({ 
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null 
      })
      .where(eq(users.id, id));
  }

  async updateVerificationToken(id: number, token: string, expires: Date): Promise<void> {
    await db.update(users)
      .set({ 
        emailVerificationToken: token,
        emailVerificationExpires: expires 
      })
      .where(eq(users.id, id));
  }

  async setPasswordResetToken(id: number, token: string, expires: Date): Promise<void> {
    await db.update(users)
      .set({ 
        passwordResetToken: token,
        passwordResetExpires: expires 
      })
      .where(eq(users.id, id));
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ 
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null 
      })
      .where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async approveUser(id: number, approvedBy: number): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        isApprovedByAdmin: true,
        approvedBy: approvedBy,
        approvedAt: new Date(),
        registrationStatus: 'approved'
      })
      .where(eq(users.id, id))
      .returning();
      
    if (user) {
      await this.createActivity({
        type: "user_approved",
        description: `User ${user.firstName} ${user.lastName} (${user.employeeId}) approved by administrator`,
        entityId: id,
        entityType: "user",
      });
    }
    
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async activateUser(id: number, activatedBy: number): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
      
    if (user) {
      await this.createActivity({
        type: "user_activated",
        description: `User ${user.firstName} ${user.lastName} (${user.employeeId}) activated by administrator`,
        entityId: id,
        entityType: "user",
      });
    }
    
    return user;
  }

  async deactivateUser(id: number, deactivatedBy: number, reason?: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
      
    if (user) {
      await this.createActivity({
        type: "user_deactivated",
        description: `User ${user.firstName} ${user.lastName} (${user.employeeId}) deactivated by administrator${reason ? `: ${reason}` : ''}`,
        entityId: id,
        entityType: "user",
      });
    }
    
    return user;
  }

  async rejectUser(id: number, rejectedBy: number): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        isApprovedByAdmin: false,
        isActive: false,
        registrationStatus: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
      
    if (user) {
      await this.createActivity({
        type: "user_rejected",
        description: `User ${user.firstName} ${user.lastName} (${user.employeeId}) rejected by administrator`,
        entityId: id,
        entityType: "user",
      });
    }
    
    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
      
    return user;
  }

  async resetUserPassword(id: number, newHashedPassword: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        password: newHashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
      
    if (user) {
      await this.createActivity({
        type: "password_reset",
        description: `Password reset for user ${user.firstName} ${user.lastName} (${user.employeeId})`,
        entityId: id,
        entityType: "user",
      });
    }
    
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

  // Human Resource Management
  // Employees
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }

  async updateEmployee(id: number, updateEmployee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [employee] = await db.update(employees).set(updateEmployee).where(eq(employees.id, id)).returning();
    return employee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    await db.delete(employees).where(eq(employees.id, id));
    return true;
  }

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    return await db.select().from(attendance).orderBy(desc(attendance.date));
  }

  async getAttendanceByEmployee(employeeId: number): Promise<Attendance[]> {
    return await db.select().from(attendance)
      .where(eq(attendance.employeeId, employeeId))
      .orderBy(desc(attendance.date));
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.select().from(attendance)
      .where(
        sql`${attendance.date} >= ${startOfDay} AND ${attendance.date} <= ${endOfDay}`
      );
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [attendanceRecord] = await db.insert(attendance).values(insertAttendance).returning();
    return attendanceRecord;
  }

  async updateAttendance(id: number, updateAttendance: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db.update(attendance).set(updateAttendance).where(eq(attendance.id, id)).returning();
    return attendanceRecord;
  }

  async deleteAttendance(id: number): Promise<boolean> {
    await db.delete(attendance).where(eq(attendance.id, id));
    return true;
  }

  // Payroll
  async getPayroll(): Promise<Payroll[]> {
    return await db.select().from(payroll).orderBy(desc(payroll.createdAt));
  }

  async getPayrollByEmployee(employeeId: number): Promise<Payroll[]> {
    return await db.select().from(payroll)
      .where(eq(payroll.employeeId, employeeId))
      .orderBy(desc(payroll.createdAt));
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    const [payrollRecord] = await db.insert(payroll).values(insertPayroll).returning();
    return payrollRecord;
  }

  async updatePayroll(id: number, updatePayroll: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const [payrollRecord] = await db.update(payroll).set(updatePayroll).where(eq(payroll.id, id)).returning();
    return payrollRecord;
  }

  async deletePayroll(id: number): Promise<boolean> {
    await db.delete(payroll).where(eq(payroll.id, id));
    return true;
  }

  // Additional Attendance Methods for Login/Logout System
  async getTodayAttendance(userId: number, date: Date): Promise<Attendance | undefined> {
    // First get the employee record for this user
    const employee = await this.getEmployeeByUserId(userId);
    if (!employee) return undefined;

    // Get attendance record for today
    const [attendanceRecord] = await db.select()
      .from(attendance)
      .where(and(
        eq(attendance.employeeId, employee.id),
        gte(attendance.date, date),
        lte(attendance.date, new Date(date.getTime() + 24 * 60 * 60 * 1000))
      ));
    
    return attendanceRecord;
  }

  async getEmployeeByUserId(userId: number): Promise<Employee | undefined> {
    // Get user first to get their email
    const user = await this.getUser(userId);
    if (!user) return undefined;

    // Find employee by email (assuming employee email matches user email)
    const [employee] = await db.select()
      .from(employees)
      .where(eq(employees.email, user.email));
    
    return employee;
  }

  // Role Management
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles).orderBy(roles.displayName);
  }

  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(insertRole).returning();
    return role;
  }

  async updateRole(id: number, updateRole: Partial<InsertRole>): Promise<Role | undefined> {
    const [role] = await db.update(roles).set(updateRole).where(eq(roles.id, id)).returning();
    return role;
  }

  async deleteRole(id: number): Promise<boolean> {
    // Prevent deletion of system roles
    const role = await this.getRole(id);
    if (role?.isSystemRole) {
      throw new Error("Cannot delete system role");
    }
    await db.delete(roles).where(eq(roles.id, id));
    return true;
  }

  // User Profile Management
  async getUserProfiles(): Promise<UserProfile[]> {
    return await db.select().from(userProfiles).orderBy(desc(userProfiles.createdAt));
  }

  async getUserProfile(id: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return profile;
  }

  async getUserProfileByUserId(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db.insert(userProfiles).values(insertProfile).returning();
    return profile;
  }

  async updateUserProfile(id: number, updateProfile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [profile] = await db.update(userProfiles).set({
      ...updateProfile,
      updatedAt: new Date()
    }).where(eq(userProfiles.id, id)).returning();
    return profile;
  }

  async deleteUserProfile(id: number): Promise<boolean> {
    await db.delete(userProfiles).where(eq(userProfiles.id, id));
    return true;
  }

  // Enhanced User Methods with Role Support
  async getUserWithRole(id: number): Promise<(User & { role?: Role; profile?: UserProfile }) | undefined> {
    const [result] = await db.select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, id));
    
    if (!result) return undefined;

    return {
      ...result.users,
      role: result.roles || undefined,
      profile: result.user_profiles || undefined
    };
  }

  async getUsersWithRoles(): Promise<(User & { role?: Role; profile?: UserProfile })[]> {
    const results = await db.select()
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .orderBy(users.firstName, users.lastName);

    return results.map(result => ({
      ...result.users,
      role: result.roles || undefined,
      profile: result.user_profiles || undefined
    }));
  }

  async updateUserRole(userId: number, roleId: number): Promise<User | undefined> {
    const [user] = await db.update(users).set({
      roleId,
      updatedAt: new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
}

// Environment-aware storage selection
import { getCurrentEnvironment, isUAT } from '../environment.config.js';

const currentEnv = getCurrentEnvironment();
export const storage = isUAT() ? new MemStorage() : new DatabaseStorage();

// Environment status logging
console.log(`\n🌍 Environment: ${currentEnv.displayName}`);
console.log(`📝 ${currentEnv.description}`);
console.log(`💾 Storage: ${currentEnv.features.storage.toUpperCase()}`);
console.log(`📧 Email Verification: ${currentEnv.features.emailVerification ? 'ENABLED' : 'DISABLED'}`);
console.log(`👥 Admin Approval: ${currentEnv.features.adminApproval ? 'REQUIRED' : 'AUTO-APPROVE'}`);
console.log(`🔍 Debug Mode: ${currentEnv.features.debugMode ? 'ON' : 'OFF'}`);
console.log(`🌐 Domain: ${currentEnv.domain}\n`);
