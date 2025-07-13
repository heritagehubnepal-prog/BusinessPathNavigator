import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ProductionBatch, FinancialTransaction, Milestone } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const { data: batches = [], isLoading: batchesLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<FinancialTransaction[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  // Production Analytics
  const getMonthlyProduction = () => {
    const monthlyData: Record<string, { mushrooms: number; mycelium: number; batches: number }> = {};
    
    batches.forEach(batch => {
      if (batch.harvestedWeight && batch.actualHarvestDate) {
        const month = new Date(batch.actualHarvestDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        if (!monthlyData[month]) {
          monthlyData[month] = { mushrooms: 0, mycelium: 0, batches: 0 };
        }
        
        monthlyData[month].batches += 1;
        
        if (batch.productType.toLowerCase().includes('mushroom')) {
          monthlyData[month].mushrooms += parseFloat(batch.harvestedWeight || "0");
        } else {
          monthlyData[month].mycelium += 1;
        }
      }
    });
    
    return monthlyData;
  };

  // Financial Analytics
  const getMonthlyFinancials = () => {
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += parseFloat(transaction.amount);
      } else {
        monthlyData[month].expenses += parseFloat(transaction.amount);
      }
    });
    
    return monthlyData;
  };

  // Expense Categories
  const getExpensesByCategory = () => {
    const categories: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category;
        categories[category] = (categories[category] || 0) + parseFloat(transaction.amount);
      });
    
    return categories;
  };

  const monthlyProduction = getMonthlyProduction();
  const monthlyFinancials = getMonthlyFinancials();
  const expenseCategories = getExpensesByCategory();

  const productionChartData = {
    labels: Object.keys(monthlyProduction),
    datasets: [
      {
        label: 'Mushroom Yield (kg)',
        data: Object.values(monthlyProduction).map(data => data.mushrooms),
        borderColor: '#6B8E23',
        backgroundColor: '#6B8E2320',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Mycelium Products (units)',
        data: Object.values(monthlyProduction).map(data => data.mycelium),
        borderColor: '#DAA520',
        backgroundColor: '#DAA52020',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const financialChartData = {
    labels: Object.keys(monthlyFinancials),
    datasets: [
      {
        label: 'Income (NPR)',
        data: Object.values(monthlyFinancials).map(data => data.income),
        backgroundColor: '#228B22',
      },
      {
        label: 'Expenses (NPR)',
        data: Object.values(monthlyFinancials).map(data => data.expenses),
        backgroundColor: '#DC143C',
      },
    ],
  };

  const expensePieData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: [
          '#6B8E23',
          '#DAA520',
          '#228B22',
          '#FF8C00',
          '#8B4513',
          '#2F4F4F',
          '#DC143C',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  if (batchesLoading || transactionsLoading || milestonesLoading) {
    return (
      <div>
        <Header 
          title="Analytics" 
          subtitle="Detailed insights and performance metrics for your farm."
        />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  const completedMilestones = milestones.filter(m => m.status === "completed");
  const totalBatches = batches.length;
  const successfulBatches = batches.filter(b => b.status === "harvested").length;
  const contaminatedBatches = batches.filter(b => b.status === "contaminated").length;
  const successRate = totalBatches > 0 ? (successfulBatches / totalBatches) * 100 : 0;

  return (
    <div>
      <Header 
        title="Analytics" 
        subtitle="Detailed insights and performance metrics for your farm."
      />
      
      <main className="p-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate">{successRate.toFixed(1)}%</div>
              <p className="text-gray-600">Success Rate</p>
              <p className="text-xs text-gray-500 mt-1">{successfulBatches} of {totalBatches} batches</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate">{contaminatedBatches}</div>
              <p className="text-gray-600">Contaminated Batches</p>
              <p className="text-xs text-gray-500 mt-1">{totalBatches > 0 ? ((contaminatedBatches / totalBatches) * 100).toFixed(1) : 0}% contamination rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate">{completedMilestones.length}</div>
              <p className="text-gray-600">Milestones Achieved</p>
              <p className="text-xs text-gray-500 mt-1">of {milestones.length} total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate">
                {batches
                  .filter(b => b.harvestedWeight)
                  .reduce((sum, b) => sum + parseFloat(b.harvestedWeight || "0"), 0)
                  .toFixed(1)}kg
              </div>
              <p className="text-gray-600">Total Yield</p>
              <p className="text-xs text-gray-500 mt-1">All time production</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Production Trends */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Production Trends</CardTitle>
                <Select defaultValue="6months">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3M</SelectItem>
                    <SelectItem value="6months">6M</SelectItem>
                    <SelectItem value="year">1Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={productionChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={financialChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {Object.keys(expenseCategories).length > 0 ? (
                  <Doughnut data={expensePieData} options={pieOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No expense data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Average Batch Cycle</span>
                  <span className="text-slate">14 days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Average Yield per Batch</span>
                  <span className="text-slate">
                    {batches.filter(b => b.harvestedWeight).length > 0 
                      ? (batches
                          .filter(b => b.harvestedWeight)
                          .reduce((sum, b) => sum + parseFloat(b.harvestedWeight || "0"), 0) / 
                         batches.filter(b => b.harvestedWeight).length).toFixed(1)
                      : "0"}kg
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Monthly Revenue Growth</span>
                  <span className="text-success">+18%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Efficiency Score</span>
                  <span className="text-primary">{successRate.toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
