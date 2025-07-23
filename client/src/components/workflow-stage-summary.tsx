import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ProductionBatch } from "@shared/schema";

interface WorkflowStageSummaryProps {
  batch: ProductionBatch & { currentStage?: string };
  onEditStage: (stage: string) => void;
}

export default function WorkflowStageSummary({ batch, onEditStage }: WorkflowStageSummaryProps) {
  const currentStage = batch.currentStage || "batch_creation";

  const getStageStatus = (stage: string) => {
    const stageOrder = ["batch_creation", "inoculation", "incubation", "fruiting", "harvesting", "post_harvest"];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stageIndex = stageOrder.indexOf(stage);
    
    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "current";
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "current": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const stages = [
    {
      key: "batch_creation",
      name: "Batch Created",
      data: [
        { label: "Batch Number", value: batch.batchNumber },
        { label: "Product Type", value: batch.productType },
        { label: "Substrate Type", value: batch.substrateType },
        { label: "Start Date", value: batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "N/A" },
      ]
    },
    {
      key: "inoculation",
      name: "Inoculation",
      data: [
        { label: "Inoculation Date", value: batch.inoculationDate ? new Date(batch.inoculationDate).toLocaleDateString() : "Not started" },
        { label: "Spawn Quantity", value: batch.spawnQuantityGrams ? `${batch.spawnQuantityGrams}g` : "Not set" },
        { label: "Spawn Supplier", value: batch.spawnSupplier || "Not set" },
        { label: "Added By", value: batch.spawnAddedBy || "Not set" },
      ]
    },
    {
      key: "incubation",
      name: "Incubation",
      data: [
        { label: "Start Date", value: batch.incubationStartDate ? new Date(batch.incubationStartDate).toLocaleDateString() : "Not started" },
        { label: "Temperature", value: batch.incubationRoomTemp ? `${batch.incubationRoomTemp}°C` : "Not set" },
        { label: "Humidity", value: batch.incubationRoomHumidity ? `${batch.incubationRoomHumidity}%` : "Not set" },
      ]
    },
    {
      key: "fruiting",
      name: "Fruiting",
      data: [
        { label: "Start Date", value: batch.fruitingStartDate ? new Date(batch.fruitingStartDate).toLocaleDateString() : "Not started" },
        { label: "Temperature", value: batch.fruitingRoomTemp ? `${batch.fruitingRoomTemp}°C` : "Not set" },
        { label: "Humidity", value: batch.fruitingRoomHumidity ? `${batch.fruitingRoomHumidity}%` : "Not set" },
        { label: "Light Exposure", value: batch.lightExposure || "Not set" },
      ]
    },
    {
      key: "harvesting",
      name: "Harvesting",
      data: [
        { label: "Harvest Date", value: batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString() : "Not harvested" },
        { label: "Harvested Weight", value: batch.harvestedWeightKg ? `${batch.harvestedWeightKg}kg` : "Not recorded" },
        { label: "Damaged Weight", value: batch.damagedWeightKg ? `${batch.damagedWeightKg}kg` : "Not recorded" },
        { label: "Harvested By", value: batch.harvestedBy || "Not set" },
      ]
    },
    {
      key: "post_harvest",
      name: "Post-Harvest",
      data: [
        { label: "Date", value: batch.postHarvestDate ? new Date(batch.postHarvestDate).toLocaleDateString() : "Not completed" },
        { label: "Substrate Collected", value: batch.substrateCollectedKg ? `${batch.substrateCollectedKg}kg` : "Not recorded" },
        { label: "Substrate Condition", value: batch.substrateCondition || "Not assessed" },
        { label: "Mycelium Reusable", value: batch.myceliumReuseStatus ? "Yes" : "No" },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Complete Workflow Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stage) => {
          const status = getStageStatus(stage.key);
          return (
            <Card key={stage.key} className={`border-l-4 ${
              status === "completed" ? "border-l-green-500" : 
              status === "current" ? "border-l-blue-500" : "border-l-gray-300"
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{stage.name}</CardTitle>
                  <Badge className={getStatusColor(status)}>
                    {status === "completed" ? "✓" : status === "current" ? "→" : "⏳"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {stage.data.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-medium text-right max-w-[60%] truncate">{item.value}</span>
                  </div>
                ))}
                {status === "current" && (
                  <>
                    <Separator className="my-2" />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs"
                      onClick={() => onEditStage(stage.key)}
                    >
                      Edit {stage.name}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}