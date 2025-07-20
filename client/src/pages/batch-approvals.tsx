import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ProductionBatch } from "@shared/schema";

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getApprovalStatusColor = (batch: any) => {
  if (batch.isApproved) return "bg-green-100 text-green-800";
  if (batch.requiresApproval) return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
};

export default function BatchApprovals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  
  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const extendedBatches = batches as (ProductionBatch & {
    requiresApproval?: boolean;
    isApproved?: boolean;
    riskLevel?: string;
    qualityCheckStatus?: string;
    createdBy?: string;
    approvedBy?: string;
    approvedAt?: string;
  })[];

  const pendingBatches = extendedBatches.filter(batch => 
    batch.requiresApproval && !batch.isApproved
  );

  const approvedBatches = extendedBatches.filter(batch => 
    batch.isApproved
  );

  const highRiskBatches = extendedBatches.filter(batch => 
    batch.riskLevel === "high" || 
    (batch.contaminationRate && parseFloat(batch.contaminationRate.toString()) > 10)
  );

  const approveBatchMutation = useMutation({
    mutationFn: async (batchId: number) => {
      const response = await apiRequest("PATCH", `/api/production-batches/${batchId}`, {
        isApproved: true,
        requiresApproval: false,
        qualityCheckStatus: "passed",
        approvedAt: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      toast({
        title: "Success",
        description: "Production batch approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve batch",
        variant: "destructive",
      });
    },
  });

  const rejectBatchMutation = useMutation({
    mutationFn: async (batchId: number) => {
      const response = await apiRequest("PATCH", `/api/production-batches/${batchId}`, {
        isApproved: false,
        requiresApproval: false,
        qualityCheckStatus: "failed",
        status: "contaminated", // Mark as contaminated if rejected
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      toast({
        title: "Success",
        description: "Production batch rejected and marked as contaminated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject batch",
        variant: "destructive",
      });
    },
  });

  const BatchRow = ({ batch, showActions = true }: { batch: any, showActions?: boolean }) => (
    <TableRow>
      <TableCell className="font-medium">{batch.batchNumber}</TableCell>
      <TableCell>{batch.productType}</TableCell>
      <TableCell>
        <Badge className={getRiskLevelColor(batch.riskLevel || "low")}>
          {(batch.riskLevel || "low").charAt(0).toUpperCase() + (batch.riskLevel || "low").slice(1)} Risk
        </Badge>
      </TableCell>
      <TableCell>{batch.contaminationRate ? `${batch.contaminationRate}%` : "0%"}</TableCell>
      <TableCell>{batch.createdBy || "Unknown"}</TableCell>
      <TableCell>
        <Badge className={getApprovalStatusColor(batch)}>
          {batch.isApproved ? "Approved" : batch.requiresApproval ? "Pending" : "Auto-Approved"}
        </Badge>
      </TableCell>
      {showActions && (
        <TableCell>
          {batch.requiresApproval && !batch.isApproved && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => approveBatchMutation.mutate(batch.id)}
                disabled={approveBatchMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectBatchMutation.mutate(batch.id)}
                disabled={rejectBatchMutation.isPending}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
            </div>
          )}
          {batch.isApproved && (
            <span className="text-sm text-gray-500">
              Approved by {batch.approvedBy || "Manager"}
            </span>
          )}
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <div>
      <Header 
        title="Production Batch Approvals" 
        subtitle="Review and approve production data entered by workers for risk mitigation."
      />
      
      <main className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">{pendingBatches.length}</div>
              <p className="text-gray-600">Pending Approval</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{approvedBatches.length}</div>
              <p className="text-gray-600">Approved</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{highRiskBatches.length}</div>
              <p className="text-gray-600">High Risk</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{extendedBatches.length}</div>
              <p className="text-gray-600">Total Batches</p>
            </CardContent>
          </Card>
        </div>

        {/* Approval Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Management & Risk Control</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Pending Approval ({pendingBatches.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedBatches.length})
                </TabsTrigger>
                <TabsTrigger value="high-risk">
                  High Risk ({highRiskBatches.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                {pendingBatches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No batches pending approval</p>
                    <p className="text-sm mt-1">All production data has been reviewed</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch Number</TableHead>
                        <TableHead>Product Type</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Contamination</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBatches.map((batch) => (
                        <BatchRow key={batch.id} batch={batch} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="approved" className="mt-6">
                {approvedBatches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No approved batches yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch Number</TableHead>
                        <TableHead>Product Type</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Contamination</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Approved By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedBatches.map((batch) => (
                        <BatchRow key={batch.id} batch={batch} showActions={false} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="high-risk" className="mt-6">
                {highRiskBatches.length === 0 ? (
                  <div className="text-center py-8 text-green-500">
                    <p>No high-risk batches detected</p>
                    <p className="text-sm mt-1">All production is within acceptable risk levels</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">⚠️ High Risk Alert</h4>
                      <p className="text-red-700 text-sm">
                        These batches require immediate management attention due to high contamination rates or risk factors.
                      </p>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Batch Number</TableHead>
                          <TableHead>Product Type</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead>Contamination</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {highRiskBatches.map((batch) => (
                          <BatchRow key={batch.id} batch={batch} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}