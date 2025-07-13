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
    <div className="min-h-screen">
      <Header 
        title="🎯 Tasks & Milestones" 
        subtitle="Track progress, complete objectives, and earn milestone bonuses."
        actionLabel="+ Add Task"
        onAction={() => setShowTaskForm(true)}
      />
      
      <main className="p-6 space-y-8">
        {/* Summary Stats with Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Completed Milestones</p>
                <p className="text-2xl font-bold text-slate">{completedMilestones.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Bonus Earned</p>
                <p className="text-2xl font-bold text-slate">NPR {totalBonusEarned.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Active Tasks</p>
                <p className="text-2xl font-bold text-slate">{pendingTasks.length + inProgressTasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Completed</p>
                <p className="text-2xl font-bold text-slate">{completedTasks.length}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="milestones" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="milestones" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">🏆 Milestones</TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">📋 Tasks</TabsTrigger>
          </TabsList>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate">🏆 Milestone Progress Tracker</h3>
              <Button onClick={() => setShowMilestoneForm(true)} className="btn-modern">
                + Add Milestone
              </Button>
            </div>

            {/* Milestone Progress Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {milestonesLoading ? (
                <div className="glass-card p-6 col-span-2">
                  <p className="text-gray-500">Loading milestones...</p>
                </div>
              ) : milestones.length === 0 ? (
                <div className="glass-card p-6 col-span-2">
                  <p className="text-gray-500">No milestones found</p>
                </div>
              ) : (
                milestones.map((milestone) => {
                  const progressPercentage = Math.min(
                    Math.round((parseFloat(milestone.currentValue || "0") / parseFloat(milestone.targetValue || "1")) * 100),
                    100
                  );
                  
                  return (
                    <div key={milestone.id} className="glass-card card-hover p-6 relative overflow-hidden">
                      {milestone.status === 'completed' && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center pulse-green">
                            <Trophy className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg glow-effect ${getMilestoneIconBg(milestone.status)}`}>
                          {getMilestoneIcon(milestone.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-lg gradient-text">{milestone.name}</h4>
                            <span className={`${milestone.status === 'completed' ? 'status-badge-completed' : milestone.status === 'in_progress' ? 'status-badge-progress' : 'status-badge-pending'} shimmer`}>
                              {milestone.status.replace("_", " ").charAt(0).toUpperCase() + milestone.status.replace("_", " ").slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{milestone.description}</p>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                              <span>Progress</span>
                              <span>{progressPercentage}%</span>
                            </div>
                            <div className="progress-bar h-3">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div className="glass-morphism p-3 rounded-xl">
                              <p className="text-gray-500 text-xs mb-1">Target</p>
                              <p className="font-bold text-slate">{milestone.targetValue}</p>
                            </div>
                            <div className="glass-morphism p-3 rounded-xl">
                              <p className="text-gray-500 text-xs mb-1">Current</p>
                              <p className="font-bold text-slate">{milestone.currentValue}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border border-green-200">
                              <p className="text-xs text-green-600 mb-1 font-medium">🎁 Bonus Reward</p>
                              <p className="font-bold text-lg text-green-700">NPR {parseFloat(milestone.bonusAmount || "0").toLocaleString()}</p>
                            </div>
                            {milestone.status !== "completed" && (
                              <Button
                                onClick={() => updateMilestoneMutation.mutate({ id: milestone.id, status: "completed" })}
                                disabled={updateMilestoneMutation.isPending}
                                className="btn-modern relative overflow-hidden"
                              >
                                <Trophy className="w-4 h-4 mr-2" />
                                Complete
                              </Button>
                            )}
                          </div>
                          
                          {milestone.responsible && (
                            <div className="mt-4 text-xs bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-xl">
                              <span className="font-semibold text-amber-700">👤 Responsible:</span> 
                              <span className="text-amber-600 ml-1">{milestone.responsible}</span>
                            </div>
                          )}
                          
                          {milestone.targetDate && (
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>Due: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Background decoration */}
                      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full opacity-20"></div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="table-modern">
              <div className="table-header p-4">
                <h3 className="text-lg font-semibold text-slate">📋 All Tasks</h3>
              </div>
              <div className="p-4">
                {tasksLoading ? (
                  <p className="text-gray-500">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <p className="text-gray-500">No tasks found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="table-header">
                        <TableHead className="font-semibold">Task</TableHead>
                        <TableHead className="font-semibold">Priority</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Assigned To</TableHead>
                        <TableHead className="font-semibold">Due Date</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id} className="table-row">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate">{task.title}</p>
                              {task.description && (
                                <p className="text-sm text-gray-600">{task.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`${task.priority === 'high' ? 'status-badge-pending' : task.priority === 'medium' ? 'status-badge-progress' : 'status-badge-completed'}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`${task.status === 'completed' ? 'status-badge-completed' : task.status === 'in_progress' ? 'status-badge-progress' : 'status-badge-pending'}`}>
                              {task.status.replace("_", " ").charAt(0).toUpperCase() + task.status.replace("_", " ").slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600">{task.assignedTo || "-"}</TableCell>
                          <TableCell className="text-gray-600">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {task.status !== "completed" && (
                                <Button
                                  onClick={() => updateTaskMutation.mutate({ 
                                    id: task.id, 
                                    status: task.status === "pending" ? "in_progress" : "completed" 
                                  })}
                                  disabled={updateTaskMutation.isPending}
                                  className="btn-secondary-modern text-xs py-1 px-3"
                                >
                                  {task.status === "pending" ? "▶ Start" : "✓ Complete"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <TaskForm open={showTaskForm} onOpenChange={setShowTaskForm} />
      <MilestoneForm open={showMilestoneForm} onOpenChange={setShowMilestoneForm} />
    </div>
  );
}
