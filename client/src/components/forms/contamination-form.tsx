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

const contaminationFormSchema = z.object({
  contaminationReportedDate: z.string().min(1, "Please select contamination reported date"),
  contaminationType: z.string().min(1, "Please select contamination type"),
  contaminatedBagsCount: z.string().min(1, "Please enter number of contaminated bags"),
  contaminationSeverity: z.string().min(1, "Please select contamination severity"),
  correctiveActionTaken: z.string().min(1, "Please describe corrective action taken"),
  workerNotes: z.string().optional(),
});

type ContaminationFormData = z.infer<typeof contaminationFormSchema>;

interface ContaminationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductionBatch | null;
}

export default function ContaminationForm({ open, onOpenChange, batch }: ContaminationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const form = useForm<ContaminationFormData>({
    resolver: zodResolver(contaminationFormSchema),
    defaultValues: {
      contaminationReportedDate: new Date().toISOString().split('T')[0],
      contaminationType: "",
      contaminatedBagsCount: "",
      contaminationSeverity: "",
      correctiveActionTaken: "",
      workerNotes: "",
    },
  });

  const reportContaminationMutation = useMutation({
    mutationFn: async (data: ContaminationFormData) => {
      if (!batch) throw new Error("No batch selected");
      
      const payload = {
        batchId: batch.id,
        contaminationReportedDate: data.contaminationReportedDate,
        contaminationType: data.contaminationType,
        contaminatedBagsCount: parseInt(data.contaminatedBagsCount),
        contaminationSeverity: data.contaminationSeverity,
        correctiveActionTaken: data.correctiveActionTaken,
        workerNotes: data.workerNotes || null,
        reportedBy: user?.employeeId || "Unknown",
      };

      console.log("Reporting contamination with payload:", payload);
      const response = await apiRequest("POST", "/api/contamination-logs", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contamination-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Contamination Reported",
        description: "Contamination log has been created and flagged for management review",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Contamination reporting error:", error);
      toast({
        title: "Error",
        description: "Failed to report contamination",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContaminationFormData) => {
    reportContaminationMutation.mutate(data);
  };

  const contaminationTypes = [
    "Green Mold (Trichoderma)",
    "Yellow Mold", 
    "Black Mold",
    "Bacteria Contamination",
    "Yeast Contamination",
    "Cobweb Mold",
    "Pin Mold",
    "Other"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🚨 Report Contamination - {batch?.batchNumber}
            <Badge variant="outline" className="bg-red-100 text-red-800">
              High Priority
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-red-800 mb-2">⚠️ Contamination Alert</h4>
          <p className="text-red-700 text-sm">
            This report will immediately flag the batch for management review and risk assessment. 
            Provide accurate details for proper corrective action.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contaminationReportedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contamination Reported Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contaminatedBagsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Contaminated Bags</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contaminationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contamination Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contamination type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contaminationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contaminationSeverity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contamination Severity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low - Isolated spots</SelectItem>
                        <SelectItem value="Medium">Medium - Multiple areas</SelectItem>
                        <SelectItem value="High">High - Widespread</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="correctiveActionTaken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corrective Action Taken</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe the immediate actions taken (e.g., isolated contaminated bags, increased ventilation, etc.)"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workerNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any additional observations, suspected causes, or recommendations"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={reportContaminationMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {reportContaminationMutation.isPending ? "Reporting..." : "Report Contamination"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}