import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  Unlock, 
  Settings, 
  Edit, 
  Trash2,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType, Role } from "@shared/schema";

const createUserSchema = z.object({
  employeeId: z.string().min(3, "Employee ID must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  roleId: z.coerce.number().min(1, "Please select a role"),
});

const updateUserSchema = z.object({
  employeeId: z.string().min(3, "Employee ID must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  roleId: z.coerce.number().min(1, "Please select a role"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function UserManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deactivationReason, setDeactivationReason] = useState("");
  const { toast } = useToast();

  // Fetch users
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  // Fetch roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  // Filter users based on status
  const filteredUsers = users.filter(user => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return user.isActive && user.isApprovedByAdmin;
    if (filterStatus === "inactive") return !user.isActive;
    if (filterStatus === "pending") return !user.isApprovedByAdmin && user.registrationStatus === "pending";
    if (filterStatus === "rejected") return user.registrationStatus === "rejected";
    return true;
  });

  // Create user form
  const createForm = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      employeeId: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      roleId: "",
    },
  });

  // Update user form
  const updateForm = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      employeeId: "",
      email: "",
      firstName: "",
      lastName: "",
      roleId: "",
    },
  });

  // Reset password form
  const passwordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createUserSchema>) => {
      return apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      toast({
        title: "User Created Successfully",
        description: "The user has been created and is pending approval.",
      });
      createForm.reset();
      setIsCreateDialogOpen(false);
      refetchUsers();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create User",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: z.infer<typeof updateUserSchema> }) => {
      return apiRequest("PATCH", `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "User Updated Successfully",
        description: "The user information has been updated.",
      });
      setIsUpdateDialogOpen(false);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (error) => {
      toast({
        title: "Failed to Update User",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number; newPassword: string }) => {
      return apiRequest("POST", `/api/users/${userId}/reset-password`, { newPassword });
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Successfully",
        description: "The user's password has been reset.",
      });
      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
      passwordForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Reset Password",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Activate user mutation
  const activateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("POST", `/api/users/${userId}/activate`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Activated",
        description: "The user has been activated successfully.",
      });
      refetchUsers();
    },
    onError: (error) => {
      toast({
        title: "Failed to Activate User",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason?: string }) => {
      return apiRequest("POST", `/api/users/${userId}/deactivate`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "User Deactivated",
        description: "The user has been deactivated successfully.",
      });
      setIsDeactivateDialogOpen(false);
      setSelectedUser(null);
      setDeactivationReason("");
      refetchUsers();
    },
    onError: (error) => {
      toast({
        title: "Failed to Deactivate User",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const openUpdateDialog = (user: UserType) => {
    setSelectedUser(user);
    updateForm.reset({
      employeeId: user.employeeId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
    });
    setIsUpdateDialogOpen(true);
  };

  const openPasswordDialog = (user: UserType) => {
    setSelectedUser(user);
    passwordForm.reset();
    setIsPasswordDialogOpen(true);
  };

  const openDeactivateDialog = (user: UserType) => {
    setSelectedUser(user);
    setDeactivationReason("");
    setIsDeactivateDialogOpen(true);
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role?.displayName || "Unknown Role";
  };

  const getStatusBadge = (user: UserType) => {
    if (!user.isApprovedByAdmin && user.registrationStatus === "pending") {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
    if (user.registrationStatus === "rejected") {
      return <Badge variant="destructive"><UserX className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    if (!user.isActive) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600"><UserX className="w-3 h-3 mr-1" />Inactive</Badge>;
    }
    if (user.isActive && user.isApprovedByAdmin) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-green-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts, permissions, and access control
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MYC-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="user@mycopath.com.np" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createUserMutation.isPending} className="flex-1">
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.employeeId}</TableCell>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleName(user.roleId)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPasswordDialog(user)}
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                        {user.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeactivateDialog(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => activateUserMutation.mutate(user.id)}
                            className="text-green-600 hover:text-green-700"
                            disabled={activateUserMutation.isPending}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Update User Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update User Information</DialogTitle>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit((data) => 
              selectedUser && updateUserMutation.mutate({ userId: selectedUser.id, data })
            )} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MYC-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={updateForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@mycopath.com.np" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateUserMutation.isPending} className="flex-1">
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit((data) => 
              selectedUser && resetPasswordMutation.mutate({ userId: selectedUser.id, newPassword: data.newPassword })
            )} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={resetPasswordMutation.isPending} className="flex-1">
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Deactivate User Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate User Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Account Deactivation</p>
                <p className="text-sm text-yellow-600">
                  This user will lose access to all system features when deactivated.
                </p>
              </div>
            </div>
            {selectedUser && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm text-gray-600">{selectedUser.employeeId} • {selectedUser.email}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Reason for Deactivation (Optional)</label>
              <Textarea
                placeholder="e.g., Employee left company, security violation, etc."
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={() => selectedUser && deactivateUserMutation.mutate({
                  userId: selectedUser.id,
                  reason: deactivationReason || undefined
                })}
                disabled={deactivateUserMutation.isPending}
                className="flex-1"
              >
                {deactivateUserMutation.isPending ? "Deactivating..." : "Deactivate User"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}