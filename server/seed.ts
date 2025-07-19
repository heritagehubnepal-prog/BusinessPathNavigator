import { db } from "./db";
import { 
  locations, users, productionBatches, inventory, financialTransactions,
  milestones, tasks, activities, customers, products, orders, orderItems,
  employees, attendance, payroll
} from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Seed Locations
    const [mainLocation] = await db.insert(locations).values({
      name: "Mycopath HQ",
      type: "farm",
      address: "Kathmandu Valley Innovation District",
      city: "Kathmandu",
      state: "Bagmati Province",
      country: "Nepal",
      contactPerson: "Farm Manager",
      phone: "+977-1-234567",
      email: "hq@mycopath.com.np",
      capacity: "5000kg monthly production",
      isActive: true,
      notes: "Main production and processing facility",
    }).returning();

    // Seed Employees (HR)
    const employeeData = [
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
        locationId: mainLocation.id,
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
        locationId: mainLocation.id,
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
        locationId: mainLocation.id,
        skills: "International sales, Customer relations, Export documentation",
        notes: "Manages international sales and export operations",
      },
    ];

    const seedEmployees = await db.insert(employees).values(employeeData).returning();

    // Seed Production Batches
    const productionData = [
      {
        batchNumber: "MYC-2024-001",
        productType: "Shiitake Mushroom",
        substrate: "Oak sawdust blend",
        locationId: mainLocation.id,
        startDate: new Date("2024-12-01"),
        expectedHarvestDate: new Date("2024-12-15"),
        actualHarvestDate: new Date("2024-12-14"),
        status: "harvested",
        initialWeight: "100.00",
        harvestedWeight: "85.00",
        contaminationRate: "2.50",
        notes: "Excellent batch with high yield",
      },
      {
        batchNumber: "MYC-2024-002",
        productType: "Oyster Mushroom",
        substrate: "Wheat straw",
        locationId: mainLocation.id,
        startDate: new Date("2024-12-05"),
        expectedHarvestDate: new Date("2024-12-18"),
        status: "growing",
        initialWeight: "80.00",
        contaminationRate: "1.00",
        notes: "Fast growing batch, ahead of schedule",
      },
    ];

    await db.insert(productionBatches).values(productionData);

    // Seed Milestones
    const milestoneData = [
      {
        name: "Break-even Point",
        description: "Achieve monthly break-even with NPR 250,000 revenue",
        targetDate: new Date("2025-02-28"),
        targetValue: "250000.00",
        currentValue: "130000.00",
        bonusAmount: "50000.00",
        status: "in_progress",
        notes: "52% progress towards break-even target",
      },
      {
        name: "Monthly Yield Increase",
        description: "Achieve 20%+ yield increase per batch consistently",
        targetDate: new Date("2025-01-31"),
        targetValue: "20.00",
        currentValue: "15.00",
        bonusAmount: "25000.00",
        status: "in_progress",
        notes: "Currently at 15% increase, need 5% more",
      },
      {
        name: "Product Innovation",
        description: "Launch 1 new mushroom product every 3-4 months",
        targetDate: new Date("2025-03-31"),
        targetValue: "1.00",
        currentValue: "0.00",
        bonusAmount: "30000.00",
        status: "pending",
        notes: "Research phase for mycelium-based packaging materials",
      },
      {
        name: "Social Media Growth",
        description: "Reach 500+ social media followers by Month 4",
        targetDate: new Date("2025-04-30"),
        targetValue: "500.00",
        currentValue: "150.00",
        bonusAmount: "15000.00",
        status: "in_progress",
        notes: "30% progress, focus on content marketing",
      },
      {
        name: "First Export Sale",
        description: "Complete first international export sale",
        targetDate: new Date("2025-06-30"),
        targetValue: "1.00",
        currentValue: "0.00",
        bonusAmount: "75000.00",
        status: "pending",
        notes: "Developing export documentation and certification",
      },
      {
        name: "Worker Efficiency",
        description: "Maintain contamination rate below 5%",
        targetDate: new Date("2025-12-31"),
        targetValue: "5.00",
        currentValue: "2.50",
        bonusAmount: "20000.00",
        status: "on_track",
        notes: "Excellent performance, currently at 2.5%",
      },
      {
        name: "Website Launch",
        description: "Launch company website with e-commerce functionality",
        targetDate: new Date("2025-05-31"),
        targetValue: "1.00",
        currentValue: "0.70",
        bonusAmount: "40000.00",
        status: "in_progress",
        notes: "70% complete, final testing phase",
      },
      {
        name: "Year 1 Net Profit Target",
        description: "Achieve NPR 450,000 net profit in Year 1",
        targetDate: new Date("2025-12-31"),
        targetValue: "450000.00",
        currentValue: "85000.00",
        bonusAmount: "100000.00",
        status: "in_progress",
        notes: "19% progress, on track for annual target",
      },
    ];

    await db.insert(milestones).values(milestoneData);

    // Seed Financial Transactions
    const financialData = [
      {
        type: "income",
        category: "product_sales",
        amount: "25000.00",
        description: "Shiitake mushroom sales to local restaurants",
        date: new Date("2024-12-15"),
      },
      {
        type: "expense",
        category: "materials",
        amount: "8000.00",
        description: "Oak sawdust substrate purchase",
        date: new Date("2024-12-01"),
      },
      {
        type: "income",
        category: "product_sales",
        amount: "18000.00",
        description: "Oyster mushroom retail sales",
        date: new Date("2024-12-10"),
      },
    ];

    await db.insert(financialTransactions).values(financialData);

    // Seed Inventory
    const inventoryData = [
      {
        itemName: "Oak Sawdust",
        category: "substrate",
        locationId: mainLocation.id,
        currentStock: "500.00",
        unit: "kg",
        minimumStock: "100.00",
        costPerUnit: "15.00",
        supplier: "Himalayan Timber Co.",
      },
      {
        itemName: "Shiitake Spawn",
        category: "spawn",
        locationId: mainLocation.id,
        currentStock: "50.00",
        unit: "pieces",
        minimumStock: "20.00",
        costPerUnit: "125.00",
        supplier: "Nepal Mushroom Labs",
      },
      {
        itemName: "Packaging Boxes",
        category: "packaging",
        locationId: mainLocation.id,
        currentStock: "1000.00",
        unit: "pieces",
        minimumStock: "200.00",
        costPerUnit: "8.00",
        supplier: "Eco Pack Nepal",
      },
    ];

    await db.insert(inventory).values(inventoryData);

    // Seed Attendance
    const attendanceData = [
      {
        employeeId: seedEmployees[0].id,
        date: new Date(),
        checkIn: new Date(new Date().setHours(8, 0, 0, 0)),
        checkOut: new Date(new Date().setHours(17, 0, 0, 0)),
        hoursWorked: "9.00",
        status: "present",
        notes: "Regular day",
      },
      {
        employeeId: seedEmployees[1].id,
        date: new Date(),
        checkIn: new Date(new Date().setHours(8, 30, 0, 0)),
        checkOut: new Date(new Date().setHours(17, 30, 0, 0)),
        hoursWorked: "9.00",
        status: "present",
        notes: "Late arrival due to traffic",
      },
      {
        employeeId: seedEmployees[2].id,
        date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Yesterday
        checkIn: new Date(new Date(new Date().getTime() - 24 * 60 * 60 * 1000).setHours(8, 0, 0, 0)),
        checkOut: new Date(new Date(new Date().getTime() - 24 * 60 * 60 * 1000).setHours(17, 0, 0, 0)),
        hoursWorked: "9.00",
        status: "present",
        notes: "Client meeting day",
      },
    ];

    await db.insert(attendance).values(attendanceData);

    // Seed Payroll
    const payrollData = [
      {
        employeeId: seedEmployees[0].id,
        payPeriod: "2024-12",
        basicSalary: "45000.00",
        overtime: "0.00",
        bonus: "5000.00",
        deductions: "4500.00",
        totalPay: "45500.00",
        status: "paid",
        payDate: new Date("2024-12-30"),
        notes: "December 2024 salary",
      },
      {
        employeeId: seedEmployees[1].id,
        payPeriod: "2024-12",
        basicSalary: "40000.00",
        overtime: "0.00",
        bonus: "4000.00",
        deductions: "4000.00",
        totalPay: "40000.00",
        status: "paid",
        payDate: new Date("2024-12-30"),
        notes: "December 2024 salary",
      },
      {
        employeeId: seedEmployees[2].id,
        payPeriod: "2024-12",
        basicSalary: "42000.00",
        overtime: "0.00",
        bonus: "4200.00",
        deductions: "4200.00",
        totalPay: "42000.00",
        status: "paid",
        payDate: new Date("2024-12-30"),
        notes: "December 2024 salary",
      },
    ];

    await db.insert(payroll).values(payrollData);

    // Seed Activities
    const activityData = [
      {
        type: "batch_created",
        description: "Production batch MYC-2024-001 created",
        timestamp: new Date("2024-12-01"),
        userId: null,
        metadata: JSON.stringify({ batchNumber: "MYC-2024-001" }),
      },
      {
        type: "milestone_updated",
        description: "Break-even milestone progress updated to 52%",
        timestamp: new Date("2024-12-15"),
        userId: null,
        metadata: JSON.stringify({ milestone: "Break-even Point", progress: 52 }),
      },
      {
        type: "income_added",
        description: "Income added: Shiitake mushroom sales NPR 25,000",
        timestamp: new Date("2024-12-15"),
        userId: null,
        metadata: JSON.stringify({ amount: 25000, category: "product_sales" }),
      },
    ];

    await db.insert(activities).values(activityData);

    console.log("✅ Database seeding completed successfully!");
    console.log("Seeded:", {
      locations: 1,
      employees: seedEmployees.length,
      productionBatches: productionData.length,
      milestones: milestoneData.length,
      financialTransactions: financialData.length,
      inventory: inventoryData.length,
      attendance: attendanceData.length,
      payroll: payrollData.length,
      activities: activityData.length,
    });
    
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase().then(() => {
  console.log("Database seeding process completed.");
  process.exit(0);
}).catch((error) => {
  console.error("Seeding process failed:", error);
  process.exit(1);
});