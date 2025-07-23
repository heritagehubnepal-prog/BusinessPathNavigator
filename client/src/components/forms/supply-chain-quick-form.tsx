import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Truck, CheckCircle } from "lucide-react";

const quickEntrySchema = z.object({
  farmerName: z.string().min(1, "Please enter farmer name"),
  farmerContact: z.string().optional(),
  productType: z.string().min(1, "Please select product type"),
  substrate: z.string().min(1, "Please select substrate type"),
  initialWeight: z.number().min(0, "Please enter initial weight"),
  farmerPaymentAmount: z.number().min(0, "Please enter payment amount"),
  notes: z.string().optional(),
});

type QuickEntryData = z.infer<typeof quickEntrySchema>;

export default function SupplyChainQuickForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<QuickEntryData>({
    resolver: zodResolver(quickEntrySchema),
    defaultValues: {
      initialWeight: 0,
      farmerPaymentAmount: 0,
    }
  });

  const createBatchMutation = useMutation({
    mutationFn: async (data: QuickEntryData) => {
      return apiRequest("/api/production-batches", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          deliveryDate: new Date().toISOString(),
          currentStage: "farmer_delivery",
          startDate: new Date().toISOString(),
          expectedHarvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
      });
    },
    onSuccess: (batch) => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      toast({
        title: "Supply Chain Entry Created",
        description: `Batch ${batch.batchNumber} created for farmer ${form.getValues("farmerName")}`,
      });
      form.reset();
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create supply chain entry",
        variant: "destructive",
      });
    },
  });

  if (!showForm) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">
          Streamlined farmer delivery entry with automatic batch number generation
        </p>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Truck className="h-4 w-4 mr-2" />
          Add New Farmer Delivery
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((data) => createBatchMutation.mutate(data))} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="farmerName">Farmer Name *</Label>
          <Input
            id="farmerName"
            {...form.register("farmerName")}
            placeholder="e.g., Ram Thapa"
          />
          {form.formState.errors.farmerName && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.farmerName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="productType">Product Type *</Label>
          <Select onValueChange={(value) => form.setValue("productType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Oyster Mushrooms">Oyster Mushrooms</SelectItem>
              <SelectItem value="Shiitake Mushrooms">Shiitake Mushrooms</SelectItem>
              <SelectItem value="Lion's Mane">Lion's Mane</SelectItem>
              <SelectItem value="Reishi">Reishi</SelectItem>
              <SelectItem value="Button Mushrooms">Button Mushrooms</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.productType && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.productType.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="substrate">Substrate *</Label>
          <Select onValueChange={(value) => form.setValue("substrate", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select substrate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rice Straw">Rice Straw</SelectItem>
              <SelectItem value="Wheat Straw">Wheat Straw</SelectItem>
              <SelectItem value="Sawdust">Sawdust</SelectItem>
              <SelectItem value="Cotton Waste">Cotton Waste</SelectItem>
              <SelectItem value="Mixed Substrate">Mixed Substrate</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.substrate && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.substrate.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="initialWeight">Weight (kg) *</Label>
          <Input
            id="initialWeight"
            type="number"
            step="0.1"
            {...form.register("initialWeight", { valueAsNumber: true })}
            placeholder="50.0"
          />
          {form.formState.errors.initialWeight && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.initialWeight.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="farmerContact">Farmer Contact</Label>
          <Input
            id="farmerContact"
            {...form.register("farmerContact")}
            placeholder="+977-9841234567"
          />
        </div>

        <div>
          <Label htmlFor="farmerPaymentAmount">Payment (NPR) *</Label>
          <Input
            id="farmerPaymentAmount"
            type="number"
            step="0.01"
            {...form.register("farmerPaymentAmount", { valueAsNumber: true })}
            placeholder="2500.00"
          />
          {form.formState.errors.farmerPaymentAmount && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.farmerPaymentAmount.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            {...form.register("notes")}
            placeholder="Quality notes..."
          />
        </div>
      </div>

      <div className="bg-green-50 p-3 rounded-lg">
        <p className="text-sm text-green-700">
          <CheckCircle className="h-4 w-4 inline mr-1" />
          Batch number will be auto-generated (MYC-{new Date().getFullYear()}-XXX)
        </p>
      </div>

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={createBatchMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {createBatchMutation.isPending ? "Creating..." : "Create Supply Chain Entry"}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}