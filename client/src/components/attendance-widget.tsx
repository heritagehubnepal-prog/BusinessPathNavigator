import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface TodayAttendance {
  id?: number;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  status: string;
}

export default function AttendanceWidget() {
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

  return (
    <Card className="glass-card border-emerald-200/50 dark:border-emerald-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-emerald-600" />
          Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Today's Status:</span>
          <Badge variant={isCheckedOut ? "default" : isCheckedIn ? "secondary" : "outline"}>
            {isCheckedOut ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
            ) : isCheckedIn ? (
              <><AlertCircle className="h-3 w-3 mr-1" /> Working</>
            ) : (
              <><Clock className="h-3 w-3 mr-1" /> Not Started</>
            )}
          </Badge>
        </div>

        {/* Time Display */}
        {(todayAttendance?.checkIn || todayAttendance?.checkOut) && (
          <div className="space-y-2 text-sm">
            {todayAttendance.checkIn && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check In:</span>
                <span className="font-medium">
                  {format(new Date(todayAttendance.checkIn), "HH:mm")}
                </span>
              </div>
            )}
            {todayAttendance.checkOut && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check Out:</span>
                <span className="font-medium">
                  {format(new Date(todayAttendance.checkOut), "HH:mm")}
                </span>
              </div>
            )}
            {todayAttendance.hoursWorked && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hours Worked:</span>
                <span className="font-medium">
                  {Number(todayAttendance.hoursWorked).toFixed(2)}h
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isCheckedIn && !isCheckedOut && (
            <Button
              onClick={handleCheckIn}
              disabled={isProcessing || checkInMutation.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}

          {canCheckOut && (
            <Button
              onClick={handleCheckOut}
              disabled={isProcessing || checkOutMutation.isPending}
              variant="outline"
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          )}

          {isCheckedOut && (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
              Day Completed
            </div>
          )}
        </div>

        {/* Instructions */}
        {!todayAttendance?.checkIn && (
          <p className="text-xs text-muted-foreground text-center">
            Click "Check In" to start your work day
          </p>
        )}
        {canCheckOut && (
          <p className="text-xs text-muted-foreground text-center">
            Remember to check out when you finish work
          </p>
        )}
      </CardContent>
    </Card>
  );
}