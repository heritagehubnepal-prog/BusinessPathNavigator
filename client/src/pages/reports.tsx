import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductionBatch, FinancialTransaction, Milestone } from "@shared/schema";

export default function Reports() {
  const [reportType, setReportType] = useState("production");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  const { data: batches = [], isLoading: batchesLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<FinancialTransaction[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  // Filter data based on date range
  const getFilteredData = () => {
    const now = new Date();
    let filterDate = new Date();

    switch (dateRange) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case "custom":
        if (startDate && endDate) {
          filterDate = new Date(startDate);
        }
        break;
      default:
        filterDate.setMonth(now.getMonth() - 1);
    }

    const endFilterDate = dateRange === "custom" && endDate ? new Date(endDate) : now;

    return {
      batches: batches.filter(batch => {
        const batchDate = new Date(batch.createdAt || 0);
        return batchDate >= filterDate && batchDate <= endFilterDate;
      }),
      transactions: transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= filterDate && transactionDate <= endFilterDate;
      }),
      milestones: milestones.filter(milestone => {
        const milestoneDate = new Date(milestone.createdAt || 0);
        return milestoneDate >= filterDate && milestoneDate <= endFilterDate;
      }),
    };
  };

  const filteredData = getFilteredData();

  // Export functions
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(/\s+/g, "")];
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `${filename} exported successfully`,
    });
  };

  const exportProductionReport = () => {
    const headers = ["Batch Number", "Product Type", "Status", "Start Date", "Harvest Date", "Harvested Weight", "Contamination Rate"];
    const data = filteredData.batches.map(batch => ({
      batchnumber: batch.batchNumber,
      producttype: batch.productType,
      status: batch.status,
      startdate: new Date(batch.startDate).toLocaleDateString(),
      harvestdate: batch.actualHarvestDate ? new Date(batch.actualHarvestDate).toLocaleDateString() : "",
      harvestedweight: batch.harvestedWeight || "",
      contaminationrate: batch.contaminationRate || "",
    }));
    exportToCSV(data, "production_report", headers);
  };

  const exportFinancialReport = () => {
    const headers = ["Date", "Type", "Category", "Description", "Amount"];
    const data = filteredData.transactions.map(transaction => ({
      date: new Date(transaction.date).toLocaleDateString(),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
    }));
    exportToCSV(data, "financial_report", headers);
  };

  const exportMilestoneReport = () => {
    const headers = ["Milestone", "Status", "Target Value", "Current Value", "Bonus Amount", "Responsible", "Completed Date"];
    const data = filteredData.milestones.map(milestone => ({
      milestone: milestone.name,
      status: milestone.status,
      targetvalue: milestone.targetValue || "",
      currentvalue: milestone.currentValue || "",
      bonusamount: milestone.bonusAmount || "",
      responsible: milestone.responsible || "",
      completeddate: milestone.completedDate ? new Date(milestone.completedDate).toLocaleDateString() : "",
    }));
    exportToCSV(data, "milestone_report", headers);
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    const totalYield = filteredData.batches
      .filter(b => b.harvestedWeight)
      .reduce((sum, b) => sum + parseFloat(b.harvestedWeight || "0"), 0);

    const totalIncome = filteredData.transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = filteredData.transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const completedMilestones = filteredData.milestones.filter(m => m.status === "completed");
    const totalBonus = completedMilestones.reduce((sum, m) => sum + parseFloat(m.bonusAmount || "0"), 0);

    return {
      totalBatches: filteredData.batches.length,
      totalYield,
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      completedMilestones: completedMilestones.length,
      totalBonus,
    };
  };

  const summaryStats = getSummaryStats();

  if (batchesLoading || transactionsLoading || milestonesLoading) {
    return (
      <div>
        <Header 
          title="Reports" 
          subtitle="Generate and export detailed reports for your farm operations."
        />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading reports...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Reports" 
        subtitle="Generate and export detailed reports for your farm operations."
      />
      
      <main className="p-6">
        {/* Report Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production Report</SelectItem>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="milestone">Milestone Report</SelectItem>
                    <SelectItem value="summary">Summary Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "custom" && (
                <>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Total Batches</span>
              </div>
              <div className="text-2xl font-bold text-slate">{summaryStats.totalBatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-success">Total Yield</span>
              </div>
              <div className="text-2xl font-bold text-slate">{summaryStats.totalYield.toFixed(1)}kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Profit</span>
              </div>
              <div className={`text-2xl font-bold ${
                summaryStats.profit >= 0 ? "text-success" : "text-destructive"
              }`}>
                NPR {summaryStats.profit.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-warning" />
                <span className="text-sm font-medium text-warning">Bonus Earned</span>
              </div>
              <div className="text-2xl font-bold text-slate">NPR {summaryStats.totalBonus.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={exportProductionReport}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                <span>Export Production Report</span>
              </Button>

              <Button
                onClick={exportFinancialReport}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                <span>Export Financial Report</span>
              </Button>

              <Button
                onClick={exportMilestoneReport}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                <span>Export Milestone Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Report Preview - {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</CardTitle>
          </CardHeader>
          <CardContent>
            {reportType === "production" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Product Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Harvested Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.batches.slice(0, 10).map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.batchNumber}</TableCell>
                      <TableCell>{batch.productType}</TableCell>
                      <TableCell>{batch.status}</TableCell>
                      <TableCell>{new Date(batch.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{batch.harvestedWeight ? `${batch.harvestedWeight}kg` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === "financial" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={
                        transaction.type === "income" ? "text-success" : "text-destructive"
                      }>
                        {transaction.type === "income" ? "+" : "-"}NPR {parseFloat(transaction.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === "milestone" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsible</TableHead>
                    <TableHead>Bonus Amount</TableHead>
                    <TableHead>Completed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.milestones.slice(0, 10).map((milestone) => (
                    <TableRow key={milestone.id}>
                      <TableCell>{milestone.name}</TableCell>
                      <TableCell>{milestone.status}</TableCell>
                      <TableCell>{milestone.responsible || "-"}</TableCell>
                      <TableCell>NPR {parseFloat(milestone.bonusAmount || "0").toLocaleString()}</TableCell>
                      <TableCell>
                        {milestone.completedDate ? new Date(milestone.completedDate).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === "summary" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-slate mb-3">Production Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Batches:</span>
                        <span className="font-medium">{summaryStats.totalBatches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Yield:</span>
                        <span className="font-medium">{summaryStats.totalYield.toFixed(1)}kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium">
                          {summaryStats.totalBatches > 0 
                            ? ((filteredData.batches.filter(b => b.status === "harvested").length / summaryStats.totalBatches) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-slate mb-3">Financial Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Income:</span>
                        <span className="font-medium text-success">NPR {summaryStats.totalIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Expenses:</span>
                        <span className="font-medium text-destructive">NPR {summaryStats.totalExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Profit:</span>
                        <span className={`font-medium ${summaryStats.profit >= 0 ? "text-success" : "text-destructive"}`}>
                          NPR {summaryStats.profit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {filteredData.batches.length === 0 && filteredData.transactions.length === 0 && filteredData.milestones.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available for the selected date range.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
