import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, Mail, Lock, User, UserPlus, LogIn, Shield, CheckCircle, AlertCircle, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Role } from "@shared/schema";

const registerSchema = z.object({
  employeeId: z.string().min(3, "Employee ID must be at least 3 characters").regex(/^[A-Z0-9-]+$/, "Employee ID must contain only uppercase letters, numbers, and hyphens"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  roleId: z.coerce.number().min(1, "Please select a role"),
});

const loginSchema = z.object({
  emailOrEmployeeId: z.string().min(1, "Email or Employee ID is required"),
  password: z.string().min(1, "Password is required"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch roles for registration
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  // Register form
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      employeeId: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      roleId: "",
    },
  });

  // Login form
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrEmployeeId: "",
      password: "",
    },
  });

  // Verify email form
  const verifyForm = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token: "",
    },
  });

  // Reset password form
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
    },
  });

  // Forgot password form
  const forgotForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerSchema>) => {
      return apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Registration Submitted",
        description: "Your registration has been submitted for administrator approval. You will receive an email once approved.",
      });
      registerForm.reset();
      setActiveTab("login");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      return apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Login Successful",
        description: "Welcome back to Mycopath!",
      });
      // Redirect to dashboard
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  // Verify email mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof verifyEmailSchema>) => {
      return apiRequest("POST", "/api/auth/verify-email", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Email Verified",
        description: response.message || "Your email has been verified successfully!",
      });
      verifyForm.reset();
      setActiveTab("login");
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid or expired token",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resetPasswordSchema>) => {
      return apiRequest("POST", "/api/auth/reset-password", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Password Reset",
        description: response.message || "Your password has been reset successfully!",
      });
      resetForm.reset();
      setActiveTab("login");
    },
    onError: (error) => {
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Invalid or expired token",
        variant: "destructive",
      });
    },
  });

  // Forgot password mutation
  const forgotMutation = useMutation({
    mutationFn: async (data: z.infer<typeof forgotPasswordSchema>) => {
      return apiRequest("POST", "/api/auth/forgot-password", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Reset Email Sent",
        description: response.message || "Please check your email for reset instructions.",
      });
      forgotForm.reset();
      setActiveTab("reset");
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sprout className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            Mycopath
          </h1>
          <p className="text-gray-600 mt-2">🍄 Mushroom Innovation Lab - Nepal</p>
        </div>

        <Card className="glass-card shadow-2xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
                  <p className="text-gray-600 text-sm">Sign in to your account</p>
                </div>
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="emailOrEmployeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email or Employee ID</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input placeholder="your@email.com or EMP-001" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input type="password" placeholder="Your password" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full modern-button" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab("forgot")}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Create Account</h2>
                  <p className="text-gray-600 text-sm">Join the Mycopath team</p>
                </div>

                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={registerForm.control}
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
                        control={registerForm.control}
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
                      control={registerForm.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ID</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input 
                                placeholder="e.g. MYC-001, EMP-2025-001" 
                                className="pl-10 font-mono" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter the Employee ID provided by HR Department during onboarding
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input placeholder="your@email.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input type="password" placeholder="Create password" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="roleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-gray-400" />
                                  <SelectValue placeholder="Select your role" />
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

                    <Button 
                      type="submit" 
                      className="w-full modern-button" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Additional tabs for verification, reset, etc. */}
              <TabsContent value="verify" className="space-y-4">
                <div className="text-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h2 className="text-xl font-semibold text-gray-800">Verify Email</h2>
                  <p className="text-gray-600 text-sm">Enter the verification token from your email</p>
                </div>

                <Form {...verifyForm}>
                  <form onSubmit={verifyForm.handleSubmit((data) => verifyMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={verifyForm.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Token</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter token from email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full modern-button" 
                      disabled={verifyMutation.isPending}
                    >
                      {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="forgot" className="space-y-4">
                <div className="text-center mb-4">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
                  <p className="text-gray-600 text-sm">Enter your email to receive reset instructions</p>
                </div>

                <Form {...forgotForm}>
                  <form onSubmit={forgotForm.handleSubmit((data) => forgotMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={forgotForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input placeholder="your@email.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full modern-button" 
                      disabled={forgotMutation.isPending}
                    >
                      {forgotMutation.isPending ? "Sending..." : "Send Reset Email"}
                    </Button>
                  </form>
                </Form>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab("login")}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Back to Login
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="reset" className="space-y-4">
                <div className="text-center mb-4">
                  <Lock className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h2 className="text-xl font-semibold text-gray-800">New Password</h2>
                  <p className="text-gray-600 text-sm">Enter the token and your new password</p>
                </div>

                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit((data) => resetMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={resetForm.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reset Token</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter token from email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input type="password" placeholder="Enter new password" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full modern-button" 
                      disabled={resetMutation.isPending}
                    >
                      {resetMutation.isPending ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>🇳🇵 From Nepal's Mountains to Sustainable Innovation</p>
        </div>
      </div>
    </div>
  );
}