import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, Trophy } from "lucide-react";
import { Link } from "wouter";
import type { Milestone } from "@shared/schema";

const getMilestoneIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <Check className="text-white text-sm" />;
    case "in_progress":
      return <span className="text-white text-sm font-bold">75%</span>;
    default:
      return <Clock className="text-gray-600 text-sm" />;
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

export default function MilestoneTracker() {
  const { data: milestones = [], isLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  const totalBonusEarned = milestones
    .filter(m => m.status === "completed")
    .reduce((sum, m) => sum + parseFloat(m.bonusAmount || "0"), 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Milestone Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading milestones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Milestone Tracker</CardTitle>
          <Link href="/tasks">
            <a className="text-primary text-sm font-medium hover:text-primary/80">Manage</a>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.slice(0, 5).map((milestone) => (
            <div key={milestone.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMilestoneIconBg(milestone.status)}`}>
                {getMilestoneIcon(milestone.status)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate">{milestone.name}</p>
                <p className={`text-sm ${
                  milestone.status === "completed" 
                    ? "text-success" 
                    : "text-gray-600"
                }`}>
                  {milestone.status === "completed" 
                    ? `Completed • Bonus: NPR ${parseFloat(milestone.bonusAmount || "0").toLocaleString()}`
                    : `${milestone.currentValue} • Bonus: NPR ${parseFloat(milestone.bonusAmount || "0").toLocaleString()}`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-accent bg-opacity-5 rounded-lg border border-accent border-opacity-20">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="text-accent" />
            <span className="font-medium text-accent">Total Bonus Pool</span>
          </div>
          <p className="text-2xl font-bold text-accent">NPR {totalBonusEarned.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Earned this year</p>
        </div>
      </CardContent>
    </Card>
  );
}
