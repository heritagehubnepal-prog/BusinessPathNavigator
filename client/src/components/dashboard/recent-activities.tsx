import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { Activity } from "@shared/schema";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "batch_created":
    case "batch_updated":
      return "bg-success";
    case "income_added":
      return "bg-accent";
    case "expense_added":
      return "bg-warning";
    case "milestone_completed":
      return "bg-primary";
    default:
      return "bg-gray-400";
  }
};

export default function RecentActivities() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activities</p>
          ) : (
            activities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${getActivityIcon(activity.type)}`} />
                <div>
                  <p className="text-sm font-medium text-slate">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.createdAt || 0), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
