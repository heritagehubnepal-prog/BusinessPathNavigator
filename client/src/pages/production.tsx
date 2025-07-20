import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import BatchForm from "@/components/forms/batch-form";
import BatchEditForm from "@/components/forms/batch-edit-form";
import { useAuth } from "@/hooks/useAuth";
import type { ProductionBatch } from "@shared/schema";

const getStatusColor = (status: string) => {
  switch (status) {
    case "growing":
      return "bg-success text-success-foreground";
    case "inoculation":
      return "bg-primary text-primary-foreground";
    case "ready":
      return "bg-warning text-warning-foreground";
    case "harvested":
      return "bg-accent text-accent-foreground";
    case "contaminated":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const calculateProgress = (startDate: string, expectedHarvestDate?: string) => {
  if (!expectedHarvestDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(expectedHarvestDate);
  const now = new Date();
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
};

export default function Production() {
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const { user } = useAuth();
  
  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const handleEditBatch = (batch: ProductionBatch) => {
    setSelectedBatch(batch);
    setShowEditForm(true);
  };

  const activeBatches = batches.filter(
    batch => batch.status !== "harvested" && batch.status !== "contaminated"
  );

  const completedBatches = batches.filter(
    batch => batch.status === "harvested"
  );

  return (
    <div>
      <Header 
        title="Production Management" 
        subtitle="Monitor and manage your mushroom production batches."
        actionLabel="New Production Batch"
        onAction={() => setShowBatchForm(true)}
      />
      
      <main className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate">{activeBatches.length}</div>
              <p className="text-gray-600">Active Batches</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate">{completedBatches.length}</div>
              <p className="text-gray-600">Completed This Month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate">
                {completedBatches
                  .reduce((sum, batch) => sum + parseFloat(batch.harvestedWeight || "0"), 0)
                  .toFixed(1)}kg
              </div>
              <p className="text-gray-600">Total Yield This Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Batches */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Production Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500">Loading batches...</p>
            ) : activeBatches.length === 0 ? (
              <p className="text-gray-500">No active batches</p>
            ) : (
              <div className="space-y-4">
                {activeBatches.map((batch) => (
                  <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate">{batch.batchNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {batch.productType} • {batch.substrate}
                        </p>
                      </div>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-medium">
                          {new Date(batch.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      {batch.expectedHarvestDate && (
                        <div>
                          <p className="text-xs text-gray-500">Expected Harvest</p>
                          <p className="text-sm font-medium">
                            {new Date(batch.expectedHarvestDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {batch.initialWeight && (
                        <div>
                          <p className="text-xs text-gray-500">Initial Weight</p>
                          <p className="text-sm font-medium">{batch.initialWeight}kg</p>
                        </div>
                      )}
                    </div>
                    
                    {batch.expectedHarvestDate && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(calculateProgress(batch.startDate, batch.expectedHarvestDate))}%</span>
                        </div>
                        <Progress 
                          value={calculateProgress(batch.startDate, batch.expectedHarvestDate)} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Batches Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Production Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500">Loading batches...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Product Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Harvested Weight</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                      <TableCell>{batch.productType}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(batch.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {batch.harvestedWeight ? `${batch.harvestedWeight}kg` : "-"}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditBatch(batch)}
                        >
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

      <BatchForm open={showBatchForm} onOpenChange={setShowBatchForm} />
      
      <BatchEditForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        batch={selectedBatch}
        userRole={user?.role || "worker"}
      />
    </div>
  );
}
