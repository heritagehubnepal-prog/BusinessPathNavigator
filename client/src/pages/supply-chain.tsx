import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Package, Recycle, ShoppingCart, Factory, Users, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SupplyChainQuickForm from "@/components/forms/supply-chain-quick-form";

const STAGE_FLOW = [
  { key: "farmer_delivery", name: "Farmer Delivery", icon: Truck, color: "bg-blue-500" },
  { key: "hub_processing", name: "Hub Processing", icon: Factory, color: "bg-yellow-500" },
  { key: "harvesting", name: "Harvesting", icon: Package, color: "bg-green-500" },
  { key: "packaging", name: "Packaging", icon: Package, color: "bg-purple-500" },
  { key: "substrate_collection", name: "Substrate Collection", icon: Recycle, color: "bg-orange-500" },
  { key: "mycelium_production", name: "Mycelium Production", icon: Factory, color: "bg-teal-500" },
  { key: "product_manufacturing", name: "Product Manufacturing", icon: Factory, color: "bg-indigo-500" },
  { key: "sales", name: "Final Sales", icon: ShoppingCart, color: "bg-green-600" },
  { key: "completed", name: "Zero Waste Complete", icon: TrendingUp, color: "bg-emerald-600" }
];

export default function SupplyChain() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStage, setSelectedStage] = useState("farmer_delivery");

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["/api/production-batches"],
  });

  const progressMutation = useMutation({
    mutationFn: async ({ batchId, stage }: { batchId: number; stage: string }) => {
      return apiRequest(`/api/production-batches/${batchId}/advance-stage`, {
        method: "POST",
        body: JSON.stringify({ targetStage: stage })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      toast({
        title: "Stage Advanced",
        description: "Batch successfully moved to next stage",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to advance stage",
        variant: "destructive",
      });
    },
  });

  const getStageIndex = (stage: string) => {
    return STAGE_FLOW.findIndex(s => s.key === stage);
  };

  const getProgressPercentage = (stage: string) => {
    const index = getStageIndex(stage);
    return ((index + 1) / STAGE_FLOW.length) * 100;
  };

  const getStagesByStatus = (targetStage: string) => {
    return batches.filter(batch => batch.currentStage === targetStage);
  };

  const calculateRevenue = (batch: any) => {
    const mushroomRevenue = batch.salesPrice || 0;
    const myceliumRevenue = batch.myceliumSalesPrice || 0;
    return parseFloat(mushroomRevenue) + parseFloat(myceliumRevenue);
  };

  const calculateZeroWasteMetric = () => {
    const completedBatches = batches.filter(b => b.currentStage === "completed");
    const zeroWasteBatches = completedBatches.filter(b => b.zeroWasteAchieved);
    return completedBatches.length > 0 ? (zeroWasteBatches.length / completedBatches.length) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <main className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mycopath Supply Chain Management
          </h1>
          <p className="text-gray-600">
            Farmer → Hub → Harvest → Package → Substrate → Mycelium → Products → Zero Waste
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {batches.filter(b => b.currentStage !== "completed").length}
              </div>
              <p className="text-gray-600">Active Supply Chain Items</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                NPR {batches.reduce((sum, batch) => sum + calculateRevenue(batch), 0).toFixed(0)}
              </div>
              <p className="text-gray-600">Total Revenue Generated</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">
                {batches.filter(b => b.myceliumUnitsProduced > 0).length}
              </div>
              <p className="text-gray-600">Mycelium Products Created</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-emerald-600">
                {calculateZeroWasteMetric().toFixed(1)}%
              </div>
              <p className="text-gray-600">Zero Waste Achievement</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Add Supply Chain Entry */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Quick Entry - New Farmer Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SupplyChainQuickForm />
          </CardContent>
        </Card>

        {/* Supply Chain Flow Visualization */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="h-5 w-5" />
              Supply Chain Flow Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batches.slice(0, 6).map((batch) => (
                <div key={batch.id} className="border rounded-lg p-4 bg-white/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{batch.batchNumber}</h3>
                      <p className="text-sm text-gray-600">
                        {batch.productType} • {batch.farmerName || "Unknown Farmer"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {STAGE_FLOW.find(s => s.key === batch.currentStage)?.name || batch.currentStage}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Supply Chain Progress</span>
                      <span>{getProgressPercentage(batch.currentStage).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(batch.currentStage)} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {batch.zeroWasteAchieved && (
                        <span className="text-green-600 font-medium">✓ Zero Waste Achieved</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        const currentIndex = getStageIndex(batch.currentStage);
                        if (currentIndex < STAGE_FLOW.length - 1) {
                          const nextStage = STAGE_FLOW[currentIndex + 1].key;
                          progressMutation.mutate({ batchId: batch.id, stage: nextStage });
                        }
                      }}
                      disabled={batch.currentStage === "completed" || progressMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {progressMutation.isPending ? "Processing..." : "Advance Stage"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stage Management Tabs */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Supply Chain Stage Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedStage} onValueChange={setSelectedStage}>
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
                {STAGE_FLOW.slice(0, 8).map((stage) => (
                  <TabsTrigger key={stage.key} value={stage.key} className="text-xs">
                    <stage.icon className="h-4 w-4 mr-1" />
                    {stage.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {STAGE_FLOW.map((stage) => (
                <TabsContent key={stage.key} value={stage.key}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">
                      {stage.name} ({getStagesByStatus(stage.key).length} items)
                    </h3>
                    
                    {getStagesByStatus(stage.key).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No items in {stage.name} stage
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getStagesByStatus(stage.key).map((batch) => (
                          <Card key={batch.id} className="border border-gray-200">
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{batch.batchNumber}</h4>
                              <p className="text-sm text-gray-600 mb-2">{batch.productType}</p>
                              
                              <div className="space-y-1 text-xs text-gray-500">
                                {batch.farmerName && (
                                  <p>Farmer: {batch.farmerName}</p>
                                )}
                                {batch.acceptedWeight && (
                                  <p>Weight: {batch.acceptedWeight}kg</p>
                                )}
                                {batch.salesPrice && (
                                  <p>Mushroom Revenue: NPR {batch.salesPrice}</p>
                                )}
                                {batch.myceliumSalesPrice && (
                                  <p>Mycelium Revenue: NPR {batch.myceliumSalesPrice}</p>
                                )}
                              </div>
                              
                              <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => {
                                  const currentIndex = getStageIndex(batch.currentStage);
                                  if (currentIndex < STAGE_FLOW.length - 1) {
                                    const nextStage = STAGE_FLOW[currentIndex + 1].key;
                                    progressMutation.mutate({ batchId: batch.id, stage: nextStage });
                                  }
                                }}
                                disabled={stage.key === "completed"}
                              >
                                {stage.key === "completed" ? "Complete" : "Advance to Next Stage"}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}