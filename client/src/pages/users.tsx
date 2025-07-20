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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Users, Mail, User, Lock, Shield, Eye, EyeOff, CheckCircle, XCircle, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType, Role } from "@shared/schema";

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  roleId: z.coerce.number().min(1, "Please select a role"),
});

export default function UsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  // Fetch roles for dropdown
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  // Create user form
  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      roleId: "",
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
        description: "The user has been created and verification email has been sent.",
      });
      form.reset();
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create User",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  // Resend verification email mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/auth/resend-verification", { email });
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "A new verification email has been sent to the user.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Email",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role?.displayName || "Unknown Role";
  };

  const getRoleBadgeColor = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return "secondary";
    if (role.name === "admin") return "destructive";
    if (role.name === "manager") return "default";
    return "secondary";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage user accounts and permissions for your team
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="modern-button">
              <UserPlus className="w-4 h-4 mr-2" />
              Create New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Create New User
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input placeholder="Choose username" className="pl-10" {...field} />
                        </div>
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
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input placeholder="user@mycopath.com.np" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Create password" 
                            className="pl-10 pr-10" 
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 w-4 h-4 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-gray-400" />
                              <SelectValue placeholder="Select role" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="modern-button" 
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Users Found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first user account.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="modern-button">
                <UserPlus className="w-4 h-4 mr-2" />
                Create First User
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeColor(user.roleId)}>
                        {getRoleName(user.roleId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.isEmailVerified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-amber-600">Pending</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!user.isEmailVerified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendVerificationMutation.mutate(user.email)}
                            disabled={resendVerificationMutation.isPending}
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Resend
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.isEmailVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => !u.isEmailVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}