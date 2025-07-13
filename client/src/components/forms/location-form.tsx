import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertLocationSchema, type Location, type InsertLocation } from "@shared/schema";

interface LocationFormProps {
  location?: Location | null;
  onSuccess: () => void;
}

const locationTypes = [
  { value: "farm", label: "Farm" },
  { value: "warehouse", label: "Warehouse" },
  { value: "processing", label: "Processing Center" },
  { value: "office", label: "Office" },
  { value: "retail", label: "Retail Store" },
];

export default function LocationForm({ location, onSuccess }: LocationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertLocation>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: location?.name || "",
      type: location?.type || "farm",
      address: location?.address || "",
      city: location?.city || "",
      state: location?.state || "",
      country: location?.country || "Nepal",
      postalCode: location?.postalCode || "",
      contactPerson: location?.contactPerson || "",
      phone: location?.phone || "",
      email: location?.email || "",
      capacity: location?.capacity || "",
      isActive: location?.isActive ?? true,
      establishedDate: location?.establishedDate 
        ? new Date(location.establishedDate).toISOString().split('T')[0] 
        : "",
      notes: location?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertLocation) => {
      const processedData = {
        ...data,
        establishedDate: data.establishedDate ? new Date(data.establishedDate) : null,
      };
      await apiRequest("POST", "/api/locations", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Success",
        description: "Location created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create location",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertLocation) => {
      const processedData = {
        ...data,
        establishedDate: data.establishedDate ? new Date(data.establishedDate) : null,
      };
      await apiRequest("PATCH", `/api/locations/${location!.id}`, processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertLocation) => {
    if (location) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold gradient-text">Basic Information</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Main Farm - Kathmandu"
                      {...field} 
                      className="glass-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 500 kg/month"
                      {...field} 
                      className="glass-input"
                    />
                  </FormControl>
                  <FormDescription>
                    Production capacity or storage capacity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="establishedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Established Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field} 
                      className="glass-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-morphism">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Active Location
                    </FormLabel>
                    <FormDescription>
                      Enable this location for operations
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Address & Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold gradient-text">Address & Contact</h3>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Kathmandu Valley Production Site"
                      {...field} 
                      className="glass-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Kathmandu"
                        {...field} 
                        className="glass-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bagmati Province"
                        {...field} 
                        className="glass-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nepal"
                        {...field} 
                        className="glass-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="44600"
                        {...field} 
                        className="glass-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Akash Rai"
                      {...field} 
                      className="glass-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+977-1-234567"
                        {...field} 
                        className="glass-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="location@mycopath.com"
                        {...field} 
                        className="glass-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about this location..."
                  rows={3}
                  {...field} 
                  className="glass-input"
                />
              </FormControl>
              <FormDescription>
                Any additional details about this location's purpose, equipment, or special considerations
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="btn-modern"
          >
            {isLoading ? "Saving..." : location ? "Update Location" : "Create Location"}
          </Button>
        </div>
      </form>
    </Form>
  );
}