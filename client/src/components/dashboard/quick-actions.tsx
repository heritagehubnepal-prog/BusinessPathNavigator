import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sprout, Package, Receipt } from "lucide-react";
import { useState } from "react";
import BatchForm from "@/components/forms/batch-form";
import InventoryForm from "@/components/forms/inventory-form";
import ExpenseForm from "@/components/forms/expense-form";

export default function QuickActions() {
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  return (
    <>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto space-y-2 hover:border-primary hover:bg-primary hover:bg-opacity-5"
              onClick={() => setShowBatchForm(true)}
            >
              <Plus className="text-primary text-2xl" />
              <span className="text-sm font-medium text-slate">New Batch</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto space-y-2 hover:border-primary hover:bg-primary hover:bg-opacity-5"
            >
              <Sprout className="text-primary text-2xl" />
              <span className="text-sm font-medium text-slate">Record Harvest</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto space-y-2 hover:border-primary hover:bg-primary hover:bg-opacity-5"
              onClick={() => setShowInventoryForm(true)}
            >
              <Package className="text-primary text-2xl" />
              <span className="text-sm font-medium text-slate">Update Inventory</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto space-y-2 hover:border-primary hover:bg-primary hover:bg-opacity-5"
              onClick={() => setShowExpenseForm(true)}
            >
              <Receipt className="text-primary text-2xl" />
              <span className="text-sm font-medium text-slate">Add Expense</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <BatchForm open={showBatchForm} onOpenChange={setShowBatchForm} />
      <InventoryForm open={showInventoryForm} onOpenChange={setShowInventoryForm} />
      <ExpenseForm open={showExpenseForm} onOpenChange={setShowExpenseForm} />
    </>
  );
}
