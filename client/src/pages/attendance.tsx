import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, AlertCircle, CheckCircle, Calendar, User, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import Header from "@/components/layout/header";

interface TodayAttendance {
  id?: number;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  status: string;
}

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get today's attendance record
  const { data: todayAttendance, isLoading } = useQuery<TodayAttendance>({
    queryKey: ["/api/attendance/today"],
    enabled: !!user,
  });

  // Check in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      return apiRequest("POST", "/api/attendance/check-in");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Checked In Successfully",
        description: `Welcome! You've clocked in at ${format(new Date(), "HH:mm")}`,
      });
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Check In Failed",
        description: error.message || "Failed to check in. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  // Check out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      return apiRequest("POST", "/api/attendance/check-out");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Checked Out Successfully",
        description: `You've clocked out at ${format(new Date(), "HH:mm")}. Total hours: ${data.hoursWorked?.toFixed(2) || 0}`,
      });
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Check Out Failed",
        description: error.message || "Failed to check out. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleCheckIn = () => {
    checkInMutation.mutate();
  };

  const handleCheckOut = () => {
    if (!todayAttendance?.checkIn) {
      toast({
        title: "Cannot Check Out",
        description: "You must check in first before checking out.",
        variant: "destructive",
      });
      return;
    }
    checkOutMutation.mutate();
  };

  if (!user) return null;

  const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const isCheckedOut = todayAttendance?.checkIn && todayAttendance?.checkOut;
  const canCheckOut = todayAttendance?.checkIn && !todayAttendance?.checkOut;

  if (isLoading) {
    return (
      <div>
        <Header 
          title="Attendance Management" 
          subtitle="Track your daily work hours and attendance"
        />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading attendance data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="🕒 Attendance Management" 
        subtitle="Track your daily work hours and manage attendance"
      />
      
      <main className="p-6 space-y-8">
        {/* Current Status Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-emerald-200/50 dark:border-emerald-700/50 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                <Clock className="h-8 w-8 text-emerald-600" />
                Today's Attendance
              </CardTitle>
              <p className="text-muted-foreground">
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="flex items-center justify-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <User className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">{user.firstName} {user.lastName}</span>
                <Badge variant="outline">{user.employeeId}</Badge>
              </div>

              {/* Status Display */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg font-medium">Current Status:</span>
                  <Badge 
                    variant={isCheckedOut ? "default" : isCheckedIn ? "secondary" : "outline"}
                    className="text-base px-4 py-2"
                  >
                    {isCheckedOut ? (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Day Completed</>
                    ) : isCheckedIn ? (
                      <><AlertCircle className="h-4 w-4 mr-2" /> Currently Working</>
                    ) : (
                      <><Clock className="h-4 w-4 mr-2" /> Not Started</>
                    )}
                  </Badge>
                </div>

                {/* Time Display */}
                {(todayAttendance?.checkIn || todayAttendance?.checkOut) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {todayAttendance.checkIn && (
                      <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">Check In</div>
                        <div className="text-xl font-bold text-emerald-600">
                          {format(new Date(todayAttendance.checkIn), "HH:mm")}
                        </div>
                      </div>
                    )}
                    {todayAttendance.checkOut && (
                      <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">Check Out</div>
                        <div className="text-xl font-bold text-red-600">
                          {format(new Date(todayAttendance.checkOut), "HH:mm")}
                        </div>
                      </div>
                    )}
                    {todayAttendance.hoursWorked && (
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">Hours Worked</div>
                        <div className="text-xl font-bold text-blue-600">
                          {Number(todayAttendance.hoursWorked).toFixed(2)}h
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-6">
                {!isCheckedIn && !isCheckedOut && (
                  <Button
                    onClick={handleCheckIn}
                    disabled={isProcessing || checkInMutation.isPending}
                    className="px-8 py-3 text-lg bg-emerald-600 hover:bg-emerald-700"
                    size="lg"
                  >
                    <LogIn className="h-5 w-5 mr-3" />
                    Check In
                  </Button>
                )}

                {canCheckOut && (
                  <Button
                    onClick={handleCheckOut}
                    disabled={isProcessing || checkOutMutation.isPending}
                    variant="outline"
                    className="px-8 py-3 text-lg border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    size="lg"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Check Out
                  </Button>
                )}

                {isCheckedOut && (
                  <div className="flex items-center justify-center px-8 py-3 text-lg text-muted-foreground">
                    <CheckCircle className="h-5 w-5 mr-3 text-emerald-600" />
                    Work Day Completed
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center text-sm text-muted-foreground mt-6">
                {!todayAttendance?.checkIn && (
                  <p>Click "Check In" to start your work day and begin tracking hours</p>
                )}
                {canCheckOut && (
                  <p>Don't forget to check out when you finish your work for accurate time tracking</p>
                )}
                {isCheckedOut && (
                  <p>Thank you for your work today! Have a great rest of your day.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Attendance Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <span>Check in when you arrive at work to start tracking your hours</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <span>You must check in before you can check out</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <span>Check out when leaving to finalize your work hours</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <span>All attendance actions are logged for payroll and compliance</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                Company Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span>Regular work hours: 9:00 AM - 6:00 PM, Monday to Friday</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span>Overtime hours beyond 8 hours per day require approval</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span>Attendance data is used for payroll calculation</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span>Contact HR for attendance-related questions or issues</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}