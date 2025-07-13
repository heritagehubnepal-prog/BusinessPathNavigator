import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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

const getDaysProgress = (startDate: string, expectedHarvestDate?: string) => {
  if (!expectedHarvestDate) return "N/A";
  
  const start = new Date(startDate);
  const end = new Date(expectedHarvestDate);
  const now = new Date();
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  return `Day ${Math.min(elapsedDays, totalDays)}/${totalDays}`;
};

export default function ActiveBatches() {
  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const activeBatches = batches.filter(
    batch => batch.status !== "harvested" && batch.status !== "contaminated"
  ).slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Production Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading batches...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Production Batches</CardTitle>
          <Link href="/production" className="text-primary text-sm font-medium hover:text-primary/80">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeBatches.length === 0 ? (
            <p className="text-gray-500 text-sm">No active batches</p>
          ) : (
            activeBatches.map((batch) => (
              <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate">{batch.batchNumber}</span>
                  <Badge className={getStatusColor(batch.status)}>
                    {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {batch.productType} • Started: {new Date(batch.startDate).toLocaleDateString()}
                </p>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{getDaysProgress(batch.startDate, batch.expectedHarvestDate)}</span>
                </div>
                <Progress 
                  value={calculateProgress(batch.startDate, batch.expectedHarvestDate)} 
                  className="h-2"
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
