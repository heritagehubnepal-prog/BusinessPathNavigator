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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { ProductionBatch } from "@shared/schema";

const stageSchemas = {
  inoculation: z.object({
    inoculationDate: z.string().min(1, "Please select inoculation date"),
    spawnAddedBy: z.string().min(1, "Please enter who added the spawn"),
    spawnQuantityGrams: z.string().min(1, "Please enter spawn quantity in grams"),
    spawnSupplier: z.string().min(1, "Please enter spawn supplier"),
    inoculationNotes: z.string().optional(),
    currentStage: z.literal("incubation"),
  }),
  
  incubation: z.object({
    incubationStartDate: z.string().min(1, "Please select incubation start date"),
    incubationRoomTemp: z.string().min(1, "Please enter room temperature (°C)"),
    incubationRoomHumidity: z.string().min(1, "Please enter room humidity (%)"),
    incubationNotes: z.string().optional(),
    currentStage: z.literal("fruiting"),
  }),
  
  fruiting: z.object({
    fruitingStartDate: z.string().min(1, "Please select fruiting start date"),
    fruitingRoomTemp: z.string().min(1, "Please enter fruiting room temperature (°C)"),
    fruitingRoomHumidity: z.string().min(1, "Please enter fruiting room humidity (%)"),
    lightExposure: z.string().min(1, "Please enter light exposure details"),
    fruitingNotes: z.string().optional(),
    currentStage: z.literal("harvesting"),
  }),
  
  harvesting: z.object({
    harvestDate: z.string().min(1, "Please select harvest date"),
    harvestedWeightKg: z.string().min(1, "Please enter harvested weight in kg"),
    damagedWeightKg: z.string().optional(),
    harvestedBy: z.string().min(1, "Please enter who harvested"),
    harvestNotes: z.string().optional(),
    currentStage: z.literal("post_harvest"),
  }),
  
  post_harvest: z.object({
    postHarvestDate: z.string().min(1, "Please select post-harvest date"),
    substrateCollectedKg: z.string().min(1, "Please enter substrate collected in kg"),
    substrateCondition: z.string().min(1, "Please select substrate condition"),
    myceliumReuseStatus: z.boolean(),
    postHarvestNotes: z.string().optional(),
    currentStage: z.literal("completed"),
  }),
};

interface BatchStageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductionBatch | null;
  stage: keyof typeof stageSchemas;
}

export default function BatchStageForm({ open, onOpenChange, batch, stage }: BatchStageFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const schema = stageSchemas[stage];
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(batch, stage),
  });

  const updateStageMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!batch) throw new Error("No batch to update");
      
      const payload = transformFormData(data, stage);
      
      console.log(`Updating ${stage} stage with payload:`, payload);
      const response = await apiRequest("PATCH", `/api/production-batches/${batch.id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: `${getStageTitle(stage)} completed successfully`,
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(`${stage} update error:`, error);
      toast({
        title: "Error",
        description: `Failed to complete ${stage} stage`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateStageMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStageTitle(stage)} - {batch?.batchNumber}
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Stage {getStageNumber(stage)} of 6
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderStageFields(stage, form)}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateStageMutation.isPending}>
                {updateStageMutation.isPending ? "Updating..." : `Complete ${getStageTitle(stage)}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(batch: ProductionBatch | null, stage: keyof typeof stageSchemas) {
  const baseDefaults = {
    currentStage: getNextStage(stage),
  };
  
  if (!batch) return baseDefaults;
  
  switch (stage) {
    case "inoculation":
      return {
        ...baseDefaults,
        spawnAddedBy: "",
        spawnQuantityGrams: "",
        spawnSupplier: "",
        inoculationDate: "",
        inoculationNotes: "",
      };
    case "incubation":
      return {
        ...baseDefaults,
        incubationStartDate: "",
        incubationRoomTemp: "25",
        incubationRoomHumidity: "85",
        incubationNotes: "",
      };
    case "fruiting":
      return {
        ...baseDefaults,
        fruitingStartDate: "",
        fruitingRoomTemp: "18",
        fruitingRoomHumidity: "90",
        lightExposure: "LED 12 hours/day",
        fruitingNotes: "",
      };
    case "harvesting":
      return {
        ...baseDefaults,
        harvestDate: "",
        harvestedWeightKg: "",
        damagedWeightKg: "0",
        harvestedBy: user?.employeeId || "",
        harvestNotes: "",
      };
    case "post_harvest":
      return {
        ...baseDefaults,
        postHarvestDate: "",
        substrateCollectedKg: "",
        substrateCondition: "dry",
        myceliumReuseStatus: false,
        postHarvestNotes: "",
      };
    default:
      return baseDefaults;
  }
}

function transformFormData(data: any, stage: keyof typeof stageSchemas) {
  const transformed = { ...data };
  
  // Convert string numbers to actual numbers
  const numberFields = [
    'spawnQuantityGrams', 'incubationRoomTemp', 'incubationRoomHumidity',
    'fruitingRoomTemp', 'fruitingRoomHumidity', 'harvestedWeightKg', 
    'damagedWeightKg', 'substrateCollectedKg'
  ];
  
  numberFields.forEach(field => {
    if (transformed[field] && transformed[field] !== "") {
      transformed[field] = parseFloat(transformed[field]);
    } else if (transformed[field] === "") {
      transformed[field] = null;
    }
  });
  
  return transformed;
}

function renderStageFields(stage: keyof typeof stageSchemas, form: any) {
  switch (stage) {
    case "inoculation":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="inoculationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inoculation Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spawnAddedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spawn Added By</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Employee ID or Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="spawnQuantityGrams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spawn Quantity (grams)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spawnSupplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spawn Supplier</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Supplier name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="inoculationNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
      
    case "incubation":
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="incubationStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incubation Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="incubationRoomTemp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Temperature (°C)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="incubationRoomHumidity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Humidity (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="incubationNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
      
    // Similar patterns for other stages...
    default:
      return <div>Form fields for {stage}</div>;
  }
}

function getStageTitle(stage: keyof typeof stageSchemas) {
  const titles = {
    inoculation: "Inoculation",
    incubation: "Incubation",
    fruiting: "Fruiting",
    harvesting: "Harvesting", 
    post_harvest: "Post-Harvest",
  };
  return titles[stage];
}

function getStageNumber(stage: keyof typeof stageSchemas) {
  const numbers = {
    inoculation: 2,
    incubation: 3,
    fruiting: 4,
    harvesting: 5,
    post_harvest: 6,
  };
  return numbers[stage];
}

function getNextStage(stage: keyof typeof stageSchemas) {
  const nextStages = {
    inoculation: "incubation",
    incubation: "fruiting", 
    fruiting: "harvesting",
    harvesting: "post_harvest",
    post_harvest: "completed",
  };
  return nextStages[stage];
}