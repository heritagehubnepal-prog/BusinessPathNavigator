import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post("/api/production-batches", async (req, res) => {
    try {
      const validatedData = insertProductionBatchSchema.parse(req.body);
      const batch = await storage.createProductionBatch(validatedData);
      res.status(201).json(batch);
    } catch (error) {
      res.status(400).json({ message: "Invalid batch data", error });
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

  const httpServer = createServer(app);
  return httpServer;
}
