import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRoleSchema, insertUserProfileSchema, type Role, type UserProfile, type User } from "@shared/schema";
import { z } from "zod";
import { Users, Shield, UserPlus, Edit, Trash2, Settings, CheckCircle, XCircle, Eye, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const moduleOptions = [
  { value: "dashboard", label: "Dashboard" },
  { value: "production", label: "Production" },
  { value: "inventory", label: "Inventory" },
  { value: "financial", label: "Financial" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "HR Management" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "locations", label: "Locations" },
  { value: "tasks", label: "Tasks" },
  { value: "users", label: "User Management" },
];

const permissionOptions = [
  { value: "create", label: "Create" },
  { value: "read", label: "Read" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "manage_users", label: "Manage Users" },
  { value: "manage_roles", label: "Manage Roles" },
  { value: "export_data", label: "Export Data" },
  { value: "system_settings", label: "System Settings" },
  { value: "manage_production", label: "Manage Production" },
  { value: "quality_control", label: "Quality Control" },
  { value: "manage_sales", label: "Manage Sales" },
  { value: "customer_support", label: "Customer Support" },
  { value: "manage_hr", label: "Manage HR" },
  { value: "payroll", label: "Payroll" },
  { value: "manage_finance", label: "Manage Finance" },
  { value: "financial_reports", label: "Financial Reports" },
];

export default function RolesManagement() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserProfileDialogOpen, setIsUserProfileDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  // Fetch users with roles
  const { data: users = [], isLoading: usersLoading } = useQuery<(User & { role?: Role; profile?: UserProfile })[]>({
    queryKey: ["/api/users-with-roles"],
  });

  // Role form
  const roleForm = useForm({
    resolver: zodResolver(insertRoleSchema.extend({
      permissions: z.array(z.string()).min(1, "At least one permission is required"),
      moduleAccess: z.array(z.string()).min(1, "At least one module access is required"),
    })),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      permissions: [],
      moduleAccess: [],
      isActive: true,
      isSystemRole: false,
    },
  });

  // User profile form
  const userProfileForm = useForm({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {
      userId: undefined,
      department: "",
      position: "",
      phoneNumber: "",
      emergencyContact: "",
      emergencyPhone: "",
      address: "",
      bio: "",
      preferredLanguage: "en",
      timezone: "Asia/Kathmandu",
      isActive: true,
    },
  });

  // Create/Update role mutation
  const roleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertRoleSchema>) => {
      if (selectedRole) {
        return apiRequest("PATCH", `/api/roles/${selectedRole.id}`, data);
      } else {
        return apiRequest("POST", "/api/roles", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsRoleDialogOpen(false);
      setSelectedRole(null);
      roleForm.reset();
      toast({
        title: "Success",
        description: selectedRole ? "Role updated successfully" : "Role created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save role",
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  // Create user profile mutation
  const userProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertUserProfileSchema>) => {
      return apiRequest("POST", "/api/user-profiles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users-with-roles"] });
      setIsUserProfileDialogOpen(false);
      userProfileForm.reset();
      toast({
        title: "Success",
        description: "User profile created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user profile",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number; roleId: number }) => {
      return apiRequest("PATCH", `/api/users/${userId}/role`, { roleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users-with-roles"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const handleCreateRole = () => {
    setSelectedRole(null);
    roleForm.reset();
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    roleForm.reset({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
      permissions: role.permissions || [],
      moduleAccess: role.moduleAccess || [],
      isActive: role.isActive,
      isSystemRole: role.isSystemRole,
    });
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystemRole) {
      toast({
        title: "Error",
        description: "Cannot delete system roles",
        variant: "destructive",
      });
      return;
    }
    if (window.confirm("Are you sure you want to delete this role?")) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const handleAssignRole = (userId: number, roleId: number) => {
    updateUserRoleMutation.mutate({ userId, roleId });
  };

  return (
    <div className="glass-container p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Role Management
            </h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
        </div>
        <Button onClick={handleCreateRole} className="modern-button">
          <UserPlus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="modern-tabs">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Assignment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          {rolesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass-card animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <Card key={role.id} className="glass-card hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {role.isSystemRole && <Crown className="w-4 h-4 text-yellow-500" />}
                        <CardTitle className="text-lg">{role.displayName}</CardTitle>
                      </div>
                      <Badge variant={role.isActive ? "default" : "secondary"} className="status-badge">
                        {role.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {role.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Modules Access:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.moduleAccess?.slice(0, 3).map((module) => (
                          <Badge key={module} variant="outline" className="text-xs">
                            {moduleOptions.find(m => m.value === module)?.label || module}
                          </Badge>
                        ))}
                        {(role.moduleAccess?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(role.moduleAccess?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permissionOptions.find(p => p.value === permission)?.label || permission}
                          </Badge>
                        ))}
                        {(role.permissions?.length || 0) > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(role.permissions?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      {!role.isSystemRole && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {usersLoading ? (
            <div className="glass-card p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card">
              <CardHeader>
                <CardTitle>User Role Assignments</CardTitle>
                <p className="text-gray-600">Assign roles to users and manage their access</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {(user.firstName?.[0] || user.username[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName || user.username}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {user.role && (
                          <Badge variant={user.role.isSystemRole ? "default" : "secondary"}>
                            {user.role.isSystemRole && <Crown className="w-3 h-3 mr-1" />}
                            {user.role.displayName}
                          </Badge>
                        )}
                        <Select
                          value={user.roleId?.toString() || ""}
                          onValueChange={(roleId) => handleAssignRole(user.id, parseInt(roleId))}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                <div className="flex items-center gap-2">
                                  {role.isSystemRole && <Crown className="w-3 h-3 text-yellow-500" />}
                                  {role.displayName}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Role Create/Edit Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRole ? "Edit Role" : "Create New Role"}</DialogTitle>
          </DialogHeader>
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit((data) => roleMutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={roleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., production_manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={roleForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Production Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={roleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Role description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={roleForm.control}
                name="moduleAccess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Access</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {moduleOptions.map((module) => (
                        <FormControl key={module.value}>
                          <label className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(module.value) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, module.value]);
                                } else {
                                  field.onChange(currentValue.filter(v => v !== module.value));
                                }
                              }}
                            />
                            <span className="text-sm">{module.label}</span>
                          </label>
                        </FormControl>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={roleForm.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {permissionOptions.map((permission) => (
                        <FormControl key={permission.value}>
                          <label className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(permission.value) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, permission.value]);
                                } else {
                                  field.onChange(currentValue.filter(v => v !== permission.value));
                                }
                              }}
                            />
                            <span className="text-sm">{permission.label}</span>
                          </label>
                        </FormControl>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={roleForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Role</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={roleForm.control}
                  name="isSystemRole"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={selectedRole?.isSystemRole}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>System Role (Cannot be deleted)</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={roleMutation.isPending}>
                  {roleMutation.isPending ? "Saving..." : selectedRole ? "Update Role" : "Create Role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}