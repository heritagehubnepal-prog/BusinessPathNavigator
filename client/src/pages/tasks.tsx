import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, Trophy, Calendar, AlertCircle } from "lucide-react";
import TaskForm from "@/components/forms/task-form";
import MilestoneForm from "@/components/forms/milestone-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Task, Milestone } from "@shared/schema";

const getTaskStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-success text-success-foreground";
    case "in_progress":
      return "bg-primary text-primary-foreground";
    case "pending":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getMilestoneStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-success text-success-foreground";
    case "in_progress":
      return "bg-primary text-primary-foreground";
    case "pending":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-destructive text-destructive-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-success text-success-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getMilestoneIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <Check className="text-white text-sm" />;
    case "in_progress":
      return <Clock className="text-white text-sm" />;
    default:
      return <AlertCircle className="text-gray-600 text-sm" />;
  }
};

const getMilestoneIconBg = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-success";
    case "in_progress":
      return "bg-primary";
    default:
      return "bg-gray-300";
  }
};

export default function Tasks() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const updateData: any = { status };
      if (status === "completed") {
        updateData.completedDate = new Date();
      }
      const response = await apiRequest("PATCH", `/api/milestones/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({
        title: "Success",
        description: "Milestone status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update milestone status",
        variant: "destructive",
      });
    },
  });

  const completedMilestones = milestones.filter(m => m.status === "completed");
  const totalBonusEarned = completedMilestones.reduce((sum, m) => sum + parseFloat(m.bonusAmount || "0"), 0);

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div>
      <Header 
        title="Tasks & Milestones" 
        subtitle="Manage daily tasks and track milestone achievements."
        actionLabel="Add Task"
        onAction={() => setShowTaskForm(true)}
      />
      
      <main className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Completed Milestones</span>
              </div>
              <div className="text-2xl font-bold text-slate">{completedMilestones.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Total Bonus Earned</span>
              </div>
              <div className="text-2xl font-bold text-slate">NPR {totalBonusEarned.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Active Tasks</span>
              </div>
              <div className="text-2xl font-bold text-slate">{pendingTasks.length + inProgressTasks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-success">Completed Tasks</span>
              </div>
              <div className="text-2xl font-bold text-slate">{completedTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="milestones" className="space-y-6">
          <TabsList>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate">Milestone Tracker</h3>
              <Button onClick={() => setShowMilestoneForm(true)}>
                Add Milestone
              </Button>
            </div>

            {/* Milestone Progress Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {milestonesLoading ? (
                <Card className="col-span-2">
                  <CardContent className="p-6">
                    <p className="text-gray-500">Loading milestones...</p>
                  </CardContent>
                </Card>
              ) : milestones.length === 0 ? (
                <Card className="col-span-2">
                  <CardContent className="p-6">
                    <p className="text-gray-500">No milestones found</p>
                  </CardContent>
                </Card>
              ) : (
                milestones.map((milestone) => (
                  <Card key={milestone.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getMilestoneIconBg(milestone.status)}`}>
                          {getMilestoneIcon(milestone.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-slate">{milestone.name}</h4>
                            <Badge className={getMilestoneStatusColor(milestone.status)}>
                              {milestone.status.replace("_", " ").charAt(0).toUpperCase() + milestone.status.replace("_", " ").slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Target</p>
                              <p className="font-medium">{milestone.targetValue}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Current</p>
                              <p className="font-medium">{milestone.currentValue}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Bonus Amount</p>
                              <p className="font-medium text-accent">NPR {parseFloat(milestone.bonusAmount || "0").toLocaleString()}</p>
                            </div>
                            {milestone.status !== "completed" && (
                              <Button
                                size="sm"
                                onClick={() => updateMilestoneMutation.mutate({ id: milestone.id, status: "completed" })}
                                disabled={updateMilestoneMutation.isPending}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                          
                          {milestone.responsible && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Responsible: {milestone.responsible}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <p className="text-gray-500">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <p className="text-gray-500">No tasks found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{task.title}</p>
                              {task.description && (
                                <p className="text-sm text-gray-600">{task.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTaskStatusColor(task.status)}>
                              {task.status.replace("_", " ").charAt(0).toUpperCase() + task.status.replace("_", " ").slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{task.assignedTo || "-"}</TableCell>
                          <TableCell>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {task.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateTaskMutation.mutate({ 
                                    id: task.id, 
                                    status: task.status === "pending" ? "in_progress" : "completed" 
                                  })}
                                  disabled={updateTaskMutation.isPending}
                                >
                                  {task.status === "pending" ? "Start" : "Complete"}
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
          </TabsContent>
        </Tabs>
      </main>

      <TaskForm open={showTaskForm} onOpenChange={setShowTaskForm} />
      <MilestoneForm open={showMilestoneForm} onOpenChange={setShowMilestoneForm} />
    </div>
  );
}
