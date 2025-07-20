import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProductionBatchSchema } from "@shared/schema";

const formSchema = insertProductionBatchSchema.extend({
  startDate: z.string(),
  expectedHarvestDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BatchForm({ open, onOpenChange }: BatchFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchNumber: "",
      productType: "",
      substrate: "",
      startDate: new Date().toISOString().split('T')[0],
      status: "inoculation",
      notes: "",
      initialWeight: undefined,
      expectedHarvestDate: "",
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Form data being sent:", data);
      
      // Send raw data - let the backend handle conversion
      const payload = {
        batchNumber: data.batchNumber,
        productType: data.productType,
        substrate: data.substrate,
        startDate: data.startDate,
        expectedHarvestDate: data.expectedHarvestDate || null,
        status: data.status || "inoculation",
        initialWeight: data.initialWeight || null,
        notes: data.notes || null,
      };
      console.log("API payload:", payload);
      
      const response = await apiRequest("POST", "/api/production-batches", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({
        title: "Success",
        description: "Production batch created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Batch creation error:", error);
      let errorMessage = "Failed to create production batch";
      
      if (error.message.includes("Validation failed")) {
        // Extract the validation error details
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

  const onSubmit = (data: FormData) => {
    createBatchMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Production Batch</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="batchNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BATCH-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Oyster Mushroom">Oyster Mushroom</SelectItem>
                      <SelectItem value="Shiitake Mushroom">Shiitake Mushroom</SelectItem>
                      <SelectItem value="Mycelium Packaging">Mycelium Packaging</SelectItem>
                      <SelectItem value="Mushroom Powder">Mushroom Powder</SelectItem>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select substrate" />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedHarvestDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Harvest Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="initialWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Weight (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes about this batch..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createBatchMutation.isPending}
              >
                {createBatchMutation.isPending ? "Creating..." : "Create Batch"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
