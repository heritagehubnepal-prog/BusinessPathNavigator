import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Factory, Package, Recycle } from "lucide-react";

const supplyChainSchema = z.object({
  batchNumber: z.string().min(1, "Please enter a batch number"),
  farmerName: z.string().min(1, "Please enter farmer name"),
  farmerContact: z.string().optional(),
  productType: z.string().min(1, "Please select product type"),
  substrate: z.string().min(1, "Please select substrate type"),
  initialWeight: z.number().min(0, "Please enter initial weight"),
  deliveryDate: z.string().min(1, "Please select delivery date"),
  farmerPaymentAmount: z.number().min(0, "Please enter payment amount"),
  notes: z.string().optional(),
});

type SupplyChainFormData = z.infer<typeof supplyChainSchema>;

interface SupplyChainFormProps {
  onSubmit: (data: SupplyChainFormData) => void;
  isLoading?: boolean;
}

export default function SupplyChainForm({ onSubmit, isLoading }: SupplyChainFormProps) {
  const form = useForm<SupplyChainFormData>({
    resolver: zodResolver(supplyChainSchema),
    defaultValues: {
      deliveryDate: new Date().toISOString().split('T')[0],
      farmerPaymentAmount: 0,
      initialWeight: 0,
    }
  });

  const handleSubmit = (data: SupplyChainFormData) => {
    onSubmit({
      ...data,
      currentStage: "farmer_delivery"
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          New Supply Chain Entry - Farmer Delivery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Batch Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Batch Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  {...form.register("batchNumber")}
                  placeholder="e.g., MYC-2025-001"
                />
                {form.formState.errors.batchNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.batchNumber.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="productType">Product Type *</Label>
                <Select onValueChange={(value) => form.setValue("productType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mushroom type" />
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
            </div>

            <div>
              <Label htmlFor="substrate">Substrate Type *</Label>
              <Select onValueChange={(value) => form.setValue("substrate", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select substrate type" />
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
          </div>

          {/* Farmer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Farmer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="farmerName">Farmer Name *</Label>
                <Input
                  id="farmerName"
                  {...form.register("farmerName")}
                  placeholder="e.g., Ram Bahadur Thapa"
                />
                {form.formState.errors.farmerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.farmerName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="farmerContact">Farmer Contact</Label>
                <Input
                  id="farmerContact"
                  {...form.register("farmerContact")}
                  placeholder="e.g., +977-9841234567"
                />
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delivery Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="deliveryDate">Delivery Date *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  {...form.register("deliveryDate")}
                />
                {form.formState.errors.deliveryDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.deliveryDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="initialWeight">Initial Weight (kg) *</Label>
                <Input
                  id="initialWeight"
                  type="number"
                  step="0.1"
                  {...form.register("initialWeight", { valueAsNumber: true })}
                  placeholder="e.g., 50.5"
                />
                {form.formState.errors.initialWeight && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.initialWeight.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="farmerPaymentAmount">Payment Amount (NPR) *</Label>
                <Input
                  id="farmerPaymentAmount"
                  type="number"
                  step="0.01"
                  {...form.register("farmerPaymentAmount", { valueAsNumber: true })}
                  placeholder="e.g., 2500.00"
                />
                {form.formState.errors.farmerPaymentAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.farmerPaymentAmount.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Any additional information about the delivery..."
              rows={3}
            />
          </div>

          {/* Supply Chain Preview */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Recycle className="h-4 w-4" />
              Supply Chain Journey Preview
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. 🚚 Farmer Delivery → Hub Processing</p>
              <p>2. 🏭 Quality Check → Harvesting</p>
              <p>3. 📦 Packaging → Customer Sales</p>
              <p>4. ♻️ Substrate Collection → Mycelium Production</p>
              <p>5. 🏭 Product Manufacturing → Zero Waste Achievement</p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Creating Supply Chain Entry..." : "Start Supply Chain Journey"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}