import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import BatchStageForm from "@/components/forms/batch-stage-form";
import ContaminationForm from "@/components/forms/contamination-form";
import BatchProgressTracker from "@/components/batch-progress-tracker";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ProductionBatch } from "@shared/schema";

const stageOrder = ["batch_creation", "inoculation", "incubation", "fruiting", "harvesting", "post_harvest", "completed"];

const getStageProgress = (currentStage: string) => {
  const currentIndex = stageOrder.indexOf(currentStage);
  return currentIndex >= 0 ? ((currentIndex + 1) / stageOrder.length) * 100 : 0;
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case "batch_creation": return "bg-blue-100 text-blue-800";
    case "inoculation": return "bg-purple-100 text-purple-800";
    case "incubation": return "bg-orange-100 text-orange-800";
    case "fruiting": return "bg-green-100 text-green-800";
    case "harvesting": return "bg-yellow-100 text-yellow-800";
    case "post_harvest": return "bg-gray-100 text-gray-800";
    case "completed": return "bg-emerald-100 text-emerald-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getNextStageAction = (stage: string) => {
  switch (stage) {
    case "batch_creation": return "Start Inoculation";
    case "inoculation": return "Begin Incubation";
    case "incubation": return "Start Fruiting";
    case "fruiting": return "Record Harvest";
    case "harvesting": return "Complete Post-Harvest";
    case "post_harvest": return "Mark Complete";
    default: return "Complete";
  }
};

export default function ProductionWorkflow() {
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [showStageForm, setShowStageForm] = useState(false);
  const [showContaminationForm, setShowContaminationForm] = useState(false);
  const [currentStageType, setCurrentStageType] = useState<string>("");
  const [activeTab, setActiveTab] = useState("active");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const { data: contaminationLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/contamination-logs"],
  });

  const extendedBatches = batches as (ProductionBatch & {
    currentStage?: string;
    contaminationCount?: number;
  })[];

  // Filter batches by stage
  const activeBatches = extendedBatches.filter(batch => 
    batch.currentStage && !["completed"].includes(batch.currentStage)
  );

  const completedBatches = extendedBatches.filter(batch => 
    batch.currentStage === "completed"
  );

  const contaminatedBatches = extendedBatches.filter(batch => 
    contaminationLogs.some((log: any) => log.batchId === batch.id)
  );

  const handleStageAction = (batch: ProductionBatch, nextStage: string) => {
    setSelectedBatch(batch);
    setCurrentStageType(nextStage);
    setShowStageForm(true);
  };

  const handleReportContamination = (batch: ProductionBatch) => {
    setSelectedBatch(batch);
    setShowContaminationForm(true);
  };

  const BatchRow = ({ batch, showStageActions = true }: { batch: any, showStageActions?: boolean }) => {
    const progress = getStageProgress(batch.currentStage || "batch_creation");
    const nextStage = getNextStageFromCurrent(batch.currentStage || "batch_creation");
    const hasContamination = contaminationLogs.some((log: any) => log.batchId === batch.id);

    return (
      <TableRow className={hasContamination ? "bg-red-50" : ""}>
        <TableCell className="font-medium">{batch.batchNumber}</TableCell>
        <TableCell>{batch.productType}</TableCell>
        <TableCell>{batch.substrateType}</TableCell>
        <TableCell>
          <div className="space-y-2">
            <Badge className={getStageColor(batch.currentStage || "batch_creation")}>
              {formatStageName(batch.currentStage || "batch_creation")}
            </Badge>
            <Progress value={progress} className="w-24 h-2" />
            <span className="text-xs text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
        </TableCell>
        <TableCell>{new Date(batch.startDate).toLocaleDateString()}</TableCell>
        <TableCell>
          {hasContamination && (
            <Badge variant="outline" className="bg-red-100 text-red-800 mr-2">
              ⚠️ Contaminated
            </Badge>
          )}
        </TableCell>
        {showStageActions && (
          <TableCell>
            <div className="flex space-x-2">
              {batch.currentStage !== "completed" && (
                <Button
                  size="sm"
                  onClick={() => handleStageAction(batch, nextStage)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {getNextStageAction(batch.currentStage || "batch_creation")}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReportContamination(batch)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Report Issue
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <div>
      <Header 
        title="🍄 Mushroom Production Workflow" 
        subtitle="Track batches through all 6 production stages with contamination monitoring"
      />
      
      <main className="p-6">
        {/* Quick Progress Trackers for Active Batches */}
        {activeBatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">🚀 One-Click Batch Progress Tracker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBatches.slice(0, 6).map((batch) => (
                <BatchProgressTracker
                  key={batch.id}
                  batch={batch}
                  onStageUpdate={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
                  }}
                />
              ))}
            </div>
            {activeBatches.length > 6 && (
              <p className="text-center text-gray-600 mt-4">
                Showing 6 of {activeBatches.length} active batches. View all in the Active Batches tab below.
              </p>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{activeBatches.length}</div>
              <p className="text-gray-600">Active Batches</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{completedBatches.length}</div>
              <p className="text-gray-600">Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{contaminatedBatches.length}</div>
              <p className="text-gray-600">With Issues</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{extendedBatches.length}</div>
              <p className="text-gray-600">Total Batches</p>
            </CardContent>
          </Card>
        </div>

        {/* Production Workflow Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Production Workflow Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">
                  Active Batches ({activeBatches.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedBatches.length})
                </TabsTrigger>
                <TabsTrigger value="issues">
                  Issues ({contaminatedBatches.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">🍄 Production Stages</h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                    <div className="text-center"><Badge variant="outline">1. Batch Created</Badge></div>
                    <div className="text-center"><Badge variant="outline">2. Inoculation</Badge></div>
                    <div className="text-center"><Badge variant="outline">3. Incubation</Badge></div>
                    <div className="text-center"><Badge variant="outline">4. Fruiting</Badge></div>
                    <div className="text-center"><Badge variant="outline">5. Harvesting</Badge></div>
                    <div className="text-center"><Badge variant="outline">6. Post-Harvest</Badge></div>
                  </div>
                </div>

                {activeBatches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active batches in production</p>
                    <p className="text-sm mt-1">Create a new batch to start the workflow</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Product Type</TableHead>
                        <TableHead>Substrate</TableHead>
                        <TableHead>Current Stage</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBatches.map((batch) => (
                        <BatchRow key={batch.id} batch={batch} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {completedBatches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No completed batches yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Product Type</TableHead>
                        <TableHead>Substrate</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedBatches.map((batch) => (
                        <BatchRow key={batch.id} batch={batch} showStageActions={false} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="issues" className="mt-6">
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">⚠️ Contamination & Issues</h4>
                  <p className="text-red-700 text-sm">
                    These batches have reported contamination or other issues requiring immediate attention.
                  </p>
                </div>

                {contaminatedBatches.length === 0 ? (
                  <div className="text-center py-8 text-green-500">
                    <p>No contamination issues reported</p>
                    <p className="text-sm mt-1">All batches are healthy and on track</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Product Type</TableHead>
                        <TableHead>Substrate</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Issues</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contaminatedBatches.map((batch) => (
                        <BatchRow key={batch.id} batch={batch} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Stage Form Dialog */}
      {selectedBatch && showStageForm && currentStageType && (
        <BatchStageForm
          open={showStageForm}
          onOpenChange={setShowStageForm}
          batch={selectedBatch}
          stage={currentStageType as any}
        />
      )}

      {/* Contamination Form Dialog */}
      {selectedBatch && showContaminationForm && (
        <ContaminationForm
          open={showContaminationForm}
          onOpenChange={setShowContaminationForm}
          batch={selectedBatch}
        />
      )}
    </div>
  );
}

function getNextStageFromCurrent(currentStage: string): string {
  switch (currentStage) {
    case "batch_creation": return "inoculation";
    case "inoculation": return "incubation";
    case "incubation": return "fruiting";
    case "fruiting": return "harvesting";
    case "harvesting": return "post_harvest";
    case "post_harvest": return "completed";
    default: return "inoculation";
  }
}

function formatStageName(stage: string): string {
  switch (stage) {
    case "batch_creation": return "Batch Created";
    case "inoculation": return "Inoculation";
    case "incubation": return "Incubation";
    case "fruiting": return "Fruiting";
    case "harvesting": return "Harvesting";
    case "post_harvest": return "Post-Harvest";
    case "completed": return "Completed";
    default: return stage;
  }
}