import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import ExpenseForm from "@/components/forms/expense-form";
import type { FinancialTransaction } from "@shared/schema";

export default function Financial() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  
  const { data: transactions = [], isLoading } = useQuery<FinancialTransaction[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const thisMonthIncome = thisMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div>
      <Header 
        title="Financial Management" 
        subtitle="Track income, expenses, and financial performance."
        actionLabel="Add Transaction"
        onAction={() => setShowExpenseForm(true)}
      />
      
      <main className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-success">This Month Income</span>
              </div>
              <div className="text-2xl font-bold text-slate">NPR {thisMonthIncome.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">This Month Expenses</span>
              </div>
              <div className="text-2xl font-bold text-slate">NPR {thisMonthExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">This Month Profit</span>
              </div>
              <div className={`text-2xl font-bold ${
                thisMonthIncome - thisMonthExpenses >= 0 ? "text-success" : "text-destructive"
              }`}>
                NPR {(thisMonthIncome - thisMonthExpenses).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Total Profit</span>
              </div>
              <div className={`text-2xl font-bold ${
                totalIncome - totalExpenses >= 0 ? "text-success" : "text-destructive"
              }`}>
                NPR {(totalIncome - totalExpenses).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-500">No transactions found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            transaction.type === "income" 
                              ? "bg-success text-success-foreground" 
                              : "bg-destructive text-destructive-foreground"
                          }
                        >
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={
                        transaction.type === "income" ? "text-success" : "text-destructive"
                      }>
                        {transaction.type === "income" ? "+" : "-"}NPR {parseFloat(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <ExpenseForm open={showExpenseForm} onOpenChange={setShowExpenseForm} />
    </div>
  );
}
