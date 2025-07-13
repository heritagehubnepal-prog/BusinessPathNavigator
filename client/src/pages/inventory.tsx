import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import InventoryForm from "@/components/forms/inventory-form";
import type { Inventory } from "@shared/schema";

const getCategoryColor = (category: string) => {
  switch (category) {
    case "substrate":
      return "bg-primary text-primary-foreground";
    case "spawn":
      return "bg-success text-success-foreground";
    case "tools":
      return "bg-accent text-accent-foreground";
    case "packaging":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const isLowStock = (item: Inventory) => {
  const current = parseFloat(item.currentStock);
  const minimum = parseFloat(item.minimumStock || "0");
  return minimum > 0 && current <= minimum;
};

export default function Inventory() {
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  
  const { data: inventory = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const lowStockItems = inventory.filter(isLowStock);
  const totalValue = inventory.reduce((sum, item) => {
    return sum + (parseFloat(item.currentStock) * parseFloat(item.costPerUnit || "0"));
  }, 0);

  return (
    <div>
      <Header 
        title="Inventory Management" 
        subtitle="Track and manage your substrate, tools, and materials inventory."
        actionLabel="Add Inventory Item"
        onAction={() => setShowInventoryForm(true)}
      />
      
      <main className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate">{inventory.length}</div>
              <p className="text-gray-600">Total Items</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-slate">{lowStockItems.length}</div>
                {lowStockItems.length > 0 && (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                )}
              </div>
              <p className="text-gray-600">Low Stock Items</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate">NPR {totalValue.toLocaleString()}</div>
              <p className="text-gray-600">Total Inventory Value</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="mb-8 border-warning">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                <span>Low Stock Alert</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-warning bg-opacity-10 rounded">
                    <span className="font-medium">{item.itemName}</span>
                    <span className="text-sm text-gray-600">
                      {item.currentStock} {item.unit} (Min: {item.minimumStock})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500">Loading inventory...</p>
            ) : inventory.length === 0 ? (
              <p className="text-gray-500">No inventory items found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Minimum Stock</TableHead>
                    <TableHead>Cost per Unit</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.minimumStock ? `${item.minimumStock} ${item.unit}` : "-"}
                      </TableCell>
                      <TableCell>
                        {item.costPerUnit ? `NPR ${item.costPerUnit}` : "-"}
                      </TableCell>
                      <TableCell>{item.supplier || "-"}</TableCell>
                      <TableCell>
                        {isLowStock(item) ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
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

      <InventoryForm open={showInventoryForm} onOpenChange={setShowInventoryForm} />
    </div>
  );
}
