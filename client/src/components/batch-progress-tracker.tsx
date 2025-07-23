import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
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

const getQuickProgressDefaults = (stage: string, user: any) => {
  const today = new Date().toISOString().split('T')[0];
  
  switch (stage) {
    case "inoculation":
      return {
        inoculationDate: today,
        spawnAddedBy: user?.employeeId || "",
        spawnQuantityGrams: 500,
        spawnSupplier: "Local Supplier",
        currentStage: "incubation",
      };
    case "incubation":
      return {
        incubationStartDate: today,
        incubationRoomTemp: 25,
        incubationRoomHumidity: 85,
        currentStage: "fruiting",
      };
    case "fruiting":
      return {
        fruitingStartDate: today,
        fruitingRoomTemp: 18,
        fruitingRoomHumidity: 90,
        lightExposure: "LED 12 hours/day",
        currentStage: "harvesting",
      };
    case "harvesting":
      return {
        harvestDate: today,
        harvestedWeightKg: 2.5,
        damagedWeightKg: 0.1,
        harvestedBy: user?.employeeId || "",
        currentStage: "post_harvest",
      };
    case "post_harvest":
      return {
        postHarvestDate: today,
        substrateCollectedKg: 1.8,
        substrateCondition: "good",
        myceliumReuseStatus: true,
        currentStage: "completed",
      };
    default:
      return {};
  }
};

const formatStageName = (stage: string): string => {
  switch (stage) {
    case "batch_creation": return "Batch Created";
    case "inoculation": return "Inoculation";
    case "incubation": return "Incubation";
    case "fruiting": return "Fruiting";
    case "harvesting": return "Harvesting";
    case "post_harvest": return "Post-Harvest";
    case "completed": return "Complete";
    default: return stage;
  }
};

const getNextStage = (currentStage: string): string => {
  switch (currentStage) {
    case "batch_creation": return "inoculation";
    case "inoculation": return "incubation";
    case "incubation": return "fruiting";
    case "fruiting": return "harvesting";
    case "harvesting": return "post_harvest";
    case "post_harvest": return "completed";
    default: return "completed";
  }
};

interface BatchProgressTrackerProps {
  batch: ProductionBatch & { currentStage?: string };
  onStageUpdate?: () => void;
}

export default function BatchProgressTracker({ batch, onStageUpdate }: BatchProgressTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStage = batch.currentStage || "batch_creation";
  const progress = getStageProgress(currentStage);
  const nextStage = getNextStage(currentStage);
  const isCompleted = currentStage === "completed";

  const quickProgressMutation = useMutation({
    mutationFn: async () => {
      setIsUpdating(true);
      const defaultData = getQuickProgressDefaults(nextStage, user);
      
      console.log(`Quick progressing batch ${batch.id} to ${nextStage}:`, defaultData);
      const response = await apiRequest("PATCH", `/api/production-batches/${batch.id}`, defaultData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Stage Updated",
        description: `Batch ${batch.batchNumber} advanced to ${formatStageName(nextStage)}`,
      });
      onStageUpdate?.();
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Quick progress error:", error);
      toast({
        title: "Error",
        description: "Failed to advance batch stage",
        variant: "destructive",
      });
      setIsUpdating(false);
    },
  });

  const handleQuickProgress = () => {
    if (isCompleted) return;
    quickProgressMutation.mutate();
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            🍄 {batch.batchNumber}
            <Badge className={getStageColor(currentStage)}>
              {formatStageName(currentStage)}
            </Badge>
          </span>
          <span className="text-sm font-normal text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>Created</span>
            <span>Inoculation</span>
            <span>Incubation</span>
            <span>Fruiting</span>
            <span>Harvest</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Batch Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Product:</span> {batch.productType}
          </div>
          <div>
            <span className="font-medium">Substrate:</span> {batch.substrateType}
          </div>
          <div>
            <span className="font-medium">Started:</span> {new Date(batch.startDate).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Stage:</span> {formatStageName(currentStage)}
          </div>
        </div>

        {/* Quick Progress Button */}
        {!isCompleted && (
          <div className="pt-2 border-t border-green-200">
            <Button
              onClick={handleQuickProgress}
              disabled={isUpdating || quickProgressMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              {isUpdating || quickProgressMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Advancing...
                </span>
              ) : (
                `🚀 Quick Progress to ${formatStageName(nextStage)}`
              )}
            </Button>
            <p className="text-xs text-gray-600 mt-1 text-center">
              Uses standard values for quick progression
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="pt-2 border-t border-green-200 text-center">
            <Badge className="bg-emerald-100 text-emerald-800">
              ✅ Batch Complete
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}