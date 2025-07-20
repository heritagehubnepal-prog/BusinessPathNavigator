import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import type { ProductionBatch } from "@shared/schema";

// Extended schema for editing with management controls
const editFormSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  productType: z.string().min(1, "Product type is required"),
  substrate: z.string().min(1, "Substrate is required"),
  startDate: z.string(),
  expectedHarvestDate: z.string().optional(),
  status: z.string(),
  initialWeight: z.string().optional(),
  harvestedWeight: z.string().optional(),
  contaminationRate: z.string().optional(),
  notes: z.string().optional(),
  // Management fields
  requiresApproval: z.boolean().optional(),
  riskLevel: z.enum(["low", "medium", "high"]).optional(),
  qualityCheckStatus: z.enum(["pending", "passed", "failed"]).optional(),
});

type EditFormData = z.infer<typeof editFormSchema>;

interface BatchEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductionBatch | null;
  userRole?: string;
}

export default function BatchEditForm({ open, onOpenChange, batch, userRole = "worker" }: BatchEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      batchNumber: batch?.batchNumber || "",
      productType: batch?.productType || "",
      substrate: batch?.substrate || "",
      startDate: batch?.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "",
      expectedHarvestDate: batch?.expectedHarvestDate ? new Date(batch.expectedHarvestDate).toISOString().split('T')[0] : "",
      status: batch?.status || "inoculation",
      initialWeight: batch?.initialWeight?.toString() || "",
      harvestedWeight: batch?.harvestedWeight?.toString() || "",
      contaminationRate: batch?.contaminationRate?.toString() || "",
      notes: batch?.notes || "",
      requiresApproval: (batch as any)?.requiresApproval || false,
      riskLevel: (batch as any)?.riskLevel || "low",
      qualityCheckStatus: (batch as any)?.qualityCheckStatus || "pending",
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      if (!batch) throw new Error("No batch to update");
      
      // Determine if changes require management approval
      const hasSignificantChanges = (
        data.status !== batch.status ||
        parseFloat(data.harvestedWeight || "0") > 0 ||
        parseFloat(data.contaminationRate || "0") > 5 // High contamination rate
      );

      const payload = {
        batchNumber: data.batchNumber,
        productType: data.productType,
        substrate: data.substrate,
        startDate: data.startDate,
        expectedHarvestDate: data.expectedHarvestDate || null,
        status: data.status,
        initialWeight: data.initialWeight ? parseFloat(data.initialWeight) : null,
        harvestedWeight: data.harvestedWeight ? parseFloat(data.harvestedWeight) : null,
        contaminationRate: data.contaminationRate ? parseFloat(data.contaminationRate) : null,
        notes: data.notes || null,
        // Risk management controls
        requiresApproval: userRole === "worker" ? hasSignificantChanges : data.requiresApproval,
        riskLevel: parseFloat(data.contaminationRate || "0") > 10 ? "high" : 
                  parseFloat(data.contaminationRate || "0") > 5 ? "medium" : "low",
        qualityCheckStatus: userRole === "manager" ? data.qualityCheckStatus : "pending",
      };

      console.log("Updating batch with payload:", payload);
      const response = await apiRequest("PATCH", `/api/production-batches/${batch.id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      const approvalMessage = userRole === "worker" && 
        (form.getValues("status") !== batch?.status || 
         parseFloat(form.getValues("harvestedWeight") || "0") > 0) 
        ? " Changes require management approval." : "";
      
      toast({
        title: "Success",
        description: `Production batch updated successfully.${approvalMessage}`,
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Batch update error:", error);
      let errorMessage = "Failed to update production batch";
      
      if (error.message.includes("Validation failed")) {
        const match = error.message.match(/Validation failed: (.+)/);
        if (match) {
          errorMessage = match[1];
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditFormData) => {
    updateBatchMutation.mutate(data);
  };

  const isManager = userRole === "manager" || userRole === "admin";
  const isReadOnly = (batch as any)?.isApproved && userRole === "worker";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Production Batch: {batch?.batchNumber}
            {(batch as any)?.requiresApproval && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Pending Approval
              </Badge>
            )}
            {(batch as any)?.isApproved && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Approved
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="inoculation">Inoculation</SelectItem>
                        <SelectItem value="growing">Growing</SelectItem>
                        <SelectItem value="ready">Ready for Harvest</SelectItem>
                        <SelectItem value="harvested">Harvested</SelectItem>
                        <SelectItem value="contaminated">Contaminated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Oyster Mushroom">Oyster Mushroom</SelectItem>
                        <SelectItem value="Shiitake Mushroom">Shiitake Mushroom</SelectItem>
                        <SelectItem value="Lion's Mane">Lion's Mane</SelectItem>
                        <SelectItem value="Mycelium Packaging">Mycelium Packaging</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="substrate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Substrate</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rice Straw">Rice Straw</SelectItem>
                        <SelectItem value="Sawdust">Sawdust</SelectItem>
                        <SelectItem value="Cotton Waste">Cotton Waste</SelectItem>
                        <SelectItem value="Mixed Substrate">Mixed Substrate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="initialWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="harvestedWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harvested Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contaminationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contamination Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" max="100" {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Management Controls - Only visible to managers */}
            {isManager && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-gray-900">Management Controls</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="riskLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low Risk</SelectItem>
                            <SelectItem value="medium">Medium Risk</SelectItem>
                            <SelectItem value="high">High Risk</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualityCheckStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality Check Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending Review</SelectItem>
                            <SelectItem value="passed">Quality Passed</SelectItem>
                            <SelectItem value="failed">Quality Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={updateBatchMutation.isPending}>
                  {updateBatchMutation.isPending ? "Updating..." : "Update Batch"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}