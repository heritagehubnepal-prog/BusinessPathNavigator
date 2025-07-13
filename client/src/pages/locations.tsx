import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Building, Warehouse, Settings, Phone, Mail, Calendar, Trash2, Edit } from "lucide-react";
import LocationForm from "@/components/forms/location-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Location } from "@shared/schema";

const getLocationTypeIcon = (type: string) => {
  switch (type) {
    case "farm":
      return <MapPin className="w-5 h-5 text-green-600" />;
    case "warehouse":
      return <Warehouse className="w-5 h-5 text-blue-600" />;
    case "processing":
      return <Settings className="w-5 h-5 text-purple-600" />;
    case "office":
      return <Building className="w-5 h-5 text-gray-600" />;
    case "retail":
      return <Building className="w-5 h-5 text-orange-600" />;
    default:
      return <Building className="w-5 h-5 text-gray-400" />;
  }
};

const getLocationTypeColor = (type: string) => {
  switch (type) {
    case "farm":
      return "bg-green-100 text-green-800 border-green-200";
    case "warehouse":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "processing":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "office":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "retail":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export default function Locations() {
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowLocationForm(true);
  };

  const handleCloseForm = () => {
    setShowLocationForm(false);
    setEditingLocation(null);
  };

  const activeLocations = locations.filter(loc => loc.isActive);
  const inactiveLocations = locations.filter(loc => !loc.isActive);

  if (isLoading) {
    return (
      <div>
        <Header 
          title="Locations" 
          subtitle="Manage your multi-location operations across Nepal"
        />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading locations...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="🏢 Multi-Location Management" 
        subtitle="Manage farms, warehouses, processing centers, and retail locations across Nepal"
        actionLabel="+ Add Location"
        onAction={() => setShowLocationForm(true)}
      />
      
      <main className="p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card card-hover p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Total Locations</p>
                <p className="text-2xl font-bold text-slate">{locations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card card-hover p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Active Sites</p>
                <p className="text-2xl font-bold text-slate">{activeLocations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card card-hover p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Processing Centers</p>
                <p className="text-2xl font-bold text-slate">
                  {locations.filter(loc => loc.type === 'processing').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card card-hover p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Farm Sites</p>
                <p className="text-2xl font-bold text-slate">
                  {locations.filter(loc => loc.type === 'farm').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Locations Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate">🟢 Active Locations</h3>
          
          {activeLocations.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Locations</h3>
              <p className="text-gray-500 mb-4">Add your first location to start managing multi-site operations</p>
              <Button onClick={() => setShowLocationForm(true)} className="btn-modern">
                <MapPin className="w-4 h-4 mr-2" />
                Add First Location
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeLocations.map((location) => (
                <div key={location.id} className="glass-card card-hover p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full bg-green-400 pulse-green`}></div>
                  </div>
                  
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-white border-2 border-gray-100">
                      {getLocationTypeIcon(location.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg gradient-text">{location.name}</h4>
                      <Badge className={`${getLocationTypeColor(location.type)} text-xs font-medium`}>
                        {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {location.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{location.address}</span>
                      </div>
                    )}
                    
                    {location.city && location.state && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{location.city}, {location.state}</span>
                      </div>
                    )}
                    
                    {location.contactPerson && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{location.contactPerson}</span>
                      </div>
                    )}
                    
                    {location.capacity && (
                      <div className="glass-morphism p-3 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Capacity</p>
                        <p className="font-semibold text-slate">{location.capacity}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(location)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteLocationMutation.mutate(location.id)}
                      variant="outline"
                      size="sm"
                      disabled={deleteLocationMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full opacity-20"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Locations */}
        {inactiveLocations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-600">🔴 Inactive Locations</h3>
            <div className="glass-card p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {location.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{location.city || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEdit(location)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      {/* Location Form Dialog */}
      <Dialog open={showLocationForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Edit Location" : "Add New Location"}
            </DialogTitle>
          </DialogHeader>
          <LocationForm
            location={editingLocation}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}